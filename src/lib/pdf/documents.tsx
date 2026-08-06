import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

/**
 * Documents PDF officiels de Locawave.
 *
 * `@react-pdf/renderer` était installé depuis l'origine mais n'était importé
 * nulle part : la route « generate » renvoyait du JSON, et `receipts.pdf_url`
 * est resté NULL sur toutes les quittances. Ce module produit les vrais
 * fichiers, rendus côté serveur via renderToBuffer().
 *
 * Contrainte volontaire : aucune police externe. Les polices intégrées
 * (Helvetica) évitent un téléchargement réseau à chaque génération, qui
 * échouerait silencieusement en cas de coupure et produirait un PDF illisible.
 */

const ORANGE = "#f97316"
const MARINE = "#1a2744"

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937" },
  bandeau: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
             borderBottomWidth: 2, borderBottomColor: ORANGE, paddingBottom: 12, marginBottom: 20 },
  marque: { fontSize: 20, fontFamily: "Helvetica-Bold", color: MARINE },
  marqueAccent: { color: ORANGE },
  refBloc: { alignItems: "flex-end" },
  titre: { fontSize: 15, fontFamily: "Helvetica-Bold", color: MARINE, marginBottom: 2 },
  discret: { fontSize: 9, color: "#6b7280" },
  section: { marginBottom: 16 },
  sectionTitre: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#6b7280",
                  textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  deuxColonnes: { flexDirection: "row", gap: 28 },
  colonne: { flex: 1 },
  ligne: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3,
           borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  libelle: { color: "#6b7280" },
  valeur: { fontFamily: "Helvetica-Bold", color: MARINE },
  encadreMontant: { backgroundColor: "#fff7ed", borderLeftWidth: 3, borderLeftColor: ORANGE,
                    padding: 12, marginVertical: 12 },
  montant: { fontSize: 22, fontFamily: "Helvetica-Bold", color: MARINE },
  paragraphe: { lineHeight: 1.5, marginBottom: 8, textAlign: "justify" },
  article: { fontFamily: "Helvetica-Bold", color: MARINE, marginTop: 10, marginBottom: 3 },
  signatures: { flexDirection: "row", gap: 28, marginTop: 26 },
  caseSignature: { flex: 1, borderWidth: 0.5, borderColor: "#d1d5db", borderRadius: 3, padding: 10, minHeight: 78 },
  piedDePage: { position: "absolute", bottom: 28, left: 40, right: 40, fontSize: 7.5,
                color: "#9ca3af", textAlign: "center", borderTopWidth: 0.5,
                borderTopColor: "#e5e7eb", paddingTop: 6 },
})

export const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ") + " FCFA"
export const dateFr = (d: string | Date) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

function EnTete({ titre, reference }: { titre: string; reference: string }) {
  return (
    <View style={s.bandeau}>
      <View>
        <Text style={s.marque}>Loca<Text style={s.marqueAccent}>wave</Text></Text>
        <Text style={s.discret}>Gestion locative — Sénégal</Text>
      </View>
      <View style={s.refBloc}>
        <Text style={s.titre}>{titre}</Text>
        <Text style={s.discret}>{reference}</Text>
      </View>
    </View>
  )
}

function Ligne({ l, v }: { l: string; v: string }) {
  return (
    <View style={s.ligne}>
      <Text style={s.libelle}>{l}</Text>
      <Text style={s.valeur}>{v}</Text>
    </View>
  )
}

// ───────────────────────────── Quittance de loyer ─────────────────────────────

export type DonneesQuittance = {
  numero: string
  emisLe: string
  bailleur: { nom: string; adresse?: string | null }
  locataire: { nom: string; telephone?: string | null }
  bien: { designation: string; adresse?: string | null }
  periode: string
  montantFcfa: number
  moyen: string
  reference?: string | null
  payeLe: string
}

