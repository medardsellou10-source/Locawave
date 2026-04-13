import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppSupportButton } from "@/components/app/WhatsAppSupportButton";

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
  description: "Gérez vos loyers au Sénégal depuis n'importe où. Rappels WhatsApp automatiques, quittances PDF, paiements Wave & Orange Money. Conçu pour les propriétaires sénégalais et la diaspora.",
  keywords: ["gestion locative", "Sénégal", "loyer", "immobilier", "Wave", "Orange Money", "WhatsApp", "Dakar", "diaspora", "quittance", "bail"],
  authors: [{ name: "Locawave", url: "https://locawave.sn" }],
  metadataBase: new URL("https://locawave.sn"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "https://locawave.sn",
    siteName: "Locawave",
    title: "Locawave — Gestion locative intelligente au Sénégal",
    description: "Rappels WhatsApp automatiques, quittances PDF, paiements Wave & Orange Money. La solution de gestion locative pour le Sénégal et la diaspora.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Locawave — Gestion locative au Sénégal",
    description: "Rappels WhatsApp automatiques, quittances PDF, paiements Wave & Orange Money.",
    creator: "@locawave",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://locawave.sn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", geistSans.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-center" />
        <WhatsAppSupportButton />
      </body>
    </html>
  );
}
