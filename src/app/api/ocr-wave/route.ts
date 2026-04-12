import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"

// POST /api/ocr-wave
// Reçoit un screenshot Wave/OM depuis le front, l'upload dans Supabase Storage,
// puis appelle l'Edge Function extract-wave-payment pour OCR
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const orgId = formData.get("org_id") as string | null

    if (!file || !orgId) {
      return NextResponse.json({ error: "file et org_id requis" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Upload to storage
    const fileName = `${orgId}/${Date.now()}-${file.name}`
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadErr } = await supabase.storage
      .from("payment-screenshots")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) {
      return NextResponse.json({ error: `Upload: ${uploadErr.message}` }, { status: 500 })
    }

    // Call Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const edgeRes = await fetch(`${supabaseUrl}/functions/v1/extract-wave-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        storage_path: fileName,
        org_id: orgId,
      }),
    })

    const result = await edgeRes.json()

    if (!edgeRes.ok) {
      return NextResponse.json({ error: result.error ?? "OCR failed" }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
