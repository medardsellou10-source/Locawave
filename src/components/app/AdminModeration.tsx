"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2,
  Eye,
  Check,
  X,
  ShieldCheck,
  Wrench,
  Megaphone,
  Star,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Les quatre files de modération. Chaque décision part vers
 * /api/admin/moderation, qui appelle la fonction SQL correspondante — elle seule
 * décide, journalise, et refuse ce qui doit l'être (un prestataire dont
 * l'identité n'est pas vérifiée, une dépublication sans motif).
 */

type Kyc = {
  id: string
  profil_id: string
  nom: string
  role: string
  type: string
  chemin: string
  depose_le: string
}
type Prestataire = {
  id: string
  nom: string
  metiers: string[] | null
  ville: string | null
  quartier: string | null
  verifie: boolean
  kyc: string
  missions: number | null
  note: number | null
  cree_le: string
}
type Annonce = {
  id: string
  titre: string
  statut: string
  verifiee: boolean
  loyer: number
  ville: string | null
  quartier: string | null
  photos: number
  publiee_le: string | null
  creee_le: string
  depubliee_par: string | null
  bien_rattache: boolean
  org: string | null
  org_id: string | null
  proprietaire: string | null
  proprietaire_kyc: string
  candidatures: number
}
type Avis = {
  id: string
  note: number
  commentaire: string | null
  le: string
  prestataire: string
  prestataire_id: string
  client: string | null
  masque: boolean
  motif_masquage: string | null
}

export type ModerationData = {
  kyc: Kyc[]
  prestataires: Prestataire[]
  annonces: Annonce[]
  avis: Avis[]
  compteurs: {
    kyc_attente: number
    prestataires_attente: number
    annonces_publiees: number
    avis_masques: number
  }
}

const DOCS: Record<string, string> = {
  cni: "CNI",
  passeport: "Passeport",
  carte_consulaire: "Carte consulaire",
  autre: "Autre",
}

const ROLES: Record<string, string> = {
  owner: "Propriétaire",
  tenant: "Locataire",
  provider: "Prestataire",
  seeker: "Chercheur",
}

