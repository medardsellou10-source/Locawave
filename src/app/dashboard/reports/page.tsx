"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { formatFCFA, formatDateFR } from "@/lib/formatters"

interface MonthlyReport {
  id: string
  created_at: string
  metadata: {
    month: string
    collected: number
    expected: number
    rate: number
    occupied: number
    total: number
    message: string
  }
}

export default function ReportsPage() {
  const { org, loading } = useOrganization()
  const supabase = createClient()
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)

  // Current month stats
  const [collected, setCollected] = useState(0)
  const [expected, setExpected] = useState(0)
  const [lateCount, setLateCount] = useState(0)

  useEffect(() => {
    if (!org) return

    // Fetch historical monthly reports
    supabase
      .from("activity_logs")
      .select("id, created_at, metadata")
      .eq("org_id", org.id)
      .eq("action", "monthly_report")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        setReports((data as unknown as MonthlyReport[]) ?? [])
        setLoadingReports(false)
      })

    // Current month stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

    supabase
      .from("rent_schedules")
      .select("amount_fcfa, status")
      .eq("org_id", org.id)
      .gte("due_date", startOfMonth)
      .lte("due_date", endOfMonth)
      .then(({ data }) => {
        const schedules = data ?? []
        setExpected(schedules.reduce((s, r) => s + r.amount_fcfa, 0))
        setLateCount(schedules.filter((r) => r.status === "late").length)
      })

    supabase
      .from("payments")
      .select("amount_fcfa")
      .eq("org_id", org.id)
      .gte("paid_at", startOfMonth)
      .lte("paid_at", endOfMonth + "T23:59:59")
      .then(({ data }) => {
        setCollected((data ?? []).reduce((s, p) => s + p.amount_fcfa, 0))
      })
  }, [org])

  const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0

  async function exportCSV() {
    if (!org) return
    const res = await fetch(`/api/export/payments?org_id=${org.id}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `locawave-paiements-${new Date().toISOString().slice(0, 7)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Rapports</h1>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-1" /> Exporter CSV
        </Button>
      </div>

      {/* Current month KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Encaissé ce mois</p>
            <p className="text-2xl font-bold text-green-600">{formatFCFA(collected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Attendu ce mois</p>
            <p className="text-2xl font-bold text-[#1a2744]">{formatFCFA(expected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Taux de recouvrement</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-[#1a2744]">{rate}%</p>
              {rate >= 80 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Impayés</p>
            <p className="text-2xl font-bold text-red-600">{lateCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Historique des rapports mensuels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingReports ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun rapport disponible. Les rapports sont générés automatiquement le 1er de chaque mois.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-[#1a2744] capitalize">{report.metadata.month}</p>
                      <p className="text-xs text-gray-400">{formatDateFR(report.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-gray-500">Encaissé</p>
                      <p className="font-semibold text-green-600">{formatFCFA(report.metadata.collected)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Attendu</p>
                      <p className="font-semibold">{formatFCFA(report.metadata.expected)}</p>
                    </div>
                    <Badge variant={report.metadata.rate >= 80 ? "default" : "destructive"}>
                      {report.metadata.rate}%
                    </Badge>
                    <div className="text-right">
                      <p className="text-gray-500">Occupation</p>
                      <p className="font-semibold">{report.metadata.occupied}/{report.metadata.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
