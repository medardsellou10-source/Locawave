"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, Bell, FileText, ChevronDown, Check, ArrowRight, Shield, Smartphone, BarChart3, Menu, X } from "lucide-react"
import { Hero3DHouses } from "@/components/app/Hero3DHouses"

const PLANS = [
  {
    name: "Solo",
    price: "10 000",
    period: "/mois",
    description: "Pour les propriétaires individuels",
    features: ["Jusqu'à 5 biens", "Rappels WhatsApp automatiques", "Quittances PDF", "1 utilisateur"],
    cta: "Commencer gratuitement",
    popular: false,
    variant: "solo" as const,
  },
  {
    name: "Pro",
    price: "20 000",
    period: "/mois",
    description: "Pour les gestionnaires actifs",
    features: ["Jusqu'à 25 biens", "Rappels WhatsApp automatiques", "Quittances PDF", "Rapports mensuels", "3 utilisateurs", "Support prioritaire"],
    cta: "Essai gratuit 14 jours",
    popular: true,
    variant: "pro" as const,
  },
  {
    name: "Agence",
    price: "45 000",
    period: "/mois",
    description: "Pour les agences immobilières",
    features: ["Biens illimités", "Rappels WhatsApp automatiques", "Quittances PDF", "Rapports avancés", "Utilisateurs illimités", "API & intégrations", "Support dédié"],
    cta: "Contacter l'équipe",
    popular: false,
    variant: "agence" as const,
  },
]