function dateFr(v: string | null) {
  if (!v) return "—"
  return new Date(v).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function AdminModeration({ data }: { data: ModerationData }) {
  const router = useRouter()
  const supabase = createClient()
  const [onglet, setOnglet] = useState<"kyc" | "prestataires" | "annonces" | "avis">(
    data.compteurs.kyc_attente > 0
      ? "kyc"
      : data.compteurs.prestataires_attente > 0
        ? "prestataires"
        : "annonces"
  )
  const [enCours, setEnCours] = useState<string | null>(null)

  async function agir(cible: string, corps: Record<string, unknown>) {
    setEnCours(String(corps.id))
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cible, ...corps }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "L'action a échoué.")
        return
      }
      toast.success(json.message ?? "C'est fait.")
      router.refresh()
    } catch {
      toast.error("Le serveur n'a pas répondu.")
    } finally {
      setEnCours(null)
    }
  }

  /** Le document reste dans un bucket privé : on n'ouvre qu'un lien signé, court. */
  async function voirPiece(chemin: string) {
    const { data: url } = await supabase.storage.from("kyc").createSignedUrl(chemin, 120)
    if (url?.signedUrl) window.open(url.signedUrl, "_blank", "noopener")
    else toast.error("Impossible d'ouvrir le document.")
  }

  const onglets = [
    { id: "kyc" as const, label: "Identités", icon: ShieldCheck, n: data.compteurs.kyc_attente },
    {
      id: "prestataires" as const,
      label: "Prestataires",
      icon: Wrench,
      n: data.compteurs.prestataires_attente,
    },
    { id: "annonces" as const, label: "Annonces", icon: Megaphone, n: data.annonces.length },
    { id: "avis" as const, label: "Avis", icon: Star, n: data.avis.length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {onglets.map((o) => {
          const Icon = o.icon
          const actif = onglet === o.id
          return (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                actif
                  ? "border-[#0f172a] bg-[#0f172a] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {o.label}
              {o.n > 0 && (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    actif ? "bg-white/20" : "bg-slate-100"
                  }`}
                >
                  {o.n}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ---------- Identités ---------- */}
      {onglet === "kyc" && (
        <div className="space-y-3">
          {data.kyc.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-slate-500">
                Aucune pièce d&apos;identité en attente.
              </CardContent>
            </Card>
          ) : (
            data.kyc.map((k) => (
              <Card key={k.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link
                      href={`/admin/comptes/${k.profil_id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {k.nom}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      <Badge variant="outline" className="mr-2">
                        {DOCS[k.type] ?? k.type}
                      </Badge>
                      {ROLES[k.role] ?? k.role} · déposée le {dateFr(k.depose_le)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => voirPiece(k.chemin)}>
                      <Eye className="mr-1 h-4 w-4" />
                      Voir la pièce
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                      disabled={enCours !== null}
                      onClick={() => agir("kyc", { id: k.id, valider: true })}
                    >
                      {enCours === k.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Valider
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={enCours !== null}
                      onClick={() => {
                        const note = window.prompt(
                          "Motif du refus (il sera visible par la personne) :"
                        )
                        if (!note?.trim()) return
                        agir("kyc", { id: k.id, valider: false, note })
                      }}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Refuser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ---------- Prestataires ---------- */}
      {onglet === "prestataires" && (
        <div className="space-y-3">
          {data.prestataires.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-slate-500">
                Aucun prestataire inscrit.
              </CardContent>
            </Card>
          ) : (
            data.prestataires.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/comptes/${p.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {p.nom}
                      </Link>
                      {p.verifie ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          En attente
                        </Badge>
                      )}
                      {p.kyc !== "verified" && (
                        <Badge variant="outline" className="text-slate-500">
                          identité : {p.kyc}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {p.metiers?.join(", ") || "aucun métier déclaré"}
                      {p.ville ? ` · ${p.ville}` : ""} · {p.missions ?? 0} mission
                      {(p.missions ?? 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={p.verifie ? "outline" : "default"}
                    disabled={enCours !== null}
                    onClick={() => {
                      if (p.verifie) {
                        const motif = window.prompt("Motif du retrait :")
                        if (!motif?.trim()) return
                        agir("prestataire", { id: p.id, verifie: false, motif })
                      } else {
                        agir("prestataire", { id: p.id, verifie: true })
                      }
                    }}
                  >
                    {enCours === p.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {p.verifie ? "Retirer la vérification" : "Vérifier"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ---------- Annonces ---------- */}
      {onglet === "annonces" && (
        <div className="space-y-3">
          {data.annonces.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-slate-500">
                Aucune annonce.
              </CardContent>
            </Card>
          ) : (
            data.annonces.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/annonces/${a.id}`}
                        target="_blank"
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {a.titre}
                      </Link>
                      {a.statut === "published" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Publiée
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {a.depubliee_par === "admin" ? "Dépubliée (console)" : "Brouillon"}
                        </Badge>
                      )}
                      {!a.bien_rattache && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          sans bien rattaché
                        </Badge>
                      )}
                      {a.proprietaire_kyc !== "verified" && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          propriétaire non vérifié
                        </Badge>
                      )}
                      {a.photos === 0 && (
                        <Badge variant="outline" className="text-slate-500">
                          sans photo
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatFCFA(a.loyer)} · {[a.quartier, a.ville].filter(Boolean).join(", ") || "sans lieu"}
                      {" · "}
                      {a.org_id ? (
                        <Link href={`/admin/organisations/${a.org_id}`} className="hover:underline">
                          {a.org}
                        </Link>
                      ) : (
                        (a.proprietaire ?? "—")
                      )}
                      {a.candidatures > 0 && ` · ${a.candidatures} candidature(s)`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={a.statut === "published" ? "destructive" : "outline"}
                    disabled={enCours !== null}
                    onClick={() => {
                      if (a.statut === "published") {
                        const motif = window.prompt("Motif de la dépublication :")
                        if (!motif?.trim()) return
                        agir("annonce", { id: a.id, publier: false, motif })
                      } else {
                        agir("annonce", { id: a.id, publier: true })
                      }
                    }}
                  >
                    {enCours === a.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {a.statut === "published" ? "Dépublier" : "Republier"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ---------- Avis ---------- */}
      {onglet === "avis" && (
        <div className="space-y-3">
          {data.avis.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-slate-500">
                Aucun avis déposé. Rappel : seul un client dont la mission est terminée
                peut en laisser un.
              </CardContent>
            </Card>
          ) : (
            data.avis.map((a) => (
              <Card key={a.id} className={a.masque ? "border-slate-300 bg-slate-50" : ""}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">{a.note}/5</span>
                      <span className="text-sm text-slate-500">
                        sur {a.prestataire} · par {a.client ?? "client"}
                      </span>
                      {a.masque && (
                        <Badge variant="outline" className="text-slate-500">
                          <EyeOff className="mr-1 h-3 w-3" />
                          masqué
                        </Badge>
                      )}
                    </div>
                    {a.commentaire && (
                      <p className="mt-1 text-sm text-slate-700">« {a.commentaire} »</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      {dateFr(a.le)}
                      {a.motif_masquage ? ` · motif : ${a.motif_masquage}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={enCours !== null}
                    onClick={() => {
                      if (a.masque) {
                        agir("avis", { id: a.id, masquer: false })
                      } else {
                        const motif = window.prompt("Motif du masquage :")
                        if (!motif?.trim()) return
                        agir("avis", { id: a.id, masquer: true, motif })
                      }
                    }}
                  >
                    {enCours === a.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {a.masque ? "Rétablir" : "Masquer"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
