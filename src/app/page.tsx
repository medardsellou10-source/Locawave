"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Building2, Bell, FileText, ChevronDown, Check, ArrowRight, Shield, Smartphone,
  BarChart3, Menu, X, Search, KeyRound, Wallet, HardHat, Wrench, Star,
  MessageCircle, HeartPulse, ShieldCheck, Camera, MapPin,
} from "lucide-react"
import { Hero3DHouses } from "@/components/app/Hero3DHouses"

const PILLARS = [
  { icon: Search, title: "Trouver", desc: "Annonces vérifiées, recherche par carte et proximité, visites (dont vidéo pour la diaspora).", color: "bg-blue-100 text-blue-600" },
  { icon: KeyRound, title: "Louer", desc: "Candidature en ligne, bail généré automatiquement, espace locataire et paiement sécurisé.", color: "bg-indigo-100 text-indigo-600" },
  { icon: Wallet, title: "Gérer", desc: "Loyers, quittances PDF, finances par bien, rappels WhatsApp et tableau de bord temps réel.", color: "bg-green-100 text-green-600" },
  { icon: HardHat, title: "Entretenir", desc: "Suivi de chantier photos/vidéos en temps réel, paiement par phase sous séquestre.", color: "bg-orange-100 text-orange-600" },
  { icon: Wrench, title: "Servir", desc: "Prestataires vérifiés près de chez vous, messagerie intégrée, avantages (santé, formation).", color: "bg-purple-100 text-purple-600" },
]

const FEATURES = [
  { icon: Search, title: "Marketplace de logements", desc: "Publiez et trouvez des biens vérifiés « Locawave », filtrés par budget, type et proximité, avec carte interactive.", color: "bg-blue-100 text-blue-600" },
  { icon: KeyRound, title: "Espace locataire & paiement", desc: "Le locataire suit ses échéances, paie en ligne (Wave/OM) et télécharge ses quittances depuis son espace.", color: "bg-indigo-100 text-indigo-600" },
  { icon: HardHat, title: "Suivi de chantier", desc: "Construisez/rénovez à distance : photos & vidéos en temps réel, validez chaque phase avant de débloquer le paiement.", color: "bg-orange-100 text-orange-600" },
  { icon: Star, title: "Prestataires & Trust Score", desc: "Artisans vérifiés (KYC), notés sur leurs missions réelles. Constituez votre carnet d'artisans de confiance.", color: "bg-amber-100 text-amber-600" },
  { icon: ShieldCheck, title: "Paiement sous séquestre", desc: "Les fonds sont gelés jusqu'à validation du travail. En cas de litige, médiation intégrée. On ne détient jamais vos fonds.", color: "bg-green-100 text-green-600" },
  { icon: Bell, title: "Incidents en temps réel", desc: "Le locataire signale un problème avec photo ; vous êtes notifié (WhatsApp) et suivez la résolution en direct.", color: "bg-red-100 text-red-600" },
  { icon: HeartPulse, title: "Avantages & protection", desc: "Accès à la micro-assurance santé (CMU) et à des modules de formation avec badges pour les prestataires.", color: "bg-pink-100 text-pink-600" },
  { icon: FileText, title: "Quittances & rappels auto", desc: "Quittances PDF instantanées et rappels WhatsApp J-5 / jour J / J+3. Zéro relance manuelle.", color: "bg-slate-100 text-slate-600" },
  { icon: BarChart3, title: "Finances & relevés", desc: "Revenus, charges, taux de recouvrement par bien et consolidés. Relevé annuel exportable — idéal diaspora.", color: "bg-cyan-100 text-cyan-600" },
]

