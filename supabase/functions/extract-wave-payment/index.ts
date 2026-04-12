// Edge Function: extract-wave-payment
// Utilise Claude Vision API pour extraire les données d'un screenshot Wave/OM
// Appelé via webhook ou depuis le dashboard

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface ExtractedPayment {
  amount: number
  sender: string | null
  receiver: string | null
  transaction_id: string | null
  date: string | null
  method: "wave" | "orange_money" | "unknown"
  confidence: number
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY non configurée" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Accept either base64 image or storage path
    const body = await req.json()
    const { image_base64, storage_path, org_id } = body

    let imageData: string
    let mediaType = "image/jpeg"

    if (image_base64) {
      imageData = image_base64
    } else if (storage_path) {
      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from("payment-screenshots")
        .download(storage_path)
      if (error) throw new Error(`Storage error: ${error.message}`)
      const arrayBuffer = await data.arrayBuffer()
      imageData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      if (storage_path.endsWith(".png")) mediaType = "image/png"
    } else {
      return new Response(
        JSON.stringify({ error: "image_base64 ou storage_path requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Call Claude Vision API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imageData,
                },
              },
              {
                type: "text",
                text: `Analyse cette capture d'écran d'un paiement mobile (Wave ou Orange Money) au Sénégal.
Extrais les informations suivantes en JSON strict:
{
  "amount": <montant en FCFA, nombre entier>,
  "sender": "<nom de l'envoyeur ou null>",
  "receiver": "<nom du destinataire ou null>",
  "transaction_id": "<identifiant de transaction ou null>",
  "date": "<date au format YYYY-MM-DD ou null>",
  "method": "<'wave' ou 'orange_money' ou 'unknown'>",
  "confidence": <score de confiance entre 0 et 1>
}
Retourne UNIQUEMENT le JSON, sans texte supplémentaire.`,
              },
            ],
          },
        ],
      }),
    })

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text()
      throw new Error(`Claude API error: ${err}`)
    }

    const claudeData = await claudeResponse.json()
    const textContent = claudeData.content?.[0]?.text ?? "{}"

    // Parse extracted data
    let extracted: ExtractedPayment
    try {
      extracted = JSON.parse(textContent)
    } catch {
      extracted = {
        amount: 0,
        sender: null,
        receiver: null,
        transaction_id: null,
        date: null,
        method: "unknown",
        confidence: 0,
      }
    }

    // Log extraction in activity_logs
    if (org_id) {
      await supabase.from("activity_logs").insert({
        org_id,
        action: "ocr_wave_extraction",
        metadata: {
          extracted,
          storage_path: storage_path ?? null,
        },
      })
    }

    return new Response(JSON.stringify({ success: true, data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
