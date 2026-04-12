import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!
const FROM = Deno.env.get("WHATSAPP_FROM")!

async function sendWhatsApp(to: string, message: string): Promise<{ sid: string; status: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  const body = new URLSearchParams({
    From: FROM,
    To: `whatsapp:${to}`,
    Body: message,
  })

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  const data = await res.json()

  if (!res.ok && res.status === 429) {
    // Retry once on rate limit
    await new Promise((r) => setTimeout(r, 2000))
    const retry = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })
    return retry.json()
  }

  return data
}

serve(async (req) => {
  try {
    const { to, message, org_id } = await req.json()

    if (!to || !message) {
      return new Response(JSON.stringify({ error: "to et message requis" }), { status: 400 })
    }

    const result = await sendWhatsApp(to, message)

    // Log dans activity_logs
    if (org_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      )

      await supabase.from("activity_logs").insert({
        org_id,
        action: "send_whatsapp",
        entity_type: "notification",
        metadata: { to, message_sid: result.sid, status: result.status },
      })
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 })
  }
})
