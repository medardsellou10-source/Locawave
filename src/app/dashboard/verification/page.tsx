"use client"

export const dynamic = "force-dynamic"

import { KycUpload } from "@/components/app/KycUpload"

export default function VerificationPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Vérification</h1>
      <p className="text-gray-500 text-sm mb-6">
        Faites vérifier votre identité pour publier des annonces et inspirer confiance
        à vos locataires. Vos documents sont stockés de façon sécurisée et privée.
      </p>
      <KycUpload />
    </div>
  )
}
