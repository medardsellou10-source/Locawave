import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppSupportButton } from "@/components/app/WhatsAppSupportButton";
import { PWARegister } from "@/components/app/PWARegister";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Locawave — Gestion locative intelligente au Sénégal",
    template: "%s | Locawave",
  },
  description: "Gérez vos loyers au Sénégal depuis n'importe où. Rappels automatiques, quittances PDF, paiements Wave & Orange Money. Conçu pour les propriétaires sénégalais et la diaspora.",
  keywords: ["gestion locative", "Sénégal", "loyer", "immobilier", "Wave", "Orange Money", "Dakar", "diaspora", "quittance", "bail"],
  authors: [{ name: "Locawave" }],
  // Le domaine locawave.sn ne répond pas (vérifié : HTTP 000). Tant qu'il n'est
  // pas en service, les URLs canoniques et les images de partage social doivent
  // pointer vers le domaine réellement servi, sinon aucun aperçu ne se charge.
  // NEXT_PUBLIC_SITE_URL permet de basculer sans redéployer le code.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://locawave.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "/",
    siteName: "Locawave",
    title: "Locawave — Gestion locative intelligente au Sénégal",
    description: "Rappels de loyer automatiques, quittances PDF, paiements Wave & Orange Money. La solution de gestion locative pour le Sénégal et la diaspora.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Locawave — Gestion locative au Sénégal",
    description: "Rappels de loyer automatiques, quittances PDF, paiements Wave & Orange Money.",
    creator: "@locawave",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    // Relatif : résolu contre metadataBase, donc juste quel que soit le domaine.
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Locawave",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", geistSans.variable)} suppressHydrationWarning>
      {/* suppressHydrationWarning : certaines extensions de navigateur (gestionnaires de
          mots de passe, etc.) injectent des attributs dans <body> avant l'hydratation,
          ce qui déclenchait des erreurs React #418/#423 côté client. */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster richColors position="top-center" />
        <WhatsAppSupportButton />
        <PWARegister />
      </body>
    </html>
  );
}
