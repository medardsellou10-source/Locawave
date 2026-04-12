"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Copy, Gift, Users, Check, Share2 } from "lucide-react"
import { formatDateFR } from "@/lib/formatters"
import type { Database } from "@/types/database"

type Referral = Database["public"]["Tables"]["referrals"]["Row"]

export default function ReferralPage() {
  const { org } = useOrganization()
  const supabase = createClient()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [copied, setCopied] = useState(false)

  const referralCode = org?.referral_code ?? ""
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : ""

  useEffect(() => {
    if (!org) return
    supabase
      .from("referrals")
      .select("*")
      .eq("referrer_org_id", org.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReferrals(data ?? []))
  }, [org])

  function copyLink() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success("Lien copié !")
    setTimeout(() => setCopied(false), 2000)
  }

  const converted = referrals.filter((r) => r.status === "converted" || r.status === "rewarded").length
  const rewarded = referrals.filter((r) => r.status === "rewarded").length

  const statusLabel: Record<string, string> = {
    pending: "En attente",
    converted: "Converti",
    rewarded: "Récompensé",
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Programme de parrainage</h1>
      <p className="text-gray-500 mb-6">Invitez d'autres propriétaires et gagnez des récompenses.</p>

      {/* Share card */}
      <Card className="mb-8 bg-gradient-to-r from-[#1a2744] to-[#1e3a5f] text-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Parrainez, gagnez 1 mois gratuit !</h2>
              <p className="text-gray-300 text-sm mb-4">
                Pour chaque filleul qui souscrit un plan payant, vous recevez 1 mois d'abonnement offert.
                Votre filleul reçoit aussi 1 mois gratuit supplémentaire.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={referralLink}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={copyLink}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Code : <span className="font-mono">{referralCode}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Share2 className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Parrainages</p>
              <p className="text-2xl font-bold text-[#1a2744]">{referrals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Convertis</p>
              <p className="text-2xl font-bold text-[#1a2744]">{converted}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Gift className="w-8 h-8 text-[#f97316]" />
            <div>
              <p className="text-sm text-gray-500">Récompensés</p>
              <p className="text-2xl font-bold text-[#1a2744]">{rewarded}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals list */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des parrainages</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Aucun parrainage pour le moment. Partagez votre lien pour commencer !
            </p>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-[#1a2744]">Organisation #{ref.referee_org_id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400">{formatDateFR(ref.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {ref.reward_applied_at && (
                      <span className="text-xs text-green-600">Récompense appliquée le {formatDateFR(ref.reward_applied_at)}</span>
                    )}
                    <Badge variant={ref.status === "rewarded" ? "default" : "secondary"}>
                      {statusLabel[ref.status] ?? ref.status}
                    </Badge>
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