export function Quittance({ d }: { d: DonneesQuittance }) {
  return (
    <Document title={`Quittance ${d.numero}`} author="Locawave">
      <Page size="A4" style={s.page}>
        <EnTete titre="Quittance de loyer" reference={`N° ${d.numero}`} />

        <View style={[s.section, s.deuxColonnes]}>
          <View style={s.colonne}>
            <Text style={s.sectionTitre}>Bailleur</Text>
            <Text style={s.valeur}>{d.bailleur.nom}</Text>
            {d.bailleur.adresse ? <Text style={s.discret}>{d.bailleur.adresse}</Text> : null}
          </View>
          <View style={s.colonne}>
            <Text style={s.sectionTitre}>Locataire</Text>
            <Text style={s.valeur}>{d.locataire.nom}</Text>
            {d.locataire.telephone ? <Text style={s.discret}>{d.locataire.telephone}</Text> : null}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitre}>Logement loué</Text>
          <Text style={s.valeur}>{d.bien.designation}</Text>
          {d.bien.adresse ? <Text style={s.discret}>{d.bien.adresse}</Text> : null}
        </View>

        <View style={s.encadreMontant}>
          <Text style={s.discret}>Montant réglé pour {d.periode}</Text>
          <Text style={s.montant}>{fcfa(d.montantFcfa)}</Text>
        </View>

        <View style={s.section}>
          <Ligne l="Période" v={d.periode} />
          <Ligne l="Date du règlement" v={dateFr(d.payeLe)} />
          <Ligne l="Moyen de paiement" v={d.moyen} />
          {d.reference ? <Ligne l="Référence de transaction" v={d.reference} /> : null}
        </View>

        <Text style={s.paragraphe}>
          Le bailleur reconnaît avoir reçu du locataire la somme indiquée ci-dessus au titre du
          loyer et des charges de la période mentionnée, et lui en donne quittance, sous réserve
          de tous ses droits.
        </Text>

        <Text style={s.piedDePage}>
          Quittance {d.numero} — émise le {dateFr(d.emisLe)} via Locawave.{"\n"}
          Ce document est généré automatiquement à la réception du paiement ; il ne préjuge pas
          du règlement des périodes antérieures.
        </Text>
      </Page>
    </Document>
  )
}

// ─────────────────────────── Contrat de bail ───────────────────────────

export type DonneesBail = {
  reference: string
  emisLe: string
  bailleur: { nom: string; adresse?: string | null; telephone?: string | null }
  locataire: { nom: string; telephone?: string | null; piece?: string | null }
  bien: { designation: string; adresse?: string | null; surface?: number | null; type?: string | null }
  debut: string
  fin: string
  loyerFcfa: number
  chargesFcfa?: number | null
  cautionFcfa: number
  jourEcheance: number
  signatures?: {
    bailleurNom?: string | null; bailleurLe?: string | null
    locataireNom?: string | null; locataireLe?: string | null
    empreinte?: string | null
  }
}