const PERSONAS = [
  {
    role: "owner", emoji: "🏠", title: "Propriétaire & diaspora",
    points: ["Gérez vos biens depuis l'étranger", "Suivez vos chantiers en temps réel", "Paiements et séquestre sécurisés", "Relevés pour votre fiscalité"],
    cta: "Gérer mes biens", color: "from-blue-600 to-blue-500",
  },
  {
    role: "tenant", emoji: "🔑", title: "Locataire",
    points: ["Trouvez un logement vérifié", "Payez et recevez vos quittances", "Signalez un incident en 1 clic", "Trouvez des services de proximité"],
    cta: "Trouver un logement", color: "from-indigo-600 to-indigo-500",
  },
  {
    role: "provider", emoji: "🛠️", title: "Prestataire & aidant",
    points: ["Vitrine pro avec réalisations", "Missions et chantiers payés sous séquestre", "Trust Score qui valorise votre sérieux", "Avantages santé & formation"],
    cta: "Proposer mes services", color: "from-orange-600 to-orange-500",
  },
]

const PLANS = [
  {
    name: "Solo", price: "10 000", period: "/mois",
    description: "Pour les propriétaires individuels",
    features: ["Jusqu'à 5 biens", "Rappels WhatsApp automatiques", "Quittances PDF", "Espace locataire", "1 utilisateur"],
    cta: "Commencer gratuitement", variant: "solo" as const,
  },
  {
    name: "Pro", price: "20 000", period: "/mois",
    description: "Pour les gestionnaires actifs",
    features: ["Jusqu'à 25 biens", "Suivi de chantier & prestataires", "Séquestre & litiges", "Rapports mensuels", "3 utilisateurs", "Support prioritaire"],
    cta: "Essai gratuit 14 jours", variant: "pro" as const,
  },
  {
    name: "Agence", price: "45 000", period: "/mois",
    description: "Pour les agences immobilières",
    features: ["Biens illimités", "Tout dans Pro", "Marketplace & annonces", "Utilisateurs illimités", "API & intégrations", "Support dédié"],
    cta: "Contacter l'équipe", variant: "agence" as const,
  },
]

