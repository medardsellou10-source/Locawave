# Locawave OS — Contexte projet

## Produit
Système d'exploitation du logement au Sénégal. Parcours unique :
TROUVER → LOUER → GÉRER → ENTRETENIR → SERVIR. Cible : propriétaires
(dont diaspora), locataires, prestataires/aidants, et chercheurs de logement.

> État réel du projet : SaaS B2B déjà en production pour propriétaires/agences
> (organisations, abonnements trial/solo/pro/agence, parrainage, billing, OCR
> Wave/OM, rappels WhatsApp + cron, quittances PDF). On l'étend, phase par phase,
> vers l'OS du logement SANS casser l'existant (cf. Master Build, 12 phases).

## Stack
Next.js 14 App Router, TypeScript strict, Tailwind, shadcn/ui, PWA.
Supabase (PostgreSQL + PostGIS, Auth, Storage, Realtime, Edge Functions).
Vercel. Cartographie Mapbox/Leaflet. PSP Wave/OM (PayDunya/CinetPay).
WhatsApp via Twilio.

- Projet Supabase : `jgrmltfyktitfffbfhcx` (région eu-north-1).
- Déploiement Vercel : push `origin master` → auto-deploy
  (projet `prj_VAUXdLmden0egYDx8dYt4cRdAusi`, team `team_TdSeXIGm0Sb12rLNCnVSrvfL`).

## Règles non négociables
- RLS activé sur TOUTES les tables, sans exception.
- On ne détient JAMAIS de fonds : séquestre = statut piloté via le PSP.
- UI 100% française, mobile-first, montants en FCFA (EUR en option).
- Tout prestataire/aidant affiché et tout propriétaire qui publie une annonce
  doit être vérifié (KYC).
- Seuls les clients ayant réellement réservé / loué peuvent laisser un avis.
- La transaction reste DANS l'app (messagerie intégrée) ; jamais un simple
  échange de numéro.
- Réutiliser le module Confiance (reporting, séquestre, audit) partout.

## Architecture d'identité (réconciliation B2B + consommateur)
- `organizations` + `users` (owner/manager/viewer) : socle B2B existant, conservé.
- `profiles` (⇄ auth.users, role owner/tenant/provider/seeker/admin) : identité
  canonique de tout compte auth ; trigger de création à l'inscription.
- `tenants` : fiche contact existante ; colonne `profile_id` la relie à un compte
  auth invité (espace locataire).
- Paiement loyer : `rent_schedules` (échéances) + `payments` (règlements). On
  conserve l'OCR Wave/OM existant ET on ajoute le PSP (liens + webhook + séquestre).
- `maintenance_requests` évolue vers `incidents` (geo, urgency, charge_to).

## Conventions
- Server Components par défaut ; 'use client' seulement si nécessaire.
- Validation des entrées avec Zod. Erreurs gérées explicitement.
- Tables et colonnes en snake_case ; types TS en PascalCase.
- Données géo : colonnes geography(Point) + requêtes PostGIS.
- Migrations numérotées dans `supabase/migrations/` (suite à partir de 018).

## Avant de coder une feature
1. Lire le schéma concerné (et le code existant s'il y en a).
2. Proposer un plan et attendre ma validation. NE PAS coder avant.
3. Écrire migration SQL + RLS + types + composant + test minimal.
4. À la fin, me donner la checklist de test de la phase.

## Workflow par phase
plan → validation → code → test → commit + push `origin master` → vérif Vercel.
Une phase = un commit propre. On n'avance jamais sans avoir testé + commité.
