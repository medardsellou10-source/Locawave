"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Copy, KeyRound, Ban, ShieldPlus, UserCog } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Les actions administratives sur un compte. Chacune part vers
 * /api/admin/comptes/[id], qui revérifie les droits côté serveur : ce composant
 * ne fait qu'appeler, il ne décide de rien.
 */

const ROLES = [
  { value: "owner", label: "Propriétaire" },
  { value: "tenant", label: "Locataire" },
  { value: "provider", label: "Prestataire" },
  { value: "seeker", label: "Chercheur" },
]

type Props = {
  compteId: string
  nom: string
  roleActuel: string
  suspendu: boolean
  estAdmin: boolean
  estSuperAdmin: boolean
  jeSuisSuperAdmin: boolean
  cEstMoi: boolean
}

export function AdminCompteActions({
  compteId,
  nom,
  roleActuel,
  suspendu,
  estAdmin,
  estSuperAdmin,
  jeSuisSuperAdmin,
  cEstMoi,
}: Props) {
  const router = useRouter()
  const [role, setRole] = useState(roleActuel)
  const [enCours, setEnCours] = useState<string | null>(null)
  const [lien, setLien] = useState<string | null>(null)

  async function agir(action: string, corps: Record<string, unknown> = {}) {
    setEnCours(action)
    try {
      const res = await fetch(`/api/admin/comptes/${compteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...corps }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? "L'action a échoué.")
        return
      }
      if (data.lien) setLien(data.lien)
      toast.success(data.message ?? "C'est fait.")
      router.refresh()
    } catch {
      toast.error("Le serveur n'a pas répondu.")
    } finally {
      setEnCours(null)
    }
  }

  if (cEstMoi) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-slate-600">
          C&apos;est ton propre compte. Aucune action administrative n&apos;est possible
          ici — c&apos;est volontaire : on ne se rétrograde pas, on ne se suspend pas,
          et on ne se retire pas l&apos;accès à la console par mégarde.
        </CardContent>
      </Card>
    )
  }

  const bloque = estAdmin && !jeSuisSuperAdmin

  if (bloque) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-slate-600">
          Ce compte est administrateur de la plateforme : seules les mains d&apos;un
          super-admin peuvent y toucher.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-5 p-5">
          {/* Rôle */}
          <div>
            <p className="flex items-center gap-2 font-medium text-slate-800">
              <UserCog className="h-4 w-4" />
              Rôle
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Détermine l&apos;espace où {nom} atterrit à la connexion. Le changement
              prend effet à sa prochaine connexion.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                disabled={role === roleActuel || enCours !== null}
                onClick={() => agir("role", { role })}
              >
                {enCours === "role" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Changer le rôle
              </Button>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="border-t border-slate-100 pt-5">
            <p className="flex items-center gap-2 font-medium text-slate-800">
              <KeyRound className="h-4 w-4" />
              Accès au compte
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Génère un lien de réinitialisation. Il n&apos;est pas envoyé : à toi de
              le transmettre par un canal sûr. Il vaut connexion.
            </p>
            <Button
              variant="outline"
              className="mt-3"
              disabled={enCours !== null}
              onClick={() => agir("lien_connexion")}
            >
              {enCours === "lien_connexion" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Générer un lien de réinitialisation
            </Button>

            {lien && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-900">
                  Lien à usage unique — ne le laisse pas traîner.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto whitespace-nowrap rounded bg-white px-2 py-1 text-xs text-slate-700">
                    {lien}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(lien)
                      toast.success("Lien copié.")
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions lourdes */}
      <Card className="border-red-200">
        <CardContent className="space-y-5 p-5">
          <div>
            <p className="flex items-center gap-2 font-medium text-red-800">
              <Ban className="h-4 w-4" />
              {suspendu ? "Compte suspendu" : "Suspendre le compte"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {suspendu
                ? `${nom} ne peut pas se connecter. Ses données restent intactes.`
                : `${nom} ne pourra plus se connecter. Rien n'est supprimé, et c'est réversible.`}
            </p>
            <Button
              variant={suspendu ? "outline" : "destructive"}
              className="mt-3"
              disabled={enCours !== null}
              onClick={() => {
                if (
                  !suspendu &&
                  !confirm(`Suspendre le compte de ${nom} ? Il ne pourra plus se connecter.`)
                )
                  return
                agir("suspension", { suspendre: !suspendu })
              }}
            >
              {enCours === "suspension" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {suspendu ? "Réactiver le compte" : "Suspendre le compte"}
            </Button>
          </div>

          {jeSuisSuperAdmin && (
            <div className="border-t border-slate-100 pt-5">
              <p className="flex items-center gap-2 font-medium text-slate-800">
                <ShieldPlus className="h-4 w-4" />
                Accès à cette console
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {estAdmin
                  ? `${nom} voit tout ce que tu vois ici.`
                  : `Donner à ${nom} l'accès à la console lui ouvre toutes les données de la plateforme.`}
              </p>
              {estSuperAdmin ? (
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Compte super-admin : il ne se révoque pas depuis l&apos;interface.
                </p>
              ) : (
                <Button
                  variant={estAdmin ? "outline" : "destructive"}
                  className="mt-3"
                  disabled={enCours !== null}
                  onClick={() => {
                    if (
                      !estAdmin &&
                      !confirm(
                        `Donner à ${nom} l'accès à la console d'administration ? Il verra toutes les données de la plateforme.`
                      )
                    )
                      return
                    agir("administrateur", { accorder: !estAdmin })
                  }}
                >
                  {enCours === "administrateur" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {estAdmin ? "Retirer l'accès admin" : "Nommer administrateur"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