const FAQ = [
  { q: "Qu'est-ce que Locawave exactement ?", a: "Locawave est l'« OS du logement » au Sénégal : trouver un logement, le louer, le gérer, l'entretenir (chantiers & réparations) et accéder à des services de proximité — le tout dans une seule app, pour les propriétaires, la diaspora, les locataires et les prestataires." },
  { q: "Comment fonctionne le suivi de chantier ?", a: "Votre chef de chantier (prestataire vérifié) envoie des photos et vidéos en temps réel pour chaque phase. Vous validez chaque phase avant que le paiement, placé sous séquestre, ne soit libéré. Vous suivez votre construction sans vous déplacer." },
  { q: "Mon argent est-il sécurisé ?", a: "Oui. Les paiements de services et de chantiers passent par un séquestre : les fonds sont gelés jusqu'à la validation du travail. Locawave ne détient jamais vos fonds — tout est piloté via un prestataire de paiement agréé. En cas de désaccord, une médiation est intégrée." },
  { q: "Comment sont vérifiés les prestataires ?", a: "Chaque prestataire passe une vérification d'identité (KYC) et n'est affiché qu'une fois validé. Il est noté via un Trust Score basé sur ses missions réelles, ses avis et ses certifications." },
  { q: "Locawave fonctionne-t-il pour la diaspora ?", a: "C'est notre cœur de cible. Gérez vos loyers, suivez vos chantiers en direct, recevez des alertes WhatsApp et payez en toute sécurité depuis n'importe où dans le monde." },
  { q: "Dois-je installer une application ?", a: "Non. Locawave est une application web installable (PWA) accessible depuis n'importe quel navigateur — téléphone, tablette ou ordinateur. Vous pouvez l'ajouter à votre écran d'accueil." },
  { q: "Mes données sont-elles protégées ?", a: "Vos données sont hébergées sur des serveurs sécurisés en Europe et Locawave est conforme à la loi sénégalaise 2008-12 sur la protection des données personnelles." },
  { q: "Y a-t-il un engagement ?", a: "Aucun engagement. L'essai gratuit de 14 jours ne nécessite pas de carte bancaire, et vous pouvez annuler à tout moment." },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1a2744]">Locawave</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-gray-600">
            <a href="#parcours" className="hover:text-[#1a2744] transition-colors">Le parcours</a>
            <a href="#fonctionnalites" className="hover:text-[#1a2744] transition-colors">Fonctionnalités</a>
            <a href="#pour-qui" className="hover:text-[#1a2744] transition-colors">Pour qui</a>
            <a href="#tarifs" className="hover:text-[#1a2744] transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-[#1a2744] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-gray-600 hover:text-[#1a2744] transition-colors">Connexion</Link>
            <Link href="/register" className="text-sm bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-lg transition-colors">Essai gratuit</Link>
            <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur shadow-lg">
            <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {[["#parcours", "Le parcours"], ["#fonctionnalites", "Fonctionnalités"], ["#pour-qui", "Pour qui"], ["#tarifs", "Tarifs"], ["#faq", "FAQ"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm font-medium text-gray-700 hover:text-[#f97316] border-b border-gray-100 transition-colors">{label}</a>
              ))}
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 px-2 text-sm font-medium text-gray-700 hover:text-[#f97316] transition-colors">Connexion</Link>
            </nav>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#1a2744] text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur">
                <Smartphone className="w-4 h-4" />
                <span>L'OS du logement au Sénégal</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Trouvez, louez, gérez et{" "}
                <span className="text-[#f97316]">rénovez</span>{" "}
                votre logement — d'où que vous soyez
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Une seule app pour tout le logement au Sénégal : annonces vérifiées, baux et loyers,
                suivi de chantier en temps réel et prestataires de confiance — avec paiements sécurisés sous séquestre.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                  Commencer gratuitement <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#parcours" className="w-full sm:w-auto border border-white/30 hover:bg-white/10 text-white px-8 py-3.5 rounded-lg text-lg transition-colors text-center">Découvrir</a>
              </div>
              <p className="text-sm text-gray-400 mt-4">14 jours d'essai gratuit — Aucune carte requise</p>
            </div>
            <div className="relative lg:pl-4"><Hero3DHouses /></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ─── Bande de confiance ─── */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Paiements, confiance & intégrations</p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {[
              { label: "Wave", node: <div className="w-7 h-7 rounded-full bg-[#1B9AF5] flex items-center justify-center text-white font-black text-sm">W</div> },
              { label: "Orange Money", node: <div className="w-7 h-7 rounded-full bg-[#FF6600] flex items-center justify-center text-white font-black text-sm">O</div> },
              { label: "WhatsApp", node: <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center"><MessageCircle className="w-4 h-4 text-white" /></div> },
              { label: "Séquestre sécurisé", node: <div className="w-7 h-7 rounded-full bg-[#1a2744] flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-white" /></div> },
              { label: "Prestataires vérifiés (KYC)", node: <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div> },
              { label: "Quittances PDF", node: <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white font-black text-[10px]">PDF</div> },
              { label: "RGPD · Loi 2008-12", node: <div className="w-7 h-7 rounded-full bg-[#0f1a2e] flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div> },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100">
                {b.node}<span className="font-bold text-gray-700 text-sm">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Le parcours (5 piliers) ─── */}
      <section id="parcours" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Tout le cycle du logement, au même endroit</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">De la recherche d'un logement à son entretien : Locawave couvre chaque étape, sans rupture.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="absolute -top-3 left-6 text-[11px] font-bold text-white bg-[#1a2744] rounded-full px-2 py-0.5">{String(i + 1).padStart(2, "0")}</span>
                <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center mb-4 mt-1`}><p.icon className="w-6 h-6" /></div>
                <h3 className="text-lg font-bold text-[#1a2744] mb-1">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Fonctionnalités ─── */}
      <section id="fonctionnalites" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Tout ce qu'il vous faut pour le logement</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Des outils pensés pour le Sénégal et la diaspora — simples, mobiles et sécurisés.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}><item.icon className="w-6 h-6" /></div>
                <h3 className="text-lg font-semibold text-[#1a2744] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Spotlight Suivi de chantier ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-[#f97316] rounded-full px-3 py-1 text-xs font-semibold mb-4">
                <HardHat className="w-4 h-4" /> Nouveau · Suivi de chantier
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Construisez ou rénovez, sans vous déplacer</h2>
              <p className="text-gray-500 mb-6">Idéal pour la diaspora : suivez votre chantier phase par phase et ne payez que ce qui est livré.</p>
              <ul className="space-y-3">
                {[
                  { icon: Camera, t: "Photos & vidéos en temps réel", d: "Votre chef de chantier documente chaque avancée depuis le terrain." },
                  { icon: ShieldCheck, t: "Paiement par phase sous séquestre", d: "Les fonds ne sont libérés qu'après votre validation de la phase." },
                  { icon: BarChart3, t: "Budget & traçabilité", d: "Suivez le financé, le libéré et le restant, avec un historique complet." },
                ].map((f) => (
                  <li key={f.t} className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-orange-50 text-[#f97316] flex items-center justify-center shrink-0"><f.icon className="w-5 h-5" /></span>
                    <div><p className="font-semibold text-[#1a2744]">{f.t}</p><p className="text-sm text-gray-500">{f.d}</p></div>
                  </li>
                ))}
              </ul>
              <Link href="/register?role=owner" className="inline-flex items-center gap-2 mt-7 bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Démarrer un chantier <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#1a2744] to-[#1e3a5f] p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold">Villa R+1 — Diamniadio</p>
                <span className="text-xs bg-green-500/20 text-green-300 rounded-full px-2 py-0.5">En cours</span>
              </div>
              {[
                { t: "Fondations", s: "Validée & payée", c: "text-green-300", w: "100%" },
                { t: "Élévation murs", s: "Soumise à validation", c: "text-amber-300", w: "60%" },
                { t: "Toiture & finitions", s: "Planifiée", c: "text-gray-400", w: "0%" },
              ].map((m) => (
                <div key={m.t} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between text-sm"><span>{m.t}</span><span className={m.c}>{m.s}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-[#f97316]" style={{ width: m.w }} /></div>
                </div>
              ))}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/5 rounded-lg py-2"><p className="text-gray-400">Budget</p><p className="font-bold">12M</p></div>
                <div className="bg-white/5 rounded-lg py-2"><p className="text-indigo-300">Séquestre</p><p className="font-bold">5M</p></div>
                <div className="bg-white/5 rounded-lg py-2"><p className="text-green-300">Libéré</p><p className="font-bold">4M</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pour qui ─── */}
      <section id="pour-qui" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Pensé pour chaque acteur du logement</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Chacun son espace, ses outils, sa tranquillité.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PERSONAS.map((p) => (
              <div key={p.role} className="flex flex-col rounded-2xl bg-white p-7 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="text-lg font-bold text-[#1a2744] mb-3">{p.title}</h3>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-gray-600"><Check className="w-4 h-4 mt-0.5 shrink-0 text-green-500" /><span>{pt}</span></li>
                  ))}
                </ul>
                <Link href={`/register?role=${p.role}`} className={`text-center py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r ${p.color} hover:opacity-95 transition-opacity`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Confiance ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 md:p-10">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { icon: ShieldCheck, t: "Identités vérifiées", d: "KYC obligatoire pour publier ou intervenir." },
                { icon: Wallet, t: "Fonds sous séquestre", d: "Libérés après validation — jamais détenus par nous." },
                { icon: Star, t: "Avis authentiques", d: "Uniquement après une vraie mission ou location." },
                { icon: Shield, t: "Données protégées", d: "Hébergement EU · loi sénégalaise 2008-12." },
              ].map((c) => (
                <div key={c.t}>
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-[#f97316]"><c.icon className="w-6 h-6" /></div>
                  <h3 className="font-semibold text-[#1a2744] text-sm">{c.t}</h3>
                  <p className="text-xs text-gray-500 mt-1">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Témoignage ─── */}
      <section className="py-16 bg-[#1a2744]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-4xl mb-6">⭐⭐⭐⭐⭐</div>
          <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-6">
            « Depuis Paris, je suis la construction de ma maison à Diamniadio en direct : photos, vidéos, et je ne paie chaque phase qu'une fois validée. Je n'ai jamais eu autant de tranquillité. »
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold">A</div>
            <div className="text-left">
              <p className="font-semibold text-white">Amadou S.</p>
              <p className="text-gray-400 text-sm">Propriétaire diaspora — Paris 🇫🇷 · chantier + 3 biens à Dakar</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tarifs ─── */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Des tarifs simples et transparents</h2>
            <p className="text-gray-500">Abonnement <strong>selon vos biens gérés</strong> — pas sur vos loyers. Tout en FCFA, sans frais caché.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-center">
            {PLANS.map((plan) => {
              if (plan.variant === "solo") return (
                <div key={plan.name} className="relative rounded-2xl p-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-400 to-sky-400" />
                  <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4"><span>👤</span> Propriétaire solo</div>
                  <h3 className="text-2xl font-bold text-[#1a2744] mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold text-[#1a2744]">{plan.price}</span><span className="text-sm text-gray-500 ml-1">FCFA{plan.period}</span></div>
                  <ul className="space-y-3 mb-8">{plan.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-gray-700"><Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" /><span>{f}</span></li>)}</ul>
                  <Link href="/register?plan=solo" className="block text-center py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm hover:shadow">{plan.cta}</Link>
                </div>
              )
              if (plan.variant === "pro") return (
                <div key={plan.name} className="relative rounded-2xl p-8 bg-[#1a2744] text-white ring-4 ring-[#f97316] shadow-2xl md:scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide">⭐ POPULAIRE</div>
                  <div className="inline-flex items-center gap-1.5 bg-white/10 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full mb-4"><span>🏆</span> Meilleur rapport qualité/prix</div>
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-300 mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold">{plan.price}</span><span className="text-sm text-gray-300 ml-1">FCFA{plan.period}</span></div>
                  <ul className="space-y-3 mb-8">{plan.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#f97316]" /><span>{f}</span></li>)}</ul>
                  <Link href="/register?plan=pro" className="block text-center py-3 rounded-xl font-semibold transition-all bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg hover:shadow-xl">{plan.cta}</Link>
                </div>
              )
              return (
                <div key={plan.name} className="relative rounded-2xl p-8 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white border-2 border-amber-500/40 shadow-md hover:shadow-xl transition-shadow">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-amber-400 to-yellow-500" />
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4"><span>🏢</span> Agence professionnelle</div>
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-amber-200/70 mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold">{plan.price}</span><span className="text-sm text-amber-200/70 ml-1">FCFA{plan.period}</span></div>
                  <ul className="space-y-3 mb-8">{plan.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-white/90"><Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" /><span>{f}</span></li>)}</ul>
                  <Link href="/register?plan=agence" className="block text-center py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-[#1a1a2e] shadow-sm hover:shadow">{plan.cta}</Link>
                </div>
              )
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8 max-w-2xl mx-auto">
            <span className="font-semibold text-[#1a2744]">+ 5% de commission</span> uniquement sur les transactions de
            <strong> services & chantiers</strong> réalisées dans l'app (prélevée à la libération du séquestre).
            <span className="text-gray-400"> Aucune commission sur les loyers.</span>
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-12 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="group bg-white rounded-xl shadow-sm">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-[#1a2744]">{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-500 text-sm">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ─── */}
      <section className="py-20 bg-gradient-to-br from-[#1a2744] to-[#1e3a5f] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à reprendre le contrôle de votre logement ?</h2>
          <p className="text-gray-300 mb-8 text-lg">Propriétaires, locataires, prestataires — rejoignez Locawave et gérez tout votre logement en toute confiance, depuis n'importe où.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Créer mon compte gratuitement <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-400 mt-4">14 jours gratuits — Sans engagement — Sans carte bancaire</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#0f1a2e] text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
                <span className="text-lg font-bold text-white">Locawave</span>
              </div>
              <p className="text-sm">L'OS du logement pour le Sénégal et la diaspora : trouver, louer, gérer, entretenir, servir.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#parcours" className="hover:text-white transition-colors">Le parcours</a></li>
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><Link href="/annonces" className="hover:text-white transition-colors">Trouver un logement</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Trouver un service</Link></li>
                <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="/cgu" className="hover:text-white transition-colors">CGU</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
                <li>support@locawave.sn</li>
                <li className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Dakar, Sénégal</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Locawave. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
