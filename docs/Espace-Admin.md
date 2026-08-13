# Espace admin Locawave — plan de construction

Console d'administration de la plateforme, à l'adresse `/admin`. Elle donne une
vue sur **tout** ce qui se passe dans le logiciel, toutes organisations
confondues, et n'est visible que du compte fondateur.

## Comment l'accès est verrouillé

L'autorité est la table `platform_admins` — et elle seule. `profiles.role`
n'ouvre plus aucune porte (il servait avant, et n'importe qui pouvait se le
donner). Trois verrous se superposent :

1. **Middleware** — `/admin` répond 404 à tout compte non administrateur. Pas de
   redirection vers `/login` : ce serait avouer que la page existe.
2. **Layout serveur** — `requireAdmin()` appelle `notFound()`. Un layout App
   Router n'est pas contournable.
3. **Base** — policies RLS et fonctions `SECURITY DEFINER` gardées par
   `is_admin()`. Même avec la bonne URL et un jeton valide, la base ne répond pas.

Ajouter ou retirer un administrateur ne se fait que par `service_role` (depuis la
console, réservé au super-admin) ou en SQL direct : aucune policy `INSERT` ou
`UPDATE` n'existe sur `platform_admins`.

**Lectures** : fonctions RPC gardées par `is_admin()`, appelées avec la session de
l'administrateur — aucune clé `service_role` ne circule pour afficher une page.
**Écritures** : fonctions SQL `SECURITY DEFINER` gardées par `is_admin()`,
appelées par un route handler qui a d'abord authentifié l'appelant — et toujours
tracées dans `admin_actions` (journal en ajout seul). Voir « Où vivent les
écritures » plus bas.

## Étapes

| # | Rubrique | État |
|---|----------|------|
| 1 | **Socle & vue d'ensemble** — `platform_admins`, fermeture des escalades de privilèges, `admin_actions`, `admin_settings`, KPI plateforme | ✅ fait |
| 2 | **Comptes** — tous les comptes, filtres, fiche détaillée, changement de rôle, suspension, réinitialisation de mot de passe | ✅ fait |
| 3 | **Organisations & abonnements** — plans, essais, prolongation, changement de plan, revenus par organisation | ⬜ |
| 4 | **Finances** — paiements, liens PSP, quittances, impayés, commissions, exports | ⬜ |
| 5 | **Annonces & modération** — annonces, prestataires, avis, KYC (reprise de `/dashboard/admin/*`) | ⬜ |
| 6 | **Confiance & litiges** — litiges, cautions, arbitrage, journal métier | ⬜ |
| 7 | **Base & sécurité** — inventaire des tables et de leur RLS, migrations appliquées, tâches cron, Edge Functions, variables d'environnement présentes, santé | ⬜ |
| 8 | **Journal & réglages** — recherche dans `admin_actions`, interrupteurs de plateforme (maintenance, inscriptions, annonces, rappels, paiement), gestion des administrateurs | ⬜ |

## Où vivent les écritures

Les actions administratives ne sont pas écrites dans le code Next : ce sont des
fonctions SQL `SECURITY DEFINER` (migration 068) qui revérifient les droits,
appliquent le changement et journalisent, en une seule transaction. Le route
handler `/api/admin/…` se contente d'authentifier l'appelant et de transmettre.

Deux conséquences : la console n'a pas besoin de la clé `service_role` pour
fonctionner (la session de l'administrateur suffit), et contourner le code Next
ne contourne aucun garde-fou.

Garde-fous portés par la base, pour toute action sur un compte :
jamais sur son propre compte, jamais sur un super-admin, et un compte
administrateur ne se touche qu'entre super-admins.

Seule exception : le lien de réinitialisation de mot de passe, qui exige l'API
Auth admin — donc `SUPABASE_SERVICE_ROLE_KEY`. Sans elle, l'action répond 503
avec un message explicite ; le reste de la console fonctionne.

## Objets créés en base (migrations 066 à 068)

- `platform_admins` — qui a le droit d'entrer (`is_super` = peut nommer/révoquer).
- `admin_actions` — journal des actions admin, en ajout seul, lisible des admins.
- `admin_settings` — réglages globaux (5 interrupteurs posés, câblés à l'étape 8).
- `is_admin()` / `is_super_admin()` — refondues sur `platform_admins`.
- `admin_overview()` — tous les chiffres de la plateforme en un appel.
- `admin_accounts()` / `admin_account_detail()` — la liste filtrable et la fiche.
- `admin_log_action()` — écrit au journal (relève l'IP et l'agent dans les
  en-têtes de la requête, que PostgREST expose à la base).
- `admin_assert_can_target()` — la garde partagée par toutes les actions.
- `admin_set_account_role()`, `admin_set_account_suspension()`,
  `admin_set_platform_admin()` — les trois écritures sur un compte.

## Failles fermées au passage

Deux escalades de privilèges existaient réellement en production :

1. `profiles.role` et `profiles.kyc_status` étaient modifiables par le titulaire
   du compte (la RLS autorise la ligne, sans distinguer les colonnes). N'importe
   quel compte pouvait donc se déclarer `admin` et se marquer « vérifié ».
   → droits retirés au niveau colonne (`REVOKE UPDATE (…)`).
2. `handle_new_user()` acceptait `role: 'admin'` transmis dans les métadonnées
   d'inscription. → `admin` n'est plus attribuable à l'inscription.