export function ContratBail({ d }: { d: DonneesBail }) {
  const sig = d.signatures
  return (
    <Document title={`Contrat de bail ${d.reference}`} author="Locawave">
      <Page size="A4" style={s.page}>
        <EnTete titre="Contrat de bail à usage d'habitation" reference={`Réf. ${d.reference}`} />

        <View style={[s.section, s.deuxColonnes]}>
          <View style={s.colonne}>
            <Text style={s.sectionTitre}>Le bailleur</Text>
            <Text style={s.valeur}>{d.bailleur.nom}</Text>
            {d.bailleur.adresse ? <Text style={s.discret}>{d.bailleur.adresse}</Text> : null}
            {d.bailleur.telephone ? <Text style={s.discret}>{d.bailleur.telephone}</Text> : null}
          </View>
          <View style={s.colonne}>
            <Text style={s.sectionTitre}>Le locataire</Text>
            <Text style={s.valeur}>{d.locataire.nom}</Text>
            {d.locataire.telephone ? <Text style={s.discret}>{d.locataire.telephone}</Text> : null}
            {d.locataire.piece ? <Text style={s.discret}>Pièce : {d.locataire.piece}</Text> : null}
          </View>
        </View>

        <Text style={s.article}>Article 1 — Objet</Text>
        <Text style={s.paragraphe}>
          Le bailleur donne à bail au locataire, qui accepte, le logement désigné ci-après :
          {" "}{d.bien.designation}
          {d.bien.adresse ? `, sis ${d.bien.adresse}` : ""}
          {d.bien.surface ? `, d'une superficie d'environ ${d.bien.surface} m²` : ""}.
        </Text>

        <Text style={s.article}>Article 2 — Durée</Text>
        <Text style={s.paragraphe}>
          Le présent bail est consenti pour la période du {dateFr(d.debut)} au {dateFr(d.fin)}.
          Il se renouvellera par tacite reconduction, sauf dénonciation par l&apos;une des parties
          dans les formes et délais prévus par la loi.
        </Text>

        <Text style={s.article}>Article 3 — Loyer et charges</Text>
        <View style={s.section}>
          <Ligne l="Loyer mensuel" v={fcfa(d.loyerFcfa)} />
          {d.chargesFcfa ? <Ligne l="Charges mensuelles" v={fcfa(d.chargesFcfa)} /> : null}
          <Ligne l="Total mensuel" v={fcfa(d.loyerFcfa + (d.chargesFcfa ?? 0))} />
          <Ligne l="Exigible le" v={`${d.jourEcheance} de chaque mois`} />
        </View>

        <Text style={s.article}>Article 4 — Dépôt de garantie</Text>
        <Text style={s.paragraphe}>
          Le locataire verse au bailleur un dépôt de garantie de {fcfa(d.cautionFcfa)}. Cette somme
          est conservée par le bailleur et restituée en fin de bail, déduction faite des sommes
          dont le locataire serait redevable, sur justificatifs et au vu de l&apos;état des lieux de
          sortie. Locawave ne détient pas ce dépôt : il en tient uniquement le registre.
        </Text>

        <Text style={s.article}>Article 5 — État des lieux</Text>
        <Text style={s.paragraphe}>
          Un état des lieux contradictoire est établi à l&apos;entrée et à la sortie du locataire.
          À défaut d&apos;état des lieux d&apos;entrée, le logement est réputé avoir été remis en bon
          état, et aucune retenue ne pourra être opérée sur le dépôt de garantie à ce titre.
        </Text>

        <Text style={s.article}>Article 6 — Obligations des parties</Text>
        <Text style={s.paragraphe}>
          Le bailleur délivre un logement décent et en assure la jouissance paisible. Il prend en
          charge les grosses réparations. Le locataire paie le loyer au terme convenu, use
          paisiblement des lieux et assume l&apos;entretien courant et les réparations locatives.
        </Text>

        <View style={s.signatures}>
          <View style={s.caseSignature}>
            <Text style={s.sectionTitre}>Le bailleur</Text>
            <Text style={s.valeur}>{sig?.bailleurNom ?? d.bailleur.nom}</Text>
            <Text style={s.discret}>
              {sig?.bailleurLe ? `Signé le ${dateFr(sig.bailleurLe)}` : "En attente de signature"}
            </Text>
          </View>
          <View style={s.caseSignature}>
            <Text style={s.sectionTitre}>Le locataire</Text>
            <Text style={s.valeur}>{sig?.locataireNom ?? d.locataire.nom}</Text>
            <Text style={s.discret}>
              {sig?.locataireLe ? `Signé le ${dateFr(sig.locataireLe)}` : "En attente de signature"}
            </Text>
          </View>
        </View>

        <Text style={s.piedDePage}>
          Fait à distance via Locawave le {dateFr(d.emisLe)} — référence {d.reference}.{"\n"}
          {sig?.empreinte
            ? `Empreinte du document : ${sig.empreinte}`
            : "Document non encore signé : l'empreinte sera apposée à la signature des deux parties."}
        </Text>
      </Page>
    </Document>
  )
}
