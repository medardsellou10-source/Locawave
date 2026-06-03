import type { MetadataRoute } from "next"

// PWA installable — manifest généré par Next (route /manifest.webmanifest)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Locawave — L'OS du logement au Sénégal",
    short_name: "Locawave",
    description:
      "Trouver, louer, gérer, entretenir et servir le logement au Sénégal. Loyers, quittances, incidents, prestataires et services de proximité.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#f97316",
    lang: "fr",
    categories: ["business", "finance", "productivity"],
    icons: [
      { src: "/icons/icon-512.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  }
}