const FAQ = [
  { q: "Locawave fonctionne-t-il au Sénégal ?", a: "Oui ! Locawave est conçu spécifiquement pour le marché sénégalais. Tous les montants sont en FCFA, les rappels passent par WhatsApp, et les paiements Wave/Orange Money sont supportés." },
  { q: "Dois-je installer une application ?", a: "Non, Locawave est une application web accessible depuis n'importe quel navigateur (téléphone, tablette ou ordinateur). Aucune installation requise." },
  { q: "Comment fonctionnent les rappels WhatsApp ?", a: "Locawave envoie automatiquement des rappels à vos locataires 5 jours avant l'échéance, le jour J, et 3 jours après en cas de retard. Vous personnalisez les messages." },
  { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Vos données sont hébergées sur des serveurs sécurisés en Europe (Supabase). Locawave est conforme à la loi sénégalaise 2008-12 sur la protection des données personnelles." },
  { q: "Puis-je gérer plusieurs propriétés ?", a: "Oui, même avec le plan Solo vous pouvez gérer jusqu'à 5 biens. Les plans Pro et Agence permettent d'en gérer davantage." },
  { q: "Comment sont générées les quittances ?", a: "Dès qu'un paiement est enregistré, Locawave génère automatiquement une quittance PDF avec numéro séquentiel, prête à être partagée par WhatsApp." },
  { q: "Y a-t-il un engagement ?", a: "Aucun engagement. Vous pouvez annuler votre abonnement à tout moment. L'essai gratuit de 14 jours ne nécessite pas de carte bancaire." },
  { q: "Locawave supporte-t-il la diaspora ?", a: "C'est notre cœur de cible ! Gérez vos biens au Sénégal depuis n'importe où dans le monde. Tableau de bord en temps réel, alertes WhatsApp, rapports mensuels." },
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
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#fonctionnalites" className="hover:text-[#1a2744] transition-colors">Fonctionnalités</a>
            <a href="#tarifs" className="hover:text-[#1a2744] transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-[#1a2744] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-gray-600 hover:text-[#1a2744] transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="text-sm bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-lg transition-colors">
              Essai gratuit
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur shadow-lg">
            <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              <a href="#fonctionnalites" onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-2 text-sm font-medium text-gray-700 hover:text-[#f97316] border-b border-gray-100 transition-colors">
                Fonctionnalités
              </a>
              <a href="#tarifs" onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-2 text-sm font-medium text-gray-700 hover:text-[#f97316] border-b border-gray-100 transition-colors">
                Tarifs
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-2 text-sm font-medium text-gray-700 hover:text-[#f97316] border-b border-gray-100 transition-colors">
                FAQ
              </a>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-2 text-sm font-medium text-gray-700 hover:text-[#f97316] transition-colors">
                Connexion
              </Link>
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
                <span>Conçu pour le Sénégal et la diaspora</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Gérez vos loyers au Sénégal,{" "}
                <span className="text-[#f97316]">depuis n'importe où</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Rappels WhatsApp automatiques, quittances PDF, suivi des paiements Wave — tout ce qu'il faut pour gérer vos biens immobiliers en toute sérénité.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                  Commencer gratuitement <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#fonctionnalites" className="w-full sm:w-auto border border-white/30 hover:bg-white/10 text-white px-8 py-3.5 rounded-lg text-lg transition-colors text-center">
                  Découvrir
                </a>
              </div>
              <p className="text-sm text-gray-400 mt-4">14 jours d'essai gratuit — Aucune carte requise</p>
            </div>
            <div className="relative lg:pl-4">
              <Hero3DHouses />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ─── Bande de confiance ─── */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Paiements & intégrations supportés</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {/* Wave */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-[#1B9AF5] flex items-center justify-center text-white font-black text-sm">W</div>
              <span className="font-bold text-gray-700 text-sm">Wave</span>
            </div>
            {/* Orange Money */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-[#FF6600] flex items-center justify-center text-white font-black text-sm">O</div>
              <span className="font-bold text-gray-700 text-sm">Orange Money</span>
            </div>
            {/* WhatsApp */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white font-black text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">WhatsApp</span>
            </div>
            {/* PDF */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white font-black text-xs">PDF</div>
              <span className="font-bold text-gray-700 text-sm">Quittances PDF</span>
            </div>
            {/* Sécurité */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-[#1a2744] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-700 text-sm">RGPD · Loi 2008-12</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Comment ça marche ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Comment ça marche ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">En moins de 5 minutes, votre gestion locative est automatisée.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion desktop */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#f97316]/30 via-[#f97316] to-[#f97316]/30" />
            {[
              {
                step: "01",
                icon: "🏠",
                title: "Ajoutez vos biens",
                desc: "Renseignez vos propriétés, unités et locataires en quelques clics. Import simplifié.",
                color: "bg-orange-50 border-orange-100",
                badge: "bg-[#f97316]",
              },
              {
                step: "02",
                icon: "📋",
                title: "Créez les baux",
                desc: "Définissez le loyer, la date d'échéance et le dépôt de garantie. Locawave génère le calendrier automatiquement.",
                color: "bg-orange-50 border-orange-200",
                badge: "bg-[#ea580c]",
              },
              {
                step: "03",
                icon: "⚡",
                title: "Tout est automatisé",
                desc: "Rappels WhatsApp, quittances PDF, tableau de bord en temps réel. Vous n'avez plus rien à faire.",
                color: "bg-orange-50 border-orange-300",
                badge: "bg-[#c2410c]",
              },
            ].map((item) => (
              <div key={item.step} className={`relative rounded-2xl p-8 border-2 ${item.color} text-center`}>
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 ${item.badge} rounded-full flex items-center justify-center text-white text-xs font-black`}>
                  {item.step}
                </div>
                <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                <h3 className="text-lg font-bold text-[#1a2744] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3.5 rounded-lg text-base font-semibold transition-colors">
              Essayer gratuitement pendant 14 jours <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Témoignage ─── */}
      <section className="py-16 bg-[#1a2744]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-4xl mb-6">⭐⭐⭐⭐⭐</div>
          <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-6">
            "Avant Locawave, je passais des heures à relancer mes locataires par téléphone depuis Paris. Maintenant tout est automatique — les rappels WhatsApp partent tout seuls et je reçois une notification dès que c'est payé."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold">A</div>
            <div className="text-left">
              <p className="font-semibold text-white">Amadou S.</p>
              <p className="text-gray-400 text-sm">Propriétaire diaspora — Paris 🇫🇷 · 3 biens à Dakar</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problème ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Gérer des loyers au Sénégal, c'est compliqué</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Surtout quand on est loin. Voici les problèmes que Locawave résout.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "😓", title: "Relances manuelles", desc: "Appeler chaque locataire chaque mois pour rappeler le loyer. Du temps perdu, des oublis, des tensions." },
              { icon: "📋", title: "Pas de suivi fiable", desc: "Cahiers, Excel, WhatsApp... Les infos sont dispersées. Impossible de savoir qui a payé quoi." },
              { icon: "🌍", title: "Distance diaspora", desc: "Depuis Paris, New York ou Abidjan, impossible de vérifier les paiements en temps réel." },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-[#1a2744] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Solution / Fonctionnalités ─── */}
      <section id="fonctionnalites" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Tout ce qu'il vous faut, rien de superflu</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Locawave automatise la gestion locative pour que vous puissiez vous concentrer sur l'essentiel.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Bell, title: "Rappels WhatsApp automatiques", desc: "Vos locataires reçoivent un rappel 5 jours avant, le jour J et 3 jours après l'échéance. Zéro effort de votre part.", color: "bg-orange-100 text-orange-600" },
              { icon: FileText, title: "Quittances PDF instantanées", desc: "Dès qu'un paiement est enregistré, la quittance est générée avec numéro séquentiel. Partagez-la en un clic.", color: "bg-blue-100 text-blue-600" },
              { icon: BarChart3, title: "Tableau de bord en temps réel", desc: "Loyers encaissés, impayés, taux de recouvrement — toutes vos métriques actualisées en temps réel.", color: "bg-green-100 text-green-600" },
              { icon: Smartphone, title: "Paiements Wave & OM", desc: "Vos locataires paient par Wave ou Orange Money. Vous enregistrez le paiement en un clic.", color: "bg-purple-100 text-purple-600" },
              { icon: Shield, title: "Données sécurisées (RGPD)", desc: "Hébergement EU, chiffrement, conformité loi sénégalaise 2008-12. Vos données sont protégées.", color: "bg-red-100 text-red-600" },
              { icon: Building2, title: "Multi-biens & multi-lots", desc: "Gérez plusieurs immeubles avec leurs lots respectifs. Vue d'ensemble ou détail par bien.", color: "bg-yellow-100 text-yellow-600" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#1a2744] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tarifs ─── */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a2744] mb-4">Des tarifs simples et transparents</h2>
            <p className="text-gray-500">Tous les prix sont en FCFA. Aucun frais caché.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-center">
            {PLANS.map((plan) => {
              if (plan.variant === "solo") return (
                <div key={plan.name} className="relative rounded-2xl p-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-400 to-sky-400" />
                  <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    <span>👤</span> Propriétaire solo
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a2744] mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-[#1a2744]">{plan.price}</span>
                    <span className="text-sm text-gray-500 ml-1">FCFA{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register?plan=solo"
                    className="block text-center py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm hover:shadow"
                  >
                    {plan.cta}
                  </Link>
                </div>
              )

              if (plan.variant === "pro") return (
                <div key={plan.name} className="relative rounded-2xl p-8 bg-[#1a2744] text-white ring-4 ring-[#f97316] shadow-2xl md:scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide">
                    ⭐ POPULAIRE
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-white/10 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    <span>🏆</span> Meilleur rapport qualité/prix
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-300 mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-gray-300 ml-1">FCFA{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#f97316]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register?plan=pro"
                    className="block text-center py-3 rounded-xl font-semibold transition-all bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg hover:shadow-xl"
                  >
                    {plan.cta}
                  </Link>
                </div>
              )

              // Agence
              return (
                <div key={plan.name} className="relative rounded-2xl p-8 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white border-2 border-amber-500/40 shadow-md hover:shadow-xl transition-shadow">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-amber-400 to-yellow-500" />
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    <span>🏢</span> Agence professionnelle
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-amber-200/70 mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-amber-200/70 ml-1">FCFA{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-white/90">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register?plan=agence"
                    className="block text-center py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-[#1a1a2e] shadow-sm hover:shadow"
                  >
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à simplifier votre gestion locative ?</h2>
          <p className="text-gray-300 mb-8 text-lg">Rejoignez les propriétaires qui ont choisi Locawave pour gérer sereinement leurs biens au Sénégal.</p>
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
                <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Locawave</span>
              </div>
              <p className="text-sm">La gestion locative intelligente pour le Sénégal et la diaspora.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@locawave.sn</li>
                <li>Dakar, Sénégal</li>
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
