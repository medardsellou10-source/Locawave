# Checklist finale de mise en production — Locawave

Toutes les **actions qui te reviennent** (je ne peux pas saisir d'identifiants/secrets) regroupées
ici. Le code, les migrations, les crons et les webhooks sont déjà en place et déployés.

Projet Supabase : `jgrmltfyktitfffbfhcx` · App : `https://locawave.vercel.app`

---

## 1) Vault Supabase — activer l'automatisation des rappels  ⏱️ 2 min
Sans ce secret, les crons sont propres mais **n'appellent pas** les edge functions (rappels/alertes).
- Supabase → **Project Settings → Vault** (ou SQL `select vault.create_secret(...)`).
- Crée un secret nommé **exactement** `service_role_key`.
- Valeur = ta clé **`service_role`** (Project Settings → API → `service_role` secret).
- ✅ Vérif : le lendemain, `cron.job_run_details` ne montre plus d'erreur 401 sur les tâches `lw_*`.

## 2) Twilio — envoi WhatsApp réel  ⏱️ 15 min
Nécessaire pour que les rappels/alertes partent réellement (sinon tout est prêt mais rien n'est émis).
- Crée/active un compte Twilio + un **expéditeur WhatsApp** (sender approuvé).
- Supabase → **Edge Functions → Secrets** (utilisés par `send-whatsapp`) :
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `WHATSAPP_FROM`  (ex. `whatsapp:+14155238886`)
- ✅ Vérif : un rappel J-5 de test arrive sur un numéro locataire renseigné.

## 3) PayDunya — paiements Wave + Orange Money  ⏱️ 30 min + KYB
Détail complet : **`docs/PSP-SETUP.md`**. En résumé :
- Crée ton compte PayDunya Business (ton email + **ton** mot de passe — ne me les transmets pas),
  fais le **KYB** (CNI, NINEA/RCCM, compte de versement), active **Wave + Orange Money**.
- Récupère les clés (Master/Private/Token/Public) en **test** puis **live**.
- Webhook (IPN) = `https://jgrmltfyktitfffbfhcx.supabase.co/functions/v1/psp-webhook`
- Secrets **Vercel** : `PSP_PROVIDER=paydunya`, `PAYDUNYA_MODE=test`, `PAYDUNYA_MASTER_KEY`,
  `PAYDUNYA_PRIVATE_KEY`, `PAYDUNYA_TOKEN`, `PAYDUNYA_PUBLIC_KEY`, `PAYDUNYA_STORE_NAME=Locawave`.
- Secret **Supabase Edge** : `PSP_WEBHOOK_SECRET` (chaîne forte de ton choix).
- ✅ Vérif : paiement test → échéance passe `payé` + quittance PDF ; bascule ensuite `PAYDUNYA_MODE=live`.

## 4) Supabase Auth — URLs (magic links / redirections)  ⏱️ 3 min
Sinon les liens d'invitation/connexion renvoient vers `localhost`.
- Supabase → **Authentication → URL Configuration** :
  - **Site URL** = `https://locawave.vercel.app`
  - **Redirect URLs** = `https://locawave.vercel.app/**` (+ `http://localhost:3000/**` pour le dev).

## 5) Supabase Auth — protection mots de passe  ⏱️ 1 min
- **Authentication → Policies / Password** : activer **Leaked Password Protection** (HaveIBeenPwned).
  (Recommandé par l'advisor sécurité.)

## 6) Vérifs finales  ⏱️ 10 min
- [ ] RLS active sur toutes les tables applicatives (déjà vérifié — seul `spatial_ref_sys` système).
- [ ] `cron.job` = set unique `lw_*` (8) + `generate_due_bookings_daily` (aucun doublon).
- [ ] Domaine : (optionnel) brancher `locawave.sn` sur Vercel.
- [ ] Sauvegarde Supabase activée + plan de rollback (Vercel : « Promote » d'un déploiement précédent).
- [ ] Parcours critiques testés : paiement loyer · incident · candidature→bail · chantier (financer→valider).
- [ ] (Si données de démo à retirer avant lancement public : me le demander, je fournis le script SQL.)

---

### Déjà fait (rien à faire de ton côté)
- 16 migrations + crons propres, RLS, séquestre, Trust Score, litiges, commissions.
- PWA installable, landing premium, bouton Retour, onglet Automatisations.
- Edge functions (rappels J-5/J/J+3, alerte impayés, baux, rapports, send-whatsapp, psp-webhook).
- Déploiement auto Vercel sur `git push origin master` (+ `master:main`).
