// Edge Function: annual-report
// Génère un rapport annuel par organisation
// Peut être déclenché manuellement ou via pg_cron en janvier

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json().catch(() => ({}))
    const year = body.year ?? new Date().getFullYear() - 1
    const targetOrgId = body.org_id ?? null

    // Get orgs
    let orgsQuery = supabase.from("organizations").select("id, name")
    if (targetOrgId) {
      orgsQuery = orgsQuery.eq("id", targetOrgId)
    }
    const { data: orgs } = await orgsQuery

    const results = []

    for (const org of orgs ?? []) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      // Total payments
      const { data: payments } = await supabase
        .from("payments")
        .select("amount_fcfa, paid_at, method")
        .eq("org_id", org.id)
        .gte("paid_at", startDate)
        .lte("paid_at", `${endDate}T23:59:59`)

      const totalCollected = (payments ?? []).reduce((s, p) => s + p.amount_fcfa, 0)

      // Payment methods breakdown
      const methodBreakdown: Record<string, number> = {}
      for (const p of payments ?? []) {
        methodBreakdown[p.method] = (methodBreakdown[p.method] ?? 0) + p.amount_fcfa
      }

      // Monthly breakdown
      const monthlyBreakdown: Record<string, number> = {}
      for (const p of payments ?? []) {
        const month = p.paid_at.slice(0, 7) // YYYY-MM
        monthlyBreakdown[month] = (monthlyBreakdown[month] ?? 0) + p.amount_fcfa
      }

      // Total expected
      const { data: schedules } = await supabase
        .from("rent_schedules")
        .select("amount_fcfa, status")
        .eq("org_id", org.id)
        .gte("due_date", startDate)
        .lte("due_date", endDate)

      const totalExpected = (schedules ?? []).reduce((s, r) => s + r.amount_fcfa, 0)
      const lateCount = (schedules ?? []).filter((r) => r.status === "late").length
      const paidCount = (schedules ?? []).filter((r) => r.status === "paid").length

      // Properties & units
      const { count: propertyCount } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("org_id", org.id)

      const { count: unitCount } = await supabase
        .from("units")
        .select("id", { count: "exact", head: true })
        .eq("org_id", org.id)

      const { count: tenantCount } = await supabase
        .from("tenants")
        .select("id", { count: "exact", head: true })
        .eq("org_id", org.id)

      // Expenses
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount_fcfa, category")
        .eq("org_id", org.id)
        .gte("date", startDate)
        .lte("date", endDate)

      const totalExpenses = (expenses ?? []).reduce((s, e) => s + e.amount_fcfa, 0)

      const expensesByCategory: Record<string, number> = {}
      for (const e of expenses ?? []) {
        expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount_fcfa
      }

      const report = {
        org_id: org.id,
        org_name: org.name,
        year,
        total_collected: totalCollected,
        total_expected: totalExpected,
        recovery_rate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
        total_expenses: totalExpenses,
        net_income: totalCollected - totalExpenses,
        late_count: lateCount,
        paid_count: paidCount,
        properties: propertyCount ?? 0,
        units: unitCount ?? 0,
        tenants: tenantCount ?? 0,
        method_breakdown: methodBreakdown,
        monthly_breakdown: monthlyBreakdown,
        expenses_by_category: expensesByCategory,
      }

      // Save to activity_logs
      await supabase.from("activity_logs").insert({
        org_id: org.id,
        action: "annual_report",
        metadata: report,
      })

      results.push(report)
    }

    return new Response(JSON.stringify({ success: true, reports: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
