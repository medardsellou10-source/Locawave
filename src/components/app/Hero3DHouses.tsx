"use client"

import { Check, MessageCircle } from "lucide-react"

export function Hero3DHouses() {
  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto select-none" aria-hidden="true">
      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-0.4deg); }
        }
        @keyframes floatMid {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.06); }
        }
        @keyframes shine {
          0% { transform: translateX(-120%) skewX(-20deg); }
          60%, 100% { transform: translateX(220%) skewX(-20deg); }
        }
        .house-lg { animation: floatSlow 7s ease-in-out infinite; transform-origin: center; }
        .house-md { animation: floatMid 5.5s ease-in-out infinite 0.4s; transform-origin: center; }
        .house-sm { animation: floatFast 4.5s ease-in-out infinite 0.8s; transform-origin: center; }
        .glow { animation: pulseGlow 6s ease-in-out infinite; }
        .card-notif { animation: floatMid 6s ease-in-out infinite 0.2s; }
        .card-paid  { animation: floatFast 5s ease-in-out infinite 0.6s; }
        .shine::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: shine 4.5s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Halo doré/orangé */}
      <div className="glow absolute inset-[10%] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,#f97316_0%,#f9731655_40%,transparent_70%)]" />
      {/* Halo bleu secondaire */}
      <div className="glow absolute inset-[20%] rounded-full blur-2xl bg-[radial-gradient(circle_at_70%_60%,#38bdf866_0%,transparent_70%)]" style={{ animationDelay: "1.5s" }} />

      {/* Sol / miroir */}
      <div className="absolute bottom-[8%] left-[8%] right-[8%] h-[14%] rounded-[50%] bg-gradient-to-b from-white/10 to-transparent blur-xl" />

      <svg viewBox="0 0 600 600" className="relative w-full h-full drop-shadow-2xl">
        <defs>
          {/* Toits */}
          <linearGradient id="roofOrange" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="roofDark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          {/* Façades */}
          <linearGradient id="facadeLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="facadeMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          {/* Côtés (ombre) */}
          <linearGradient id="sideDark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="sideMid" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          {/* Fenêtres lumineuses */}
          <linearGradient id="window" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
            <feOffset dx="0" dy="8" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ─── Maison arrière (petite) ─── */}
        <g className="house-sm" filter="url(#softShadow)">
          <g transform="translate(420 170)">
            {/* Côté */}
            <polygon points="0,60 50,40 50,150 0,170" fill="url(#sideMid)" />
            {/* Façade */}
            <polygon points="0,60 -90,100 -90,210 0,170" fill="url(#facadeMid)" />
            {/* Toit */}
            <polygon points="0,60 50,40 -40,0 -90,20" fill="url(#roofDark)" />
            <polygon points="0,60 -90,20 -90,100" fill="#d97706" opacity="0.75" />
            {/* Fenêtre */}
            <rect x="-65" y="120" width="22" height="26" rx="2" fill="url(#window)" />
          </g>
        </g>

        {/* ─── Maison principale (grande, centrale) ─── */}
        <g className="house-lg" filter="url(#softShadow)">
          <g transform="translate(300 270)">
            {/* Côté droit */}
            <polygon points="0,80 90,40 90,240 0,280" fill="url(#sideDark)" />
            {/* Façade */}
            <polygon points="0,80 -140,140 -140,340 0,280" fill="url(#facadeLight)" />
            {/* Toit (2 pentes) */}
            <polygon points="0,80 90,40 -50,-30 -140,10" fill="url(#roofOrange)" />
            <polygon points="0,80 -140,10 -140,140" fill="#9a3412" opacity="0.85" />
            {/* Faîtage */}
            <polygon points="-50,-30 -140,10 -140,0 -50,-40" fill="#7c2d12" opacity="0.6" />

            {/* Porte */}
            <rect x="-85" y="220" width="38" height="60" rx="3" fill="#1a2744" />
            <circle cx="-53" cy="252" r="2" fill="#f97316" />
            {/* Fenêtres façade */}
            <rect x="-125" y="170" width="28" height="34" rx="2" fill="url(#window)" />
            <rect x="-30" y="170" width="28" height="34" rx="2" fill="url(#window)" />
            <rect x="-125" y="230" width="28" height="34" rx="2" fill="url(#window)" opacity="0.6" />
            {/* Fenêtre côté */}
            <polygon points="30,120 70,100 70,150 30,170" fill="url(#window)" opacity="0.75" />
          </g>
        </g>

        {/* ─── Maison avant (moyenne, gauche) ─── */}
        <g className="house-md" filter="url(#softShadow)">
          <g transform="translate(175 360)">
            {/* Côté */}
            <polygon points="0,70 70,40 70,190 0,220" fill="url(#sideMid)" />
            {/* Façade */}
            <polygon points="0,70 -110,120 -110,270 0,220" fill="url(#facadeLight)" />
            {/* Toit */}
            <polygon points="0,70 70,40 -40,-10 -110,20" fill="url(#roofOrange)" />
            <polygon points="0,70 -110,20 -110,120" fill="#9a3412" opacity="0.8" />
            {/* Porte */}
            <rect x="-65" y="180" width="32" height="50" rx="3" fill="#1a2744" />
            {/* Fenêtres */}
            <rect x="-100" y="145" width="22" height="26" rx="2" fill="url(#window)" />
            <rect x="-22" y="145" width="22" height="26" rx="2" fill="url(#window)" />
          </g>
        </g>
      </svg>

      {/* ─── Carte flottante : Rappel WhatsApp ─── */}
      <div className="card-notif absolute top-[8%] left-[2%] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl px-4 py-3 border border-white/50 flex items-center gap-3 max-w-[220px]">
        <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#1a2744] leading-tight">Rappel envoyé</p>
          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Loyer Avril · 150 000 FCFA</p>
        </div>
      </div>

      {/* ─── Carte flottante : Paiement reçu ─── */}
      <div className="card-paid absolute bottom-[10%] right-[0%] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl px-4 py-3 border border-white/50 flex items-center gap-3 max-w-[230px] relative overflow-hidden">
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shine">
          <Check className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-[#1a2744] leading-tight">Loyer payé</p>
          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Wave · Quittance générée</p>
        </div>
      </div>

      {/* Petites étoiles/particules */}
      <div className="absolute top-[30%] right-[10%] w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_12px_#fbbf24]" />
      <div className="absolute top-[15%] right-[35%] w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_10px_#ffffff]" />
      <div className="absolute bottom-[30%] left-[5%] w-1.5 h-1.5 rounded-full bg-[#f97316] shadow-[0_0_10px_#f97316]" />
    </div>
  )
}
