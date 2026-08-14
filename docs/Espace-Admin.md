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
| 3 | **Organisations & abonnements** — plans, essais, prolongation, changement de plan, revenus par organisation | ✅ fait |
| 4 | **Finances** — paiements, liens PSP, quittances, impayés, commissions, exports | ✅ fait |
| 5 | **Annonces & modération** — annonces, prestataires, avis, KYC (reprise de `/dashboard/admin/*`) | ✅ fait |
| 6 | **Confiance & litiges** — litiges, cautions, arbitrage, journal métier | ✅ fait |
| 7 | **Base & sécurité** — inventaire des tables et de leur RLS, migrations appliquées, tâches cron, variables d'environnement présentes, santé | ✅ fait |
| 8 | **Journal & réglages** — recherche dans `admin_actions`, interrupteurs de plateforme (maintenance, inscriptions, annonces, rappels, paiement), gestion des administrateurs | ✅ fait |

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

## L'accès ne s'obtient que par invitation

Le super-admin crée une invitation depuis « Réglages ». Elle produit un lien qui
vaut accès — **une fois, pour une seule personne, et pas au-delà de sa date**.

- La base ne stocke que **l'empreinte** du jeton (SHA-256). Une fuite de la base
  ne donne aucune invitation utilisable, et le lien clair n'est affiché qu'une
  seule fois, à sa création.
- Un email posé sur l'invitation la **verrouille sur cette adresse** : même
  interceptée, elle ne sert à personne d'autre.
- L'acceptation exige une session : on sait donc toujours à qui l'accès est
  donné. La page vit à `/acces-admin`, hors de `/admin` — sinon elle serait
  invisible pour l'invité, qui n'est pas encore administrateur.
- Un lien déjà servi, révoqué, expiré ou inconnu reçoit **le même message**.
  Détailler renseignerait qui cherche à deviner.

Aucune policy d'écriture n'existe sur `admin_invitations` : tout passe par les
fonctions, qui vérifient les droits elles-mêmes.

## Objets créés en base (migrations 066 à 075)

