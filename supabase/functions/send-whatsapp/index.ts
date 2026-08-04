// Edge Function: send-whatsapp
//
// Envoie un message WhatsApp via Twilio.
//
// Cette fonction renvoyait auparavant 200 dans TOUS les cas — y compris quand
// Twilio n'était pas configuré ou refusait l'envoi. Les appelants en déduisaient
// « whatsapp_sent: true » alors qu'aucun message ne partait. Elle reflète
// désormais le résultat réel :
//   503  passerelle non configurée (secrets Twilio absents)
//   502  Twilio a refusé l'envoi (le motif est renvoyé et journalisé)
//   200  message accepté par Twilio, avec son SID

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? ""
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? ""
const FROM = Deno.env.get("WHATSAPP_FROM") ?? ""

type Envoi = { ok: boolean; httpStatus: number; sid?: string; status?: string; erreur?: string }

async function appelTwilio(to: string, message: string): Promise<Envoi> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  const body = new URLSearchParams({ From: FROM, To: `whatsapp:${to}`, Body: message })
  const headers = {
    Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
    "Content-Type": "application/x-www-form-urlencoded",
  }

  let res = await fetch(url, { method: "POST", headers, body })

  // Une limitation de débit est temporaire : on retente une fois.
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000))
    res = await fetch(url, { method: "POST", headers, body })
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    // Twilio renvoie { code, message } en cas de refus.
    const motif = data?.message ?? `HTTP ${res.status}`
    console.error(`twilio: envoi refusé (${data?.code ?? "?"}) — ${motif}`)
    return { ok: false, httpStatus: 502, erreur: motif }
  }

  return { ok: true, httpStatus: 200, sid: data.sid, status: data.status }
}

serve(async (req) => {
  try {
    const { to, message, org_id } = await req.json()

    if (!to || !message) {
      return new Response(JSON.stringify({ error: "to et message requis" }), { status: 400 })
    }

    // Sans identifiants, aucun message ne peut partir : on le dit franchement
    // plutôt que de laisser l'appelant croire à un envoi.
    if (!TWILIO_SID || !TWILIO_TOKEN || !FROM) {
      console.error("twilio: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / WHATSAPP_FROM manquants")
      return new Response(
        JSON.stringify({ error: "Passerelle WhatsApp non configurée", sent: false }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      )
    }

    const envoi = await appelTwilio(to, message)

    if (org_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      )
      await supabase.from("activity_logs").insert({
        org_id,
        action: "send_whatsapp",
        entity_type: "notification",
        metadata: {
          to, sent: envoi.ok,
          message_sid: envoi.sid ?? null,
          status: envoi.status ?? null,
          erreur: envoi.erreur ?? null,
        },
      })
    }

    return new Response(
      JSON.stringify(
        envoi.ok
          ? { sent: true, sid: envoi.sid, status: envoi.status }
          : { sent: false, error: envoi.erreur }
      ),
      { status: envoi.httpStatus, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message, sent: false }), { status: 500 })
  }
})
