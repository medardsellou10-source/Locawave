"use client"

import Link from "next/link"
import { useOrganization } from "@/hooks/useOrganization"
import { useUser } from "@/hooks/useUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const KPI_PLACEHOLDERS = [
  { title: "Biens" },
  { title: "Locataires" },
  { title: "Loyers du mois" },
  { title: "Taux d'occupation" },
]

export default function DashboardPage() {
  const { org, loading: orgLoading } = useOrganization()
  const { appUser, loading: userLoading } = useUser()

  return (
    <div className="space-y-6">
      {/* Onboarding banner */}
      {!orgLoading && org && !org.onboarding_completed && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-orange-900">
                Completez votre configuration
              </h3>
              <p className="text-sm text-orange-700">
                Configurez votre organisation pour profiter pleinement de Locawave.
              </p>
            </div>
            <Link href="/dashboard/onboarding">
              <Button
                size="sm"
                className="gap-1"
                style={{ backgroundColor: "#f97316" }}
              >
                Configurer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Welcome message */}
      {!userLoading && appUser && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenue sur Locawave{appUser.full_name ? `, ${appUser.full_name.split(" ")[0]}` : ""}
          </h2>
          <p className="text-sm text-gray-500">
            Voici un apercu de votre activite locative.
          </p>
        </div>
      )}

      {/* KPI skeleton cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_PLACEHOLDERS.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