- `platform_admins` — qui a le droit d'entrer (`is_super` = peut nommer/révoquer).
- `admin_actions` — journal des actions admin, en ajout seul, lisible des admins.
- `admin_settings` — réglages globaux (5 interrupteurs posés, câblés à l'étape 8).
- `is_admin()` / `is_super_admin()` — refondues sur `platform_admins`.
- `admin_overview()` — tous les chiffres de la plateforme en un appel.
- `admin_invitations` + `admin_create_invitation()`, `admin_accept_invitation()`,
  `admin_revoke_invitation()`, `admin_invitations_list()` — l'entrée par invitation.
- `admin_accounts()` / `admin_account_detail()` — la liste filtrable et la fiche.
- `admin_log_action()` — écrit au journal (relève l'IP et l'agent dans les
  en-têtes de la requête, que PostgREST expose à la base).
- `admin_assert_can_target()` — la garde partagée par toutes les actions.
- `admin_set_account_role()`, `admin_set_account_suspension()`,
  `admin_set_platform_admin()` — les trois écritures sur un compte.
- `admin_organizations()` / `admin_organization_detail()` — les organisations.
- `admin_set_org_plan()`, `admin_extend_org()` — plan et échéance.
- `admin_finances()` — la synthèse sur une période.
- `admin_payments()` — les règlements ligne à ligne, filtrables.
- `admin_moderation()` — les quatre files (identités, prestataires, annonces, avis).
- `admin_decide_kyc()`, `admin_set_provider_verified()`,
  `admin_set_listing_published()`, `admin_set_review_hidden()` — les décisions.
- `admin_trust()` — litiges, créances contestées, cautions, journal métier.
- `admin_resolve_dispute()` — l'arbitrage.
- `admin_system()` — tables, RLS, policies, fonctions à privilèges, buckets,
  tâches planifiées, migrations, extensions.
- `admin_journal()` — l'historique des actions admin, cherchable.
- `admin_settings_view()`, `admin_set_setting()` — les interrupteurs.
- `reglage_actif()` / `mode_maintenance()` — lus par le code qui les applique.

## Un interrupteur qui n'éteint rien serait pire qu'absent

Les cinq réglages sont branchés à l'endroit qui les applique, pas seulement
affichés :

| Interrupteur | Où il agit |
|---|---|
| Mode maintenance | middleware — page de maintenance pour tous sauf les administrateurs |
| Inscriptions ouvertes | `/api/auth/setup-org` et `/api/auth/setup-role` (503) |
| Paiement en ligne | `/api/psp/create-link` (503) ; les liens déjà envoyés restent honorés |
| Rappels WhatsApp | commande des tâches `lw_rent_reminders` et `lw_escalating_reminders` |
| Annonces publiques | marketplace publique |

`reglage_actif()` répond « cette fonctionnalité marche-t-elle ? » et retombe sur
OUI si la ligne manque. **Le mode maintenance a sa propre fonction**,
`mode_maintenance()` : la question y est inversée (« l'application est-elle
coupée ? ») et le repli sûr aussi — ligne absente = pas de maintenance. Sans
cette distinction, supprimer une ligne de réglage aurait mis toute la plateforme
à l'arrêt.

## La salle des machines est en lecture seule

`/admin/systeme` montre ce que la base sait d'elle-même : tables et RLS, nombre
de policies, comptage exact des lignes, fonctions `SECURITY DEFINER` (avec ou
sans `search_path` figé, exécutables ou non sans être connecté), buckets publics
ou privés, tâches planifiées et leur dernier passage, migrations appliquées,
extensions. Plus, côté serveur, la version déployée et la **présence** des
variables d'environnement — jamais leur valeur.

Pas de console SQL, et ce n'est pas un oubli : une console qui laisse exécuter du
SQL arbitraire n'est plus une console d'administration mais une porte dérobée. Le
jour où une session d'administrateur fuite, elle donne la base entière.

Deux principes de mesure, appris en construisant la page :
- **Ne jamais compter les objets d'extension** (PostGIS) comme les nôtres : une
  alerte qu'on ne peut pas éteindre cesse d'être lue.
- **Compter les lignes exactement**, pas via `reltuples` : celui-ci vaut -1 tant
  qu'une table n'a pas été analysée, ce qui affichait « 0 ligne » sur des tables
  pleines.

## Arbitrer, ce n'est pas rendre de l'argent

Locawave ne détient jamais de fonds. `work_orders.payment_state` est l'état d'une
**créance** entre deux personnes — `not_due`, `due`, `disputed`, `settled`,
`cancelled` — pas celui d'un dépôt gardé quelque part.

Ouvrir un litige suspend l'exigibilité (`due` → `disputed`). Trancher dit si la
somme reste due (`due`) ou ne l'est plus (`cancelled`). Le mouvement est fait par
le trigger `trg_dispute`, seul habilité ; la fonction d'arbitrage se contente de
poser la décision et sa motivation.

Deux règles : **une décision demande une motivation écrite** — les deux parties
la liront — et **un litige clos ne se rejuge pas**.

Les cautions, elles, restent pilotées par le propriétaire depuis la fiche du
bail. La console les regarde et signale l'anomalie (une caution retenue sur un
bail qui n'est plus actif) sans décider à sa place.

## Règles de modération portées par la base

- **Un refus demande un motif.** Refus de pièce d'identité, dépublication
  d'annonce, masquage d'avis : sans motif, la fonction SQL refuse. Le motif est
  transmis à la personne concernée.
- **Un prestataire ne se vérifie pas avant son identité.** Le badge « vérifié »
  promet au client un contrôle ; le poser sans pièce validée serait mentir.
- **Un avis se masque, il ne se supprime pas.** Colonnes `hidden_at`,
  `hidden_by`, `hidden_reason` sur `reviews`, et la policy publique exclut les
  avis masqués. Effacer la parole d'un client sans trace n'est pas de la
  modération.
- **`listings.depublished_by`** accepte désormais `admin`, en plus de `system` et
  `owner` : une dépublication décidée en console est une cause distincte.

Les anciennes pages `/dashboard/admin/kyc` et `/dashboard/admin/providers` sont
supprimées — la console les remplace. L'entrée du tableau de bord propriétaire
pointe vers `/admin` et se fonde sur `platform_admins`, plus sur `profiles.role`.

## La page Finances ne modifie rien

Volontairement : un règlement constaté se corrige là où il a été saisi, par celui
qui l'a saisi. Corriger d'un clic depuis la console ferait cesser la comptabilité
du propriétaire d'être la sienne.

Le seul geste possible est l'export CSV — et il est journalisé comme une action
admin, avec le nombre de lignes et le total emportés : sortir des données de la
plateforme laisse une trace.

## Trois montants à ne jamais confondre

La console sépare partout :

1. **Loyers encaissés** — l'argent du propriétaire. Locawave ne détient jamais
   ces fonds ; ce n'est pas un revenu, c'est une donnée de gestion.
2. **Abonnements** (`subscription_payments`) — ce que l'organisation paie à
   Locawave.
3. **Commissions** (`commissions`) — 5 % sur les services et chantiers validés.

Seuls les deux derniers sont nos revenus. La fiche d'une organisation les affiche
sous ces noms-là, jamais additionnés aux loyers.

## Failles fermées au passage

Deux escalades de privilèges existaient réellement en production :

1. `profiles.role` et `profiles.kyc_status` étaient modifiables par le titulaire
   du compte (la RLS autorise la ligne, sans distinguer les colonnes). N'importe
   quel compte pouvait donc se déclarer `admin` et se marquer « vérifié ».
   → droits retirés au niveau colonne (`REVOKE UPDATE (…)`).
2. `handle_new_user()` acceptait `role: 'admin'` transmis dans les métadonnées
   d'inscription. → `admin` n'est plus attribuable à l'inscription.
