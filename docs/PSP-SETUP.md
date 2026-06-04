# Intégration paiement réel — Wave + Orange Money via PayDunya

> ⚠️ **Ce que je (l'assistant) ne fais pas** : créer ton compte PayDunya, saisir ton mot de passe
> ou tes identifiants financiers. Ce sont des actions que tu dois réaliser toi-même. Ci-dessous le
> guide complet ; le code de l'app est déjà prêt à recevoir les clés.

## Pourquoi PayDunya
PayDunya est un agrégateur sénégalais : **un seul compte** te donne **Wave + Orange Money + cartes**.
Locawave ne détient jamais les fonds — on crée un lien de paiement chez PayDunya, le client paie,
et PayDunya nous notifie (webhook) pour passer l'échéance à « payé » et générer la quittance.

## Étape 1 — Créer le compte (toi)
1. Va sur **https://paydunya.com** → « Créer un compte » (compte **Business**).
2. Renseigne ton **email** et un **mot de passe** (les tiens — ne me les communique pas).
3. Valide l'email reçu.

## Étape 2 — Vérification (KYB Sénégal)
Prépare et téléverse :
- Pièce d'identité du représentant (CNI ou passeport).
- **NINEA** et/ou **RCCM** si entreprise (ou profil particulier/auto-entrepreneur selon ton statut).
- Numéro de téléphone professionnel.
- **Compte de versement** (numéro Wave / Orange Money ou compte bancaire) où PayDunya te reversera.

## Étape 3 — Activer les moyens de paiement
Dans le tableau de bord PayDunya → moyens de paiement : active **Wave** et **Orange Money**
(et cartes si tu veux la diaspora).

## Étape 4 — Récupérer les clés API
Tableau de bord → **API / Intégration**. Note (en mode **test** d'abord, puis **live**) :
- `Master Key`
- `Private Key`
- `Token`
- `Public Key`

## Étape 5 — Configurer le webhook (IPN)
Webhook / URL de notification (callback) =
```
https://jgrmltfyktitfffbfhcx.supabase.co/functions/v1/psp-webhook
```
C'est cette fonction qui encaisse l'échéance et génère la quittance, de façon idempotente.

## Étape 6 — Renseigner les secrets (toi — ne jamais committer)
### a) Vercel → Project Settings → Environment Variables
```
PSP_PROVIDER=paydunya
PAYDUNYA_MODE=test            # puis "live" en production
PAYDUNYA_MASTER_KEY=...
PAYDUNYA_PRIVATE_KEY=...
PAYDUNYA_TOKEN=...
PAYDUNYA_PUBLIC_KEY=...
PAYDUNYA_STORE_NAME=Locawave
```
### b) Supabase → Edge Functions → Secrets (pour `psp-webhook`)
```
PSP_WEBHOOK_SECRET=<une chaîne secrète forte que tu choisis>
```
> `PSP_WEBHOOK_SECRET` sert à vérifier la signature HMAC du webhook. Configure la même valeur côté
> PayDunya si l'option de signature est disponible, sinon adapte le header attendu dans
> `supabase/functions/psp-webhook/index.ts` (déjà tolérant : `x-psp-signature` / `x-paydunya-signature`).

## Étape 7 — Tester de bout en bout
1. En mode `test`, depuis l'espace locataire → « Payer maintenant » → un lien PayDunya s'ouvre.
2. Paie avec un compte test → PayDunya appelle le webhook → l'échéance passe **payé** + quittance PDF.
3. Vérifie dans `activity_logs` (action `psp_webhook`) et dans `payments`.
4. Quand tout est bon, bascule `PAYDUNYA_MODE=live` + clés live.

## Ce qui est déjà prêt dans le code (rien à coder côté toi)
- `src/lib/psp.ts` : création du lien PayDunya (`checkout-invoice/create`) — actif dès que les clés
  sont posées (`PSP_PROVIDER=paydunya`).
- `supabase/functions/psp-webhook/index.ts` : réception webhook, vérif signature, idempotence,
  passage `paid`, génération quittance `LW-AAAA-NNNN`.
- Le **séquestre** (services/chantiers) et la **commission 5%** se déclenchent aux mêmes statuts PSP.

## Rappel sécurité
- Ne mets jamais les clés dans le code / Git : uniquement dans les variables d'environnement.
- Garde le mode `test` tant que le bout-en-bout n'est pas validé.
