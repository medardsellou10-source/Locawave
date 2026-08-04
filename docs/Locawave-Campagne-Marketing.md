# Locawave — Campagne de lancement

> Document généré par une orchestration de 12 agents marketing — recherche,
> stratégie, création, plan média, et une critique adversariale chargée de
> démolir l'ensemble avant que tu n'y mettes ton argent.

**Règle appliquée à tous les chiffres de ce document :** chaque donnée de marché est
soit sourcée (nom + année), soit marquée comme estimation, soit déclarée non
vérifiable. Aucun chiffre n'a été inventé pour faire joli. Vérifie le badge avant
de reprendre une donnée dans un business plan ou face à un investisseur.

**Avant de dépenser le premier franc, lis la section 5.** La critique adversariale
y liste ce qui cloche dans ce dispositif — c'est la partie la plus utile du document.

---

## ⚠️ Règles de conformité — à lire avant toute diffusion

Ce document a été **corrigé le 4 août 2026** après vérification du produit réel.
Les créations initiales promettaient un séquestre qui n'existe pas. Ce qui suit
est vrai ; ne le déforme pas.

### Ce que Locawave fait réellement sur les chantiers

Locawave **n'encaisse pas les travaux et ne bloque aucun fonds**. Vérifié auprès
de GeniusPay : `POST /cashouts` et `POST /payouts` ne sont pas exposés, aucun
versement programmable n'existe. Un vrai séquestre supposerait que Locawave
détienne l'argent d'un tiers — activité réglementée (agrément BCEAO).

Ce que la plateforme garantit, c'est **l'ordre des opérations** : le prestataire
dépose ses preuves → le propriétaire les examine → il valide → **c'est seulement
alors que le paiement devient dû**. Le propriétaire règle le prestataire
directement, puis l'enregistre dans l'application.

| Interdit | Autorisé |
|---|---|
| « L'argent reste bloqué chez Wave » | « Vous ne payez qu'après avoir validé » |
| « Les fonds sont gelés / sous séquestre » | « La preuve d'abord, le règlement ensuite » |
| « Le paiement se débloque » | « Le paiement devient dû » |
| « Locawave sécurise vos fonds » | « Locawave ne détient jamais vos fonds » |

### Deux promesses encore non tenues par le produit

**WhatsApp — ne pas diffuser en l'état.** Les identifiants Twilio ne sont pas
configurés : aucun message ne part. Les créations qui promettent des relances
« sur WhatsApp » sont fausses tant que la passerelle n'est pas branchée ET
testée sur de vrais locataires. En attendant, la formulation exacte est
« relances automatiques dans l'application ».

**Datation des photos.** `milestone_updates.taken_at` vaut `DEFAULT now()` :
c'est la date de **dépôt**, pas de prise de vue. Aucune lecture EXIF. Un
prestataire peut re-téléverser une vieille photo, elle sera datée d'aujourd'hui.
Dire « photo datée et rattachée à une phase » (vrai), jamais « horodatée à la
prise de vue » (faux).

### Règle permanente

Aucune interface générée par IA dans une création : on part d'une capture réelle
du produit. Fabriquer un écran qui montre une fonctionnalité inexistante est une
pratique commerciale trompeuse, et Meta la traite comme du contenu manipulé.

---

## Sommaire

1. [Ce que dit la recherche](#1--ce-que-dit-la-recherche)
2. [Stratégie de campagne](#2--stratégie-de-campagne)
3. [Les créations, canal par canal](#3--les-créations-canal-par-canal)
4. [Plan média et calendrier de lancement](#4--plan-média-et-calendrier-de-lancement)
5. [La critique adversariale](#5--la-critique-adversariale)
6. [Comment utiliser les prompts](#6--comment-utiliser-les-prompts)

---

## 1 — Ce que dit la recherche

### Diaspora sénégalaise et peur de se faire flouer au pays — recherche d'audience pour le suivi de chantier Locawave

| Constat | Source | Fiabilité |
|---|---|---|
| La diaspora sénégalaise est estimée à environ 700 000 personnes (2020), soit ~4 % de la population du Sénégal. ATTENTION : ce chiffre est très contesté. Une source académique (REMI) avance ~4 millions de Sénégalais à l'étranger, et le gouvernement parle régulièrement de 3 à 4 millions. L'écart vient de la définition (nés au Sénégal vs descendants, réguliers vs irréguliers). NE PAS mettre un chiffre unique dans un business plan sans préciser la définition retenue. | au-senegal.com (2020) vs Revue Européenne des Migrations Internationales, journals.openedition.org/remi/4201 — CHIFFRES CONTRADICTOIRES | ⚠️ estimation |
| Répartition dans les 4 pays cibles : France ~310 000 ; Italie ~100 000 (2022, contre 29 000 en 2001) ; Espagne ~57 000 (2020, contre 11 000 en 2001) ; États-Unis ~32 000 (2020, contre 11 000 en 2000). Répartition continentale : Europe 49,7 %, Afrique 47 %, Amérique du Nord 3 %. Les 4 marchés visés représentent donc grossièrement 500 000 personnes — un marché adressable réel mais modeste, à ne pas gonfler. | au-senegal.com, « Sénégalais de la diaspora : qui sont-ils et où sont-ils ? » | ✅ sourcé |
| Concentration urbaine utile pour le ciblage publicitaire : Italie — Gênes, Milan, Turin, Rome, Bergame (~110 000 selon cette source) ; Espagne — Barcelone, Madrid, Séville, plus les zones agricoles de Murcie et Catalogne (65 000 à 80 000). Ces villes sont des zones de ciblage géographique Facebook/TikTok directement exploitables. | whakup.com (blog commercial, AUCUNE source citée pour ces chiffres — à traiter comme indicatif de ciblage, pas comme donnée de marché) | ⚠️ estimation |
| Les transferts de la diaspora vers le Sénégal ont atteint 2 211 milliards de FCFA en 2024, un niveau record, dépassant l'aide publique au développement. | allAfrica / presse sénégalaise, décembre 2025 | ✅ sourcé |
| Les transferts représentaient 11,62 % du PIB sénégalais en 2024 (contre 9,47 % en 2023 et 10,89 % en 2022). Moyenne mondiale : 5,13 %. Le Sénégal est donc plus de deux fois au-dessus de la moyenne mondiale. Montant 2023 : 3 267 millions USD. | Banque mondiale, via TradingEconomics et TheGlobalEconomy.com | ✅ sourcé |
| 60 % des transferts proviennent de France, Italie et Espagne — ce qui valide directement le ciblage géographique de la campagne. | au-senegal.com | ✅ sourcé |
| 20 à 25 % des transferts seraient désormais orientés vers l'immobilier, soit « près d'un transfert sur quatre », représentant un marché potentiel de 400 à 500 millions d'euros par an. AVERTISSEMENT SÉRIEUX : ce chiffre ne provient que de blogs commerciaux du secteur immobilier (achetermamaisonenafrique.com, westafdaily.com), qui ont un intérêt direct à le gonfler. Je n'ai trouvé AUCUNE source institutionnelle (BCEAO, ANSD, Banque mondiale) le confirmant. À utiliser uniquement avec la mention explicite « estimation sectorielle non confirmée ». | ESTIMATION NON VERIFIEE (blogs immobiliers 2024-2026, aucune source institutionnelle trouvée) | ⚠️ estimation |
| Signal institutionnel fort et récent : l'État sénégalais a annoncé un Fonds Immobilier de la Diaspora (février 2026) destiné à capter l'épargne des expatriés, et un programme diaspora articulé autour de la protection, du logement et de l'assurance (décembre 2025). Le sujet « diaspora + logement » est politiquement porté — bon contexte de crédibilité pour Locawave. | Agence Ecofin (fév. 2026), allAfrica (déc. 2025) | ✅ sourcé |
| Le foncier est un contentieux massif au Sénégal : les conflits fonciers représentent entre 10 et 30 % des affaires de justice au niveau national. Thiès dépasse 30 %, Ziguinchor dépasse 50 % des procédures du Tribunal de grande instance. Types dominants : occupation illégale, vente de terre appartenant à autrui, violation du code de l'urbanisme. | Agence Ecofin ; Seneweb ; Banque mondiale (« Vers une gouvernance responsable et juste du foncier au Sénégal ») | ✅ sourcé |
| CAS JUDICIAIRE EMBLÉMATIQUE (le plus proche du scénario Locawave) : une femme de la diaspora vivant en France a confié la construction de sa maison R+2 à son beau-frère, envoyant régulièrement de l'argent depuis la France. L'expertise judiciaire a établi que seulement 36,3 millions FCFA avaient réellement été investis dans les travaux, le bâtiment restant inachevé et non conforme. C'est exactement le récit central de la campagne — et il est documenté, pas inventé. (Affaire à Bobo-Dioulasso, Burkina Faso, 2023 — pays voisin, dynamique identique.) | Quotidien Sidwaya, 2023 | ✅ sourcé |
| Escroquerie de masse ciblant la diaspora africaine dont des Sénégalais : une femme de 41 ans du Val-d'Oise a proposé des investissements immobiliers en Afrique de l'Ouest présentés comme « communautaires et solidaires », en insistant sur « l'entraide, la transparence, la confiance et la sécurité ». 97 victimes, préjudice évalué à 1,268 million d'euros. Enseignement clé : les arnaqueurs utilisent DÉJÀ le vocabulaire de la confiance et de la transparence — Locawave ne peut donc pas se contenter de le promettre, il doit le PROUVER visuellement. | Senego (2025) ; Orishas-finance | ✅ sourcé |
| Un promoteur immobilier a été condamné à 6 mois ferme et 11 millions FCFA de dommages-intérêts pour escroquerie foncière (terrain vendu en 2023). Les fraudes récurrentes documentées : terrains vendus plusieurs fois, absence de documents légaux, promesses non tenues d'intermédiaires douteux. | allAfrica, décembre 2025 ; Seneweb (dossier foncier) | ✅ sourcé |
| MÉCANISME DE DÉFIANCE DÉJÀ INVENTÉ PAR LES MIGRANTS (insight stratégique majeur) : des recherches académiques documentent que des familles de migrants envoient l'argent DIRECTEMENT aux commerçants locaux plutôt qu'aux membres de la famille, pour garantir que les fonds servent bien à l'achat prévu. C'est un mécanisme de pré-engagement artisanal — autrement dit, la validation avant paiement de Locawave ne crée pas un besoin, elle formalise un réflexe que la diaspora a déjà inventé seule. | Revue Européenne des Migrations Internationales, journals.openedition.org/remi/4201 | ✅ sourcé |
| Le tabou familial est documenté académiquement : un migrant (« Diatourou ») ayant versé près de 1 000 euros pour un projet d'épicerie avec son cousin a découvert que l'argent avait servi à éponger une dette familiale. Il « n'a pas cherché à rentrer dans ses fonds » par respect de la hiérarchie familiale. C'est la clé émotionnelle : la victime ne porte pas plainte, ne réclame rien, et se tait. La douleur est doublée par le silence. | Revue Européenne des Migrations Internationales, journals.openedition.org/remi/4201 | ✅ sourcé |
| MOTS EXACTS — le ressentiment diaspora / pays (verbatims authentiques de Sénégalais, pas du marketing) : « l'argent que nous envoyons a été durement gagné » ; ceux restés au pays « aiment faire la fête et gaspiller l'argent dans des cérémonies » ; « On devient des méchants et des ingrats, des mbougoul mbook » ; « on culpabilise, sans jamais avoir le minimum pour vivre décemment » ; « on ne ramasse pas les euros ou les dollars sous les arbres » ; « notre fierté mal placée à faire croire que tout va bien, alors que l'on galère en Europe » ; « Expliquer que la vie au Nord est une galère est difficile à croire ». Le terme wolof « mbougoul mbook » (ingrat, celui qui renie les siens) est l'accusation redoutée — c'est POUR ÉVITER CE MOT que les gens n'osent pas demander de comptes. | au-senegal.com, « Sénégalais de la diaspora : les difficiles rapports avec ceux qui restent au pays » (article + commentaires signés Lala, Bassene) | ✅ sourcé |
| MOTS EXACTS — forum de construction (verbatims de particuliers) : « Construire au Sénégal va vous user. Vous dépenserez deux fois plus » (Narriman Ngaparou) ; « ne vous embarquez surtout pas dans la construction » (Alphi) ; « nous avons nous-mêmes perdu beaucoup d'argent et de nerf » (Arlette Sevestre). Noter le mot « user » et « perdu... de nerf » : la douleur exprimée est autant l'ÉPUISEMENT NERVEUX que la perte financière. | Forum Sénégal, Expat.com, fil « Nous avons le projet de construire notre maison » | ✅ sourcé |
| MOTS EXACTS — vocabulaire du détournement de chantier : l'argent « disparaît entre l'entrepreneur et l'homme de confiance ». L'expression « homme de confiance » est LE terme consacré au Sénégal pour désigner le mandataire local — et c'est précisément ce personnage qui est le point de défaillance. Autre verbatim : les entrepreneurs multiplient les coûts par 2 à 3 en se disant « ils sont de la diaspora, donc ils doivent avoir de l'argent ». Un chantier sans suivi dépasserait son budget de 15 à 25 % en moyenne (chiffre de blog sectoriel, non vérifié). | maisonsenegal.com (page inaccessible en direct, HTTP 403 ; extraits via résultats de recherche) — pour le « 15 à 25 % » : ESTIMATION NON VERIFIEE | ⚠️ estimation |
| CONCURRENCE DIRECTE IDENTIFIÉE : SEETLU (seetlu.com) se positionne exactement sur « Suivi de chantier au Sénégal pour la diaspora : surveillez votre construction à distance », avec une page SEO « Arnaque construction au Sénégal, les 7 signes ». Autres acteurs sur le créneau « construire au Sénégal depuis l'étranger » : hubcephas.com, ecolux-btp.com, sylocons.com, ecogennexus.com. Le créneau n'est PAS vierge — mais aucun de ces acteurs ne combine suivi photo/vidéo + validation obligatoire avant paiement + gestion locative. C'est là que Locawave se différencie. | seetlu.com et sites concurrents, consultés juillet 2026 | ✅ sourcé |
| MOTS EXACTS — les 7 signes d'arnaque formulés par un concurrent (SEETLU). ATTENTION : c'est de la COPY MARKETING, pas de la parole spontanée d'utilisateur. Mais elle est excellente et révèle les mécanismes précis : « On vous envoie des images, mais toujours sous le même angle, à la même heure » ; « Chaque appel se termine par une demande d'argent sans facture ni justificatif » ; « Un appel vidéo de dix minutes est la vérification la plus simple qui existe » ; « Sans papier, impossible de savoir où va l'argent » ; « Personne ne peut vous dire précisément quel pourcentage est réalisé » ; « Il faut désormais 30 secondes pour ajouter un étage à une maison sur une photo » ; « L'urgence permanente est une technique classique : elle vous empêche de réfléchir » ; « Chaque année, une partie de cet argent disparaît » ; le sujet reste « tabou, parce qu'il touche souvent la famille ». | seetlu.com/arnaque-construction-senegal (copy concurrent, à ne pas copier mot pour mot) | ✅ sourcé |
| MÉDIAS ET CANAUX : WhatsApp est décrit comme d'usage « quasi universel » dans la diaspora sénégalaise d'Italie et d'Espagne, « leur principal outil de communication, avant l'email » (source commerciale, non chiffrée). La recherche académique confirme la centralité du téléphone et de réseaux de relais SMS (groupes d'une cinquantaine de personnes) pour diffuser l'information. Médias communautaires historiques : Lamp Fall FM (radio, 2002), Touba TV (2010), Lamp Fall TV (2011) — médias confessionnels mourides visant explicitement la diaspora. Le chiffre « 450 000 Sénégalais sur Facebook » circule mais provient d'une thèse ancienne (2010) : totalement obsolète, NE PAS L'UTILISER. | whakup.com (non sourcé) ; thèse Bordeaux 2010 (obsolète) ; ResearchGate sur les médias confessionnels — AUCUNE DONNÉE D'AUDIENCE ACTUELLE FIABLE TROUVÉE | ❌ non vérifiable |
| LACUNE HONNÊTE À SIGNALER : je n'ai trouvé AUCUNE donnée fiable et récente sur (a) les taux de pénétration TikTok/Facebook spécifiques à la diaspora sénégalaise par pays, (b) les coûts média (CPM/CPC) pour cibler cette audience, (c) le nombre de membres des groupes Facebook diaspora. Ces chiffres devront être obtenus directement dans le Gestionnaire de publicités Meta (estimation d'audience gratuite avant lancement) et TikTok Ads Manager. Ne pas mettre de chiffre média dans le business plan tant qu'ils ne sont pas relevés dans les plateformes. | ESTIMATION NON VERIFIEE — aucune donnée trouvée | ❌ non vérifiable |

**Ce que ça change pour la création :**

- ANGLE MAÎTRE — vendre la PREUVE, pas la confiance. L'escroquerie du Val-d'Oise (97 victimes, 1,268 M€) était vendue avec les mots « entraide, transparence, confiance et sécurité ». Ces mots sont brûlés : ils sont désormais le vocabulaire des arnaqueurs. Locawave ne doit JAMAIS ouvrir une publicité par « faites-nous confiance ». Il doit ouvrir par une preuve visible à l'écran : une photos datées et rattachées à une phase, un pourcentage d'avancement, un bouton de validation. Slogan de travail : « Ne faites plus confiance. Vérifiez. »
- ANGLE ÉMOTIONNEL N°1 — le tabou familial, jamais l'accusation. La recherche académique le prouve : la victime ne réclame rien, par respect de la hiérarchie familiale. Une publicité qui dit « votre famille vous vole » sera rejetée avec violence et fera fuir l'audience. La bonne formulation retourne la charge : « Ce n'est pas de la méfiance. C'est de la clarté. » ou « Demander des photos, ce n'est pas accuser quelqu'un. » Locawave se positionne comme l'outil qui permet de contrôler SANS avoir à accuser — c'est-à-dire qui évite au propriétaire d'être traité de « mbougoul mbook ».
- CRÉATIF SIGNATURE — le diptyque « même angle, même heure ». Le verbatim concurrent le plus exploitable est : on vous envoie toujours la même photo sous le même angle. Image NanoBanana Pro : écran de téléphone en gros plan, fil WhatsApp montrant trois photos quasi identiques d'un mur de parpaings inachevé, datées de trois mois différents, avec les légendes « Mars », « Mai », « Juillet ». Lumière identique sur les trois. Mouvement image→vidéo : lent zoom avant sur les dates pendant que les trois photos se superposent et se révèlent identiques. Puis coupure sur l'interface Locawave, orange #f97316, avec un vrai fil de progression phase par phase.
- CRÉATIF SIGNATURE — la main qui ne clique pas. Traduire la validation avant paiement en un geste unique et compréhensible. Image : gros plan sur un pouce suspendu au-dessus d'un bouton orange « Valider la phase », l'écran affichant en dessous la photo d'une toiture non terminée. Le pouce ne descend pas. Texte : « La toiture n'est pas finie. Vous ne payez pas la toiture. » Mouvement image→vidéo : le pouce recule, l'écran passe de la toiture inachevée à la toiture terminée, PUIS le pouce descend et le bouton s'illumine en vert. C'est la démonstration la plus courte possible du différenciateur, sans un mot de jargon.
- CRÉATIF — la scène de l'hiver européen. Le verbatim « on ne ramasse pas les euros ou les dollars sous les arbres » et « on galère en Europe » donne le décor. Image : un homme sénégalais de 45 ans en tenue de travail (gilet haute visibilité, chantier ou entrepôt), pause de nuit, appuyé contre un mur, téléphone à la main, buée devant la bouche, néons froids d'un parking de Milan ou de Bergame. Sur son écran, chaud et orange : sa maison à Diamniadio en photos. Le contraste froid/chaud EST le message. Mouvement : la caméra se rapproche lentement de l'écran jusqu'à ce que la lumière orange envahisse le cadre. Aucun texte pendant 3 secondes.
- CRÉATIF — « durement gagné ». Reprendre le verbatim exact « l'argent que nous envoyons a été durement gagné ». Image : mains fatiguées et abîmées d'un ouvrier, en très gros plan, tenant un téléphone affichant le tableau de bord Locawave avec un montant en FCFA écrit correctement (« 2 500 000 FCFA », espaces, jamais de virgule). Éclairage latéral dur pour marquer la peau et les callosités. Mouvement : léger tremblement de la main, puis stabilisation ; le montant à l'écran s'anime de « En attente » à « Validé ». Accroche : « Cet argent, vous savez ce qu'il vous a coûté. Maintenant, vous savez où il va. »
- CRÉATIF — la photo truquée. Le verbatim « Il faut désormais 30 secondes pour ajouter un étage à une maison sur une photo » est une peur nouvelle et sous-exploitée, très forte à l'ère de l'IA. Image : une photo de maison R+1 en cours de retouche sur un écran, avec un étage supplémentaire visiblement collé, bords flous, ombres incohérentes. Loupe ou zone surlignée en orange sur le raccord raté. Mouvement : la fausse étage se dissout et disparaît, révélant la maison réelle plus basse. Texte : « Une photo, ça se fabrique. Une phase validée, non. » Attention : ne pas surpromettre — ne revendiquer que ce que Locawave fait réellement (datation du dépôt, validation par phase, alerte si aucune photo depuis 7 jours).
- CRÉATIF — l'alerte « aucune photo depuis 7 jours ». C'est une fonctionnalité RÉELLEMENT livrée et c'est la meilleure preuve produit, car elle répond directement au verbatim « avancement flou ». Image : notification push sur écran verrouillé de smartphone, fond bleu marine #1a2744, texte orange : « Aucune photo de votre chantier depuis 7 jours. » Heure affichée : 06:12. Mouvement : la notification glisse depuis le haut, vibration légère. C'est un format ultra-court (3-4 s) parfait pour un hook TikTok/Reels — la notification arrive avant même que le spectateur ait compris de quoi il s'agit.
- CRÉATIF — le budget qui dérape. Répondre au verbatim « Chaque appel se termine par une demande d'argent sans facture ni justificatif » et à « Construire au Sénégal va vous user. Vous dépenserez deux fois plus ». Image : deux barres de budget côte à côte, l'une explosant hors du cadre en rouge, l'autre contenue en orange avec la mention « Alerte budget dépassé » (fonctionnalité réellement livrée). Mouvement : la barre rouge gonfle vite et déborde, la barre orange s'arrête net avec un petit choc visuel. Accroche reprenant le forum : « Deux fois plus cher. C'est ce que tout le monde raconte. Pas une fatalité. »
- TON À BANNIR ABSOLUMENT : ne jamais montrer un membre de la famille au Sénégal comme un voleur, un fainéant ou un profiteur. Le verbatim « ils aiment faire la fête et gaspiller l'argent dans des cérémonies » existe et il est authentique — mais le dire dans une publicité serait un suicide de marque au Sénégal et diviserait l'audience diaspora elle-même. Le vrai antagoniste des créatifs doit être l'OPACITÉ, l'absence d'information, le flou — jamais une personne. Montrer des chantiers, des écrans, des dates, du vide informationnel. Jamais un visage coupable.
- FORMAT NATIF DIASPORA — le témoignage face caméra en français teinté de wolof. L'audience reconnaît immédiatement le français « de la maison » (mots wolof insérés, accent sénégalais de France ou d'Italie). Prompt image : portrait cadré serré, personne assise dans un salon modeste européen (radiateur, fenêtre grise), regard direct caméra, éclairage naturel de fenêtre, aucun décor publicitaire. Mouvement : quasi statique, seul le visage bouge — le naturel vend plus que la production. Le mot « mbougoul mbook » peut être utilisé DANS un témoignage à la première personne (« j'avais peur qu'on me traite de mbougoul mbook ») mais jamais dans une accroche de marque.
- SÉQUENCE 3 SECONDES POUR TIKTOK — les hooks à tester en priorité, tous issus de verbatims réels : (1) « Trois mois. La même photo. » (2) « Il m'a envoyé une photo. J'ai payé. » (3) « Vous ne payez pas la toiture avant de voir la toiture. » (4) « Ce n'est pas de la méfiance. » (5) « 36 millions envoyés. 36 millions manquants. » — ce dernier s'appuie sur un cas judiciaire réel (Sidwaya 2023) mais NE PAS l'attribuer au Sénégal ni prétendre que c'est un client Locawave : reformuler en générique ou citer la source à l'écran.
- CIBLAGE OPÉRATIONNEL : concentrer le budget sur les villes documentées — Gênes, Milan, Turin, Rome, Bergame (Italie) ; Barcelone, Madrid, Séville, Murcie (Espagne) ; Île-de-France et Rhône-Alpes (France) ; New York et Ohio/Cincinnati (États-Unis, communauté sénégalaise connue). 60 % des transferts venant de France + Italie + Espagne, les USA sont un marché test à petit budget, pas une priorité de phase 1. Créer les créatifs en 9:16 natif pour Reels/TikTok et en 4:5 pour le feed Facebook.
- WHATSAPP EST LE CANAL DE CONVERSION, PAS FACEBOOK. WhatsApp est décrit comme d'usage quasi universel dans cette diaspora, avant l'email. Toutes les publicités doivent donc pointer vers un « Click-to-WhatsApp » plutôt que vers un formulaire web. Corollaire créatif : montrer WhatsApp DANS les visuels (le fil de discussion avec le maçon) crée une reconnaissance immédiate — le spectateur voit sa propre vie à l'écran. C'est aussi cohérent avec la fonctionnalité rappels WhatsApp déjà livrée.
- PREUVE DE PRIX À METTRE EN AVANT TÔT : l'argument « le prix ne dépend pas du montant du loyer » est un différenciateur rationnel puissant contre les agences qui prennent un pourcentage. Créatif dédié : deux tickets côte à côte, « Agence : 10 % de 350 000 FCFA chaque mois » vs « Locawave : 10 000 FCFA par mois, quel que soit votre loyer ». Toujours écrire les montants avec des espaces. Mouvement : le montant de l'agence grimpe en boucle, celui de Locawave reste figé. Ce créatif cible le propriétaire bailleur, pas le constructeur — le garder pour une campagne séparée, ne pas mélanger les deux récits dans une même publicité.
- AVERTISSEMENT CONCURRENTIEL : SEETLU occupe déjà le terrain sémantique « suivi de chantier au Sénégal pour la diaspora » et référence une page « les 7 signes d'arnaque ». Ne pas reprendre leurs formulations mot pour mot dans les créatifs — d'abord pour des raisons évidentes, ensuite parce que la différenciation de Locawave n'est pas le suivi photo (qu'ils font) mais la VALIDATION OBLIGATOIRE AVANT PAIEMENT, phase par phase, plus la continuité TROUVER→LOUER→GÉRER. Le message doit être : les autres vous montrent le chantier ; Locawave conditionne le paiement à ce que vous avez vu.
- MENTION LÉGALE À NE JAMAIS OUBLIER DANS LES CRÉATIFS FINANCIERS : Locawave ne détient jamais les fonds. Toute publicité qui montre un blocage de paiement doit rendre visible que l'exigibilité du paiement est pilotée par la validation, pas par le prestataire de paiement (Wave / Orange Money). Une accroche du type « nous gardons votre argent » serait à la fois fausse et juridiquement risquée. Formulation sûre : « Vous ne réglez le prestataire qu'après avoir validé la phase. »

---

### Locawave — Recherche d'audience : le propriétaire bailleur sénégalais et la diaspora (réseaux, langue, horaires, visuels)

| Constat | Source | Fiabilité |
|---|---|---|
| Le Sénégal compte 19,0 millions d'habitants (octobre 2025), 50,7 % urbains, âge médian 19,6 ans. Une audience très jeune en moyenne — le propriétaire bailleur est donc une NICHE d'âge (35-60 ans) dans un pays de jeunes. | DataReportal / We Are Social — Digital 2026: Senegal (publié fin 2025/2026) | ✅ sourcé |
| 11,5 millions d'internautes au Sénégal, soit 60,6 % de pénétration. 7,50 millions de personnes restent hors ligne (39,4 %). | DataReportal — Digital 2026: Senegal | ✅ sourcé |
| 23,3 millions de connexions mobiles actives = 122 % de la population ; 91,3 % sont compatibles haut débit (3G/4G/5G). Le mobile est le seul écran qui compte. | DataReportal — Digital 2026: Senegal | ✅ sourcé |
| 5,42 millions d'identités réseaux sociaux (28,5 % de la population), +8,2 % en un an. Seuls 47 % des internautes sénégalais sont sur un réseau social : l'audience social media est donc bien plus étroite que l'audience internet. | DataReportal — Digital 2026: Senegal | ✅ sourcé |
| Facebook : 3,60 millions d'utilisateurs touchables par la pub au Sénégal (18,9 % de la population), +250 000 en un an (+7,5 %). C'est de loin le plus gros réseau ciblable du pays. | DataReportal — Digital 2026: Senegal (données ad reach Meta) | ✅ sourcé |
| L'audience publicitaire Facebook au Sénégal est massivement masculine : 66,7 % d'hommes contre 33,3 % de femmes (33,3/66,7 en 2026 ; 34,3/65,7 en 2025). Le profil « propriétaire bailleur homme 35-55 » colle parfaitement à la démographie naturelle de Facebook Sénégal. | DataReportal — Digital 2026: Senegal et Digital 2025: Senegal | ✅ sourcé |
| Instagram : 1,45 million (7,6 % de la population), 62,8 % d'hommes. LinkedIn : 1,50 million de membres (7,9 %), en croissance rapide (+15,4 %/an) — c'est le réseau qui grossit le plus vite au Sénégal, pertinent pour les agences immobilières et la diaspora cadre. | DataReportal — Digital 2026: Senegal | ✅ sourcé |
| Messenger n'a que 834 000 utilisateurs (4,4 %) et X/Twitter 263 000 (1,4 %). Ce sont des canaux marginaux au Sénégal — ne pas y investir. | DataReportal — Digital 2026: Senegal | ✅ sourcé |
| YouTube est crédité de 5,42 millions d'utilisateurs (28,5 %), soit le même chiffre que le total réseaux sociaux. Il y a donc une audience vidéo longue aussi large que Facebook, quasi inexploitée en immobilier local. | DataReportal — Digital 2026: Senegal | ✅ sourcé |
| DataReportal ne publie AUCUNE donnée d'audience publicitaire TikTok pour le Sénégal, ni en 2025 ni en 2026. Aucun chiffre fiable de taille d'audience TikTok Sénégal n'a pu être trouvé. Les chiffres qui circulent (1,3 M, 5 M...) proviennent de blogs sans méthodologie et se contredisent. | ESTIMATION NON VERIFIEE — absence de donnée dans DataReportal Digital 2025/2026 Senegal ; chiffres blogs contradictoires | ❌ non vérifiable |
| TikTok a été suspendu au Sénégal à partir du 2 août 2023 (motif officiel : messages « haineux et subversifs » dans le contexte des manifestations pro-Sonko), puis rétabli discrètement. La date exacte de rétablissement n'est pas documentée de façon fiable. | SeneNews, We Are Tech Africa, PressAfrik (2023-2024) — date de rétablissement : ESTIMATION NON VERIFIEE | ✅ sourcé |
| Taux d'alphabétisation (6 ans et +) : 59,5 % en 2023 (contre 42,4 % en 2013). Mais l'alphabétisation EN FRANÇAIS ne concerne que 37,5 % de la population (46,3 % en milieu urbain, 25,9 % en rural). Wolof écrit : 14,9 %. Arabe : 11,9 %. | ANSD — RGPH-5 2023, chapitre Éducation/Alphabétisation | ✅ sourcé |
| Conséquence directe : environ 6 Sénégalais sur 10 ne lisent PAS le français couramment. Une créa publicitaire textuelle en français exclut mécaniquement une majorité du marché intérieur — mais reste adaptée à la cible propriétaire urbaine et diaspora, plus scolarisée. | Déduction à partir d'ANSD RGPH-5 2023 (37,5 % alphabétisés en français) | ⚠️ estimation |
| Les transferts de la diaspora sénégalaise ont atteint 2 211 milliards FCFA en 2024, contre ~1 600 milliards en 2023, soit près de 12 % du PIB. Source : BCEAO. | BCEAO, reprise par Le Soleil / Xinhua / AllAfrica (décembre 2025) | ✅ sourcé |
| Le chiffre de « plus de 2 800 milliards FCFA en 2025 / 10 % du PIB » circule dans la presse mais n'a pas pu être rattaché à une publication BCEAO ou Banque mondiale identifiable. | ESTIMATION NON VERIFIEE | ⚠️ estimation |
| La diaspora sénégalaise est estimée à environ 700 000 personnes (2020, ~4 % de la population). Répartition : Europe 49,7 %, Afrique 47 %, Amérique du Nord 3 %. Italie ~110 000, Espagne ~57 000 (contre 11 000 en 2001), USA ~32 000 (contre 11 000 en 2000). | Profil migratoire national du Sénégal (ANSD/OIM) et Diaspora for Development — données 2018-2020 | ✅ sourcé |
| En 2019, 60 % des transferts reçus par le Sénégal venaient de France, d'Italie ou d'Espagne. Ces trois pays sont donc le cœur du ciblage géographique diaspora, avant les USA. | Données citées dans les profils migratoires ANSD/OIM (2019) | ✅ sourcé |
| Le détournement de l'argent envoyé au pays par un proche (frère, cousin, beau-frère) chargé de superviser un terrain ou un chantier est un phénomène largement documenté par la presse sénégalaise : faux terrains, argent réaffecté à des dépenses familiales, factures gonflées x2 à x3 par des entrepreneurs qui « voient » un client diaspora. | SenCaféActu (2021), Seneweb (affaire Mbaye Diagne, faux terrain, 100 millions FCFA) — preuve QUALITATIVE, aucune mesure quantitative disponible | ✅ sourcé |
| Aucune statistique chiffrée sur la fréquence ou le montant total des détournements de fonds diaspora sur les chantiers au Sénégal n'existe publiquement. Le sujet est tabou et non mesuré. | ESTIMATION NON VERIFIEE — aucune source quantitative trouvée | ❌ non vérifiable |
| Wave est le leader du mobile money au Sénégal, avec une part de marché estimée entre 50 % et 70 % ; Orange Money environ 25-30 %. Wave est passé de 21,4 % à 28,4 % du volume de transactions dans l'UEMOA entre 2023 et 2024. | Hub2, The Africa Report, OrchestraPay (2025) — sources secondaires, pas de publication officielle Wave/BCEAO consultée | ⚠️ estimation |
| Wave dispose d'une licence d'émetteur de monnaie électronique de la BCEAO depuis avril 2022. En septembre 2025, la BCEAO a lancé PI-SPI, plateforme de paiement instantané interconnectant wallets et banques dans l'UEMOA. | BCEAO ; TriplePundit / Africa Report (2025) | ✅ sourcé |
| Au Sénégal, une part plus élevée de femmes détient un compte mobile money (38 %) qu'un compte bancaire (24 %). Le Sénégal fait partie des pays ayant gagné 20 points ou plus de taux de détention de compte en trois ans. | Banque mondiale — Global Findex (données 2024, rapport 2025) | ✅ sourcé |
| Loyers à Dakar : les fourchettes les plus fréquemment citées sont 150 000 à 350 000 FCFA/mois pour un 2-3 pièces en quartier intermédiaire (Liberté 6, Grand Yoff, Sacré-Cœur), 300 000 à 600 000 FCFA aux Mamelles, au-delà de 1 300 000 FCFA en résidence sécurisée aux Almadies. Prix au m² locatif : ~1 400 FCFA aux Parcelles Assainies à ~8 200 FCFA aux Almadies. | Sites d'annonces et blogs immobiliers (au-senegal.com, GoTerra, Cyril Jarnias, 2025-2026) — AUCUNE source officielle ANSD/ministère ; à traiter comme ordre de grandeur | ⚠️ estimation |
| Le chiffre « loyer moyen d'un appartement à Dakar ≈ 1 974 972 FCFA/mois » trouvé sur un agrégateur est manifestement non représentatif (biais vers le haut de gamme meublé/expatrié). NE PAS l'utiliser. | ESTIMATION NON VERIFIEE — agrégateur GoTerra, méthodologie inconnue | ❌ non vérifiable |
| Cadre légal du bail au Sénégal : la caution de garantie ne peut excéder 2 mois de loyer (1 mois à l'entrée, le 2e étalable sur 12 mois) ; le loyer est payable à terme échu (fin du mois de jouissance) et non d'avance ; sans état des lieux d'entrée contradictoire, le logement est présumé remis en bon état et le bailleur ne peut rien retenir sur la caution. | Cabinet Houda (avocatshouda.com), Keur City, Logestimmo — analyse du Code des obligations civiles et commerciales et décrets d'application | ✅ sourcé |
| Le contrat verbal reste courant au Sénégal et est identifié par les praticiens du droit comme la principale source de litige entre bailleur et locataire. | Cabinet Houda — guide sur les baux au Sénégal | ✅ sourcé |
| Les deux plateformes d'annonces dominantes au Sénégal sont Expat-Dakar (historique, généraliste) et CoinAfrique (le « Bon Coin » d'Afrique de l'Ouest, très mobile). Aucune n'est spécialisée immobilier : la visibilité des annonces y est diluée. Aucune donnée de trafic vérifiable n'a été trouvée. | Immo Star Dakar (classement 2025) — qualitatif ; audience chiffrée : ESTIMATION NON VERIFIEE | ⚠️ estimation |
| Le contenu en langue locale (wolof) générerait 3 à 5 fois plus d'engagement au Sénégal, et la pratique recommandée est de créer des campagnes SÉPARÉES français / wolof plutôt qu'un message unique. Les micro-influenceurs de quartier et TikTokeurs locaux surperforment les célébrités. | Wolofcast, Gaynako (agences digitales sénégalaises, 2025-2026) — chiffre « x3 à x5 » NON VÉRIFIÉ, aucune étude méthodologique publiée | ⚠️ estimation |
| Le CPM Facebook en Afrique francophone (Sénégal, Côte d'Ivoire) serait de l'ordre de 200 à 600 FCFA, contre 3 000 à 8 000 FCFA en France. Budgets de test cités : 30 000-75 000 FCFA/mois pour apprendre, 100 000-300 000 FCFA/mois pour stabiliser l'algorithme. | ESTIMATION NON VERIFIEE — blogs marketing (Flashpub, Prince Djetta, Novakou), aucune donnée Meta officielle | ⚠️ estimation |
| Attention : cibler la diaspora sénégalaise en France/Italie/Espagne coûte le CPM du pays de diffusion (marché européen), pas celui du Sénégal. Les deux campagnes ne se pilotent pas avec les mêmes budgets ni les mêmes benchmarks. | Déduction du fonctionnement des enchères Meta (facturation par géographie de diffusion) | ⚠️ estimation |
| Les créneaux de publication recommandés pour le fuseau UTC ouest-africain (Dakar = UTC+0, même heure qu'Abidjan/Ouagadougou/Conakry) sont 12h-15h (pause déjeuner) et 19h-21h (après le dîner). Ces recommandations sont génériques et ne proviennent d'aucune étude sénégalaise. | ESTIMATION NON VERIFIEE — outils génériques (Radaar, Agorapulse), pas de données Sénégal | ⚠️ estimation |
| Décalage horaire à exploiter : Dakar est à UTC+0. En été, Paris/Rome/Madrid sont à UTC+2, New York à UTC-4. Une diffusion à 20h heure de Dakar tombe à 22h à Paris (fin de soirée, scroll au lit) et 16h à New York. | Fuseaux horaires standards (fait vérifiable) | ✅ sourcé |
| Aucune donnée fiable n'a été trouvée sur : le nombre de propriétaires bailleurs au Sénégal, le taux de recours aux agences vs gestion en direct, le nombre de logements locatifs à Dakar, ou le taux d'équipement smartphone (par opposition aux lignes mobiles). Ces chiffres seraient à produire par étude terrain propre. | ESTIMATION NON VERIFIEE — recherches infructueuses | ❌ non vérifiable |

**Ce que ça change pour la création :**

- ARBITRAGE RÉSEAU N°1 — Facebook est le média principal, TikTok le média secondaire. 3,60 M d'utilisateurs Facebook ciblables au Sénégal, dont 66,7 % d'hommes : c'est démographiquement le média du propriétaire bailleur. TikTok n'a AUCUNE donnée d'audience publiée pour le Sénégal et a été suspendu par l'État en 2023 : y bâtir l'acquisition principale est un risque politique et un pari à l'aveugle. Recommandation : 60 % du budget Facebook (feed + Reels), 25 % TikTok organique en test, 15 % Instagram/YouTube.
- ARBITRAGE RÉSEAU N°2 — Ouvrir un axe LinkedIn pour les agences immobilières et la diaspora cadre. 1,50 M de membres, +15,4 %/an, la plus forte croissance du pays. C'est le seul endroit où l'offre Agence 45 000 FCFA/mois se vend sans avoir à expliquer ce qu'est un SaaS.
- DEUX CAMPAGNES, DEUX PAYS, DEUX BUDGETS — Ne jamais mélanger la campagne Sénégal et la campagne diaspora dans un même ensemble publicitaire. Le CPM du Sénégal et celui de la France/Italie/Espagne sont des marchés d'enchères totalement différents. Cibles diaspora prioritaires par ordre de poids : France, Italie (~110 000 personnes), Espagne (~57 000), puis USA (~32 000) — 60 % des transferts viennent des trois premiers.
- LANGUE — Français écrit à l'image, wolof à la voix. Seuls 37,5 % des Sénégalais sont alphabétisés en français : un visuel chargé de texte français exclut une majorité du marché. Règle de production : le TEXTE incrusté dans l'image reste en français court et gros (5 mots max, chiffres FCFA lisibles) ; la VOIX OFF et les sous-titres de la version Sénégal passent en wolof ; la version diaspora reste 100 % français. Deux montages, pas un.
- ANGLE ÉMOTIONNEL PRINCIPAL POUR LA DIASPORA — « Ne paie la toiture qu'après avoir vu la toiture. » Le détournement de l'argent envoyé au pays par un proche est documenté par la presse sénégalaise (faux terrains, factures gonflées x2 à x3 face à un client diaspora) mais jamais quantifié : c'est une douleur réelle et TABOUE. Ne jamais accuser la famille frontalement dans la créa — montrer la preuve, pas le soupçon. Le héros du film n'est pas un escroc : c'est une photo de chantier qui arrive sur un téléphone à Paris.
- VISUEL SIGNATURE À PRODUIRE EN PRIORITÉ (NanoBanana Pro) — Le split-screen à double fuseau : à gauche un homme sénégalais de 45 ans en manteau, le soir, dans un appartement européen, téléphone en main ; à droite, ce qu'il regarde — un chantier à Diamniadio en plein soleil, dalle et ferraillage, ouvriers au travail. Mouvement image→vidéo : la moitié gauche quasi immobile (respiration, léger sourire), la moitié droite en time-lapse lent. La distance est le sujet ; la preuve est le produit.
- VISUEL SIGNATURE N°2 — Le téléphone comme unique décor. Gros plan cadré serré sur un smartphone tenu à la main, écran Locawave visible en français avec des montants en FCFA au format « 350 000 FCFA » (espaces, jamais de virgule). Fond bleu marine #1a2744, accent orange #f97316. Mouvement : le pouce descend et une photo de chantier se charge. Ce plan est le plus rentable à produire car il est réutilisable sur tous les canaux et tous les messages.
- FORMAT — 9:16 vertical par défaut, tout le temps. 122 % de connexions mobiles pour 60,6 % d'internautes : le mobile n'est pas un canal, c'est le seul écran. Prévoir aussi un 1:1 pour Facebook Marketplace où le carré domine encore.
- RÈGLE DES 3 PREMIÈRES SECONDES SANS SON — Une majorité de l'audience ne lit pas le français couramment et scrolle sans son. La première seconde doit être une IMAGE qui raconte : une main qui tend un billet, un mur qui monte, une porte fermée. Pas un logo, pas une phrase.
- HORAIRES — À tester, pas à croire. Aucune donnée d'audience horaire sénégalaise fiable n'existe ; les recommandations 12h-15h / 19h-21h sont génériques. Point de départ opérationnel : Sénégal en soirée 20h-22h heure de Dakar ; diaspora Europe en visant 22h-23h heure locale (fin de soirée). Le décalage joue en votre faveur : une seule fenêtre de diffusion de 20h à 21h UTC touche Dakar en soirée, Paris/Rome/Madrid au coucher et New York en fin d'après-midi. Mesurer sur 3 semaines avant de figer.
- PREUVE PLUTÔT QUE PROMESSE — Le cadre légal sénégalais est un argument de vente gratuit : caution plafonnée à 2 mois, loyer payable à terme échu, et surtout « sans état des lieux d'entrée contradictoire, le bailleur ne peut rien retenir sur la caution ». Le contrat verbal est identifié par les juristes comme la première source de litige. Une créa entière tient là-dedans : « Votre bail est-il écrit ? Sinon, en cas de litige, vous perdez. »
- PAIEMENT — Parler Wave d'abord, Orange Money ensuite. Wave est estimé à 50-70 % du marché mobile money sénégalais contre 25-30 % pour Orange Money. À l'écran, montrer le reçu Wave scanné par l'OCR : c'est le geste le plus reconnaissable du quotidien financier sénégalais, il crée une familiarité immédiate.
- ARGUMENT PRIX À METTRE EN VISUEL, PAS EN TEXTE — « Le prix ne dépend pas de votre loyer. » Montrer deux immeubles côte à côte, l'un modeste l'autre haut de gamme, et le même badge orange « 10 000 FCFA/mois » sur les deux. C'est plus fort qu'un tableau de tarifs et ça se lit sans savoir lire.
- CASTING ET DÉCORS — Refuser l'imagerie africaine générique. Décors à nommer explicitement dans les prompts : Almadies, Sacré-Cœur, Grand Yoff, Diamniadio, Saly, Mbour. Personnages : homme 40-55 ans en chemise ou boubou, femme propriétaire 35-50 ans (segment sous-exploité — les femmes sont majoritaires en mobile money au Sénégal, 38 % contre 24 % en bancaire), chef de chantier casqué. Lumière : soleil dur de Dakar, poussière ocre, ciel blanc — pas la lumière dorée de studio.
- CANAL OUBLIÉ À OUVRIR — YouTube touche 5,42 M de Sénégalais, autant que l'ensemble des réseaux sociaux, et l'immobilier locatif sénégalais y est quasi absent. Une série de vidéos longues « Comment suivre un chantier depuis l'étranger » en wolof y coûterait peu et positionnerait Locawave comme autorité, pas comme annonceur.
- DISTRIBUTION HORS PUB — Les propriétaires cherchent déjà des locataires sur Expat-Dakar et CoinAfrique, deux plateformes généralistes où l'immobilier est dilué. C'est là qu'ils sont, en intention. Une présence organique (annonces, commentaires utiles, groupes Facebook de bailleurs) vaut probablement plus que le budget média sur cette cible étroite.
- BUDGET — Commencer petit et mesurer. Les CPM ouest-africains cités (200-600 FCFA) viennent de blogs, pas de Meta : traitez-les comme une hypothèse à valider avec 50 000 FCFA sur 2 semaines avant d'engager quoi que ce soit. Le vrai chiffre à surveiller n'est pas le CPM mais le coût par essai gratuit activé.
- CE QU'IL FAUT ARRÊTER DE CHERCHER ET COMMENCER À MESURER — Il n'existe aucune donnée publique sur le nombre de propriétaires bailleurs au Sénégal, le taux de gestion par agence vs direct, ou le parc locatif de Dakar. Aucun business plan honnête ne peut chiffrer ce marché aujourd'hui. La seule voie : instrumenter les 200 premiers inscrits (nombre de biens, quartier, résidence au Sénégal ou à l'étranger) et faire de votre propre base la source de vérité.

---

### Benchmark concurrentiel Locawave + coûts média réels (Sénégal / diaspora France) — juillet 2026

| Constat | Source | Fiabilité |
|---|---|---|
| Systimmo se positionne comme 'La gestion locative, enfin automatique' pour l'Afrique (propriétaires et agences, de 2 à 500+ logements) : loyers et quittances automatiques, intégration Wave / Orange Money / virements, relances d'impayés, portail locataire, baux e-signés, assistant IA, tableau de bord temps réel. AUCUN suivi de chantier ni de travaux. AUCUNE mention de la diaspora. AUCUN tarif public. | systimmo.com, page d'accueil consultée le 28/07/2026 | ✅ sourcé |
| LoTech Immobilier (Dakar) existe et cible les agences immobilières : gestion des propriétaires, locataires, loyers, quittances, paiements et copropriété en ligne. Le contenu détaillé du site n'a pas pu être extrait (page vide au fetch) : ses tarifs, sa gestion Wave/OM et l'existence d'un suivi de chantier restent NON VÉRIFIÉS. | lotechimmobilier.com (titre + résumé moteur de recherche), 28/07/2026 | ✅ sourcé |
| Autres acteurs SaaS/proptech identifiés au Sénégal : GestionLocative Sénégal (encaissement en FCFA via Wave et Orange Money, 100 % français), Baye Zaate (plateforme de gestion immobilière avec IA), Alpha.sn (investir à distance dans l'immobilier sénégalais). Aucun ne met en avant le suivi de chantier avec paiement par phase. | ia-lab-immo.com, cyriljarnias.com (dossier proptech Sénégal), consultés 28/07/2026 | ✅ sourcé |
| AUCUN concurrent SaaS de gestion locative sénégalais identifié n'affiche publiquement ses prix. Locawave (Solo 10 000 / Pro 20 000 / Agence 45 000 FCFA) est donc, à ma connaissance, le seul à publier une grille tarifaire — c'est un différenciateur de transparence exploitable en publicité. | ESTIMATION NON VERIFIEE (absence de preuve après consultation de systimmo.com et recherches sur les autres acteurs — une absence de tarif public n'est pas une preuve d'absence de tarif) | ⚠️ estimation |
| ANGLE MORT MAJEUR CONFIRMÉ : le 'suivi de chantier pour la diaspora' au Sénégal est occupé par des AGENCES DE SERVICE HUMAIN, pas par des produits logiciels. Acteurs recensés : SEETLU, Wizodia, HubCephas, ImmoBelite, DiaspoLead Immo. Tous vendent de la prestation (visites, rapports, maîtrise d'ouvrage déléguée), aucun ne vend un abonnement produit. | seetlu.com, hubcephas.com, immobelite.com, diaspoleadimmo.com, MySweetImmo (04/09/2020) pour Wizodia — consultés 28/07/2026 | ✅ sourcé |
| SEETLU (le plus proche concurrent frontal) : techniciens génie civil qui font les visites, rapports photo et vidéo GÉOLOCALISÉS, mention de 'paiements vérifiés', 3 formules affichées mais AUCUN prix public. Aucune mention de blocage de fonds, ni de validation des preuves par le client. Communication très 'famille', multicanal (WhatsApp, Instagram, TikTok, Facebook, LinkedIn). | seetlu.com, consulté 28/07/2026 | ✅ sourcé |
| Wizodia s'adresse à la diaspora de Côte d'Ivoire, Cameroun, Sénégal, Bénin et Togo avec un écosystème de professionnels vérifiés (promoteurs, architectes, notaires, constructeurs) et un suivi de chantier à distance par des équipes sur place. Le modèle est celui d'un intermédiaire de confiance humain, pas d'un logiciel en libre-service. | MySweetImmo, article du 04/09/2020 | ✅ sourcé |
| ANGLE MORT N°1 EXPLOITABLE : aucun acteur identifié ne combine (a) produit logiciel en self-service, (b) preuves photo/vidéo datée par phase, ET (c) exigibilité du paiement conditionnée à la validation des preuves par le propriétaire. Les agences donnent la preuve mais gardent la main sur l'argent ; les SaaS gèrent l'argent du loyer mais ignorent le chantier. | ESTIMATION NON VERIFIEE (synthèse de la revue des sites publics de 8 acteurs — pas d'accès aux produits eux-mêmes) | ⚠️ estimation |
| ANGLE MORT N°2 : Expat-Dakar et CoinAfrique dominent les annonces immobilières au Sénégal mais restent des plateformes de petites annonces GÉNÉRALISTES (voitures, emploi, informatique, services). La relation s'arrête à l'échange d'un numéro de téléphone : aucun outil de gestion post-transaction, aucune traçabilité, aucun recours en cas de litige. | expat-dakar.com, sn.coinafrique.com, classement agence-immobiliere-dakar.com (2025) — consultés 28/07/2026 | ✅ sourcé |
| CoinAfrique est décrit comme la plateforme d'annonces la plus connue d'Afrique francophone, mais 'moins adaptée à un usage professionnel ou à une recherche immobilière approfondie'. Expat-Dakar est l'un des plus anciens sites d'annonces du Sénégal. | agence-immobiliere-dakar.com, classement des sites d'annonces immobilières au Sénégal (2025) | ✅ sourcé |
| Chiffres de trafic / audience comparés d'Expat-Dakar vs CoinAfrique : INTROUVABLES dans des sources publiques fiables. Idem pour les tarifs d'annonce premium / boost / abonnement agence d'Expat-Dakar (packs de crédits mentionnés, montants non publiés). | ESTIMATION NON VERIFIEE — donnée absente, ne pas l'inventer dans le business plan | ❌ non vérifiable |
| TAILLE DU MARCHÉ ÉMOTIONNEL — les transferts d'argent de la diaspora sénégalaise ont atteint 2 211 milliards FCFA en 2024 (≈ 3,7 milliards USD), contre environ 1 600 milliards FCFA en 2023, soit environ 12 % du PIB national. Source primaire : BCEAO. | BCEAO, relayée par l'APS et Le Soleil, décembre 2025 | ✅ sourcé |
| Diaspora sénégalaise estimée à environ 700 000 personnes en 2020, soit ~4 % de la population du Sénégal. Le chiffre le plus cité pour les Sénégalais en France (~190 000) date de 2005 et est OBSOLÈTE. L'INSEE publie 3,5 millions d'immigrés nés en Afrique vivant en France en 2023, sans ventilation Sénégal accessible dans mes recherches. | au-senegal.com (700 000, 2020) ; Wikipedia/EN (190 000, chiffre de 2005) ; INSEE Première n°2010 (3,5 M d'immigrés nés en Afrique, 2023) | ⚠️ estimation |
| AUDIENCE DIGITALE SÉNÉGAL (janvier 2025) : population 18,7 M ; internautes 11,3 M (60,6 %) ; identités réseaux sociaux 5,01 M (26,8 %). Audience publicitaire potentielle : Facebook 3,50 M (18,7 % de la population), YouTube 5,01 M, Instagram 1,30 M, LinkedIn 1,30 M, Messenger 865 000. Facebook a gagné +150 000 personnes atteignables (+4,5 %) entre octobre 2024 et janvier 2025. | DataReportal / Kepios, rapport Digital 2025: Senegal (données outils publicitaires Meta et Google, janvier 2025) | ✅ sourcé |
| L'audience publicitaire TikTok au Sénégal n'est PAS publiée par DataReportal (plateforme absente du rapport Digital 2025 Senegal) et je n'ai trouvé aucune source fiable donnant ce chiffre. Ne pas mettre de nombre d'utilisateurs TikTok Sénégal dans le business plan. | ESTIMATION NON VERIFIEE — donnée absente de DataReportal 2025 et des recherches complémentaires | ❌ non vérifiable |
| RISQUE CANAL : TikTok a été suspendu au Sénégal le 2 août 2023 par le gouvernement (messages jugés 'haineux et subversifs'), suspension maintenue en octobre 2023 sous conditions (retrait des faux comptes, représentation officielle au Sénégal). L'application a depuis été rétablie, mais 'en catimini' — aucune date officielle de levée n'a été trouvée. TikTok ne doit pas être un canal unique. | PressAfrik, Forbes Afrique, We Are Tech Africa (2023) ; date de levée : introuvable | ✅ sourcé |
| COÛT MÉDIA — CONSTAT DE VIDE : aucun fournisseur de benchmark sérieux ne publie de CPM médian Facebook/Meta pour le Sénégal. Lebesgue (données 2026, e-commerce) ne couvre AUCUN pays d'Afrique de l'Ouest : seuls l'Égypte (1,81 $) et l'Afrique du Sud (2,99 $) figurent pour l'Afrique. Superads a une page Sénégal mais n'affiche aucune valeur chiffrée. | lebesgue.io/facebook-ads/facebook-cpm-by-country (2026) ; superads.ai page Sénégal, consultés 28/07/2026 | ✅ sourcé |
| CPM Meta en Afrique francophone : 200 à 600 FCFA pour 1 000 impressions, contre 3 000 à 8 000 FCFA en France ou Belgique — soit 5 à 15 fois plus de personnes touchées à budget égal. Aucune méthodologie ni source tierce n'est citée par l'auteur ; c'est de l'expertise d'agence, à traiter comme un ordre de grandeur, pas comme une donnée. | ESTIMATION NON VERIFIEE (blog Flashpub, 2026, sans méthodologie) | ⚠️ estimation |
| Autres ordres de grandeur de la même source agence : CPM Afrique francophone < 1 à 2 $ (≈ 600 à 1 200 FCFA), CPC de quelques dizaines de FCFA, budget de test 600 à 3 000 FCFA/jour, budget indicatif Dakar ≈ 3 000 FCFA/jour (21 000 FCFA/semaine) contre 5 000 FCFA/jour à Abidjan et 1 500 FCFA/jour à Douala. Une autre source agence recommande 50 000 à 150 000 FCFA/mois minimum pour une campagne mesurable au Sénégal. | ESTIMATION NON VERIFIEE (blogs d'agences Flashpub 2026 et Novakou, sans méthodologie) | ⚠️ estimation |
| CIBLAGE DIASPORA EN FRANCE — coûts Meta : CPM 5 à 15 € (bas de fourchette pour le B2B services), CPC 0,20 à 0,80 € (au-delà d'1 € sur les secteurs concurrentiels type tech B2B et services financiers), CAC 50 à 100 €+ sur les secteurs complexes dont l'immobilier. Benchmark d'agence française, données 2025. | Junto, guide tarifs Meta Ads 2025 (benchmark propriétaire d'agence, méthodologie non publiée) | ⚠️ estimation |
| CPM Facebook France : 6,95 $ pour 1 000 impressions (données 2026, périmètre e-commerce uniquement, méthodologie et taille d'échantillon non publiées). | Lebesgue AI CMO, 'Facebook Ads CPM by Country', données 2026 | ✅ sourcé |
| COÛT PAR LEAD IMMOBILIER (Facebook/Meta) : médiane ≈ 29,50 $ sur juillet 2025 – juin 2026, avec un minimum de 16,21 $ (novembre 2025) et un maximum de 40,27 $ (janvier 2026) ; le secteur immobilier est ~36 % moins cher que la moyenne tous secteurs. Base : plus de 3 milliards de dollars de dépense publicitaire agrégée et anonymisée, valeurs médianes (pas moyennes). ATTENTION : échantillon dominé par les marchés occidentaux, non représentatif du Sénégal. | Superads, 'Facebook Ads Cost Per Lead Benchmarks for Real Estate', juillet 2025 – juin 2026 | ✅ sourcé |
| SYNTHÈSE OPÉRATIONNELLE 1 000 IMPRESSIONS (conversion au taux ≈ 600 FCFA/USD, ≈ 655 FCFA/EUR) : Sénégal/Meta ≈ 200 à 1 200 FCFA les 1 000 impressions [estimation agence] ; France/Meta ≈ 3 300 à 9 800 FCFA les 1 000 impressions [dérivé du benchmark Junto 5-15 €] ; France/Meta e-commerce ≈ 4 200 FCFA [dérivé de Lebesgue 6,95 $]. Écart Sénégal → France : facteur 5 à 15. | CALCUL DÉRIVÉ de Flashpub 2026, Junto 2025 et Lebesgue 2026 — la conversion est exacte, les CPM sous-jacents sont des estimations | ⚠️ estimation |
| SYNTHÈSE OPÉRATIONNELLE 1 LEAD : lead diaspora en France ≈ 18 000 FCFA (médiane immobilier Superads 29,50 $) à 33 000-66 000 FCFA (CAC immobilier Junto 50-100 €). À comparer au revenu Locawave : un abonné Solo à 10 000 FCFA/mois rapporte 120 000 FCFA sur 12 mois. Un lead diaspora à 30 000 FCFA n'est rentable que si le taux lead→abonné payant dépasse environ 25 % — ou si le lead se convertit sur le chantier (commission 5 %, panier bien supérieur). | CALCUL DÉRIVÉ de Superads (2025-2026) et Junto (2025) + grille tarifaire Locawave — le taux de conversion de 25 % est un seuil de rentabilité calculé, PAS une performance observée | ⚠️ estimation |
| AUCUNE donnée fiable trouvée sur le coût par lead ou le coût par message WhatsApp au Sénégal même. C'est le trou noir du dossier : il faudra le mesurer soi-même sur les 30 premiers jours de campagne. Ne pas inscrire de CPL Sénégal dans le business plan. | ESTIMATION NON VERIFIEE — donnée absente après recherches ciblées | ❌ non vérifiable |
| TIKTOK — CPM : les CPM TikTok sont globalement inférieurs à ceux de Meta (13,26 $ contre 14,19 $ en 2025, marchés développés) et tombent fréquemment sous 1,00 $ sur les marchés Tier 2 et Tier 3, ce qui inclut l'Afrique francophone. Aucun chiffre Sénégal spécifique n'existe publiquement. | ESTIMATION NON VERIFIEE (agrégateurs de benchmarks TikAdSuite / Awisee, méthodologie non publiée) | ⚠️ estimation |
| TIKTOK — CONTRAINTES OPÉRATIONNELLES : TikTok Ads Manager applique un budget minimum de 50 $/jour au niveau campagne et 20 $/jour au niveau groupe d'annonces. La plateforme est accessible depuis le Sénégal mais les cartes bancaires sénégalaises échouent souvent (conversion de devise, blocages BIN, restrictions bancaires sur les transactions internationales). Prévoir un moyen de paiement international. | TikTok Ads Manager (documentation officielle) ; guide Figo 'How to Pay for TikTok Ads in Senegal', 2026 | ✅ sourcé |
| TIKTOK — FORMATS QUI MARCHENT : In-Feed Ads (skippable, jusqu'à 60 s, CTA vers site / app / redirection WhatsApp) = point d'entrée par défaut ; Spark Ads (booster un post organique existant, sien ou d'un créateur avec autorisation) = format le plus rentable car il amplifie un contenu ayant déjà prouvé son engagement organique ; TopView (plein écran à l'ouverture de l'app) = premium, gros budgets uniquement. | TikTok Ads Manager / TikTok Business, documentation formats publicitaires (2026) | ✅ sourcé |
| TIKTOK — RÈGLES CRÉATIVES : hook dans les 2 premières secondes, format vertical 9:16, production pensée son activé, esthétique native plutôt que TV. Le style UGC (caméra à la main, lumière naturelle, visage du créateur visible, réactions authentiques) surpasserait les vidéos de marque tournées en studio de 20 à 40 % en engagement — ce dernier chiffre vient d'un blog d'agence, sans méthodologie. | Juicy Designs (guide TikTok 2026) pour les règles de format [estimation] ; LaiinLabs 2026 pour le +20-40 % [ESTIMATION NON VERIFIEE] | ⚠️ estimation |
| TIKTOK — DYNAMIQUE RÉGIONALE : l'Afrique francophone (Sénégal, Côte d'Ivoire, Cameroun, RDC) est décrite comme la zone de croissance TikTok la plus rapide du continent, avec des créateurs publiant en français ET en langues locales (wolof, lingala, dioula). Le contenu référençant culture, argot, musique et situations locales surperforme systématiquement le contenu générique. La croissance West/Central Africa est attribuée à Statista, sans référence précise vérifiable. | LaiinLabs, 'TikTok Marketing for African Brands in 2026' (blog d'agence, source Statista citée mais non vérifiable) ; France 24, reportage sur l'influenceur sénégalais Macdi (16/07/2026) confirme la portée panafricaine francophone depuis Dakar | ⚠️ estimation |
| TIKTOK — ENSEIGNEMENTS QUALITATIFS D'UN MÉDIA PANAFRICAIN : privilégier les créateurs authentiques plutôt que les influenceurs vérifiés ; le contenu de marque doit être divertissant et subtil, jamais frontal ; viser des niches plutôt que la communication de masse ; 'aucune quantité de recherche ne vous préparera' au contexte ouest-africain — il faut tester sur le terrain. | Pulse Africa, 'What we learned from using TikTok for brand campaigns in Africa' (retour d'expérience, sans métriques chiffrées ; chiffres TikTok cités datant de janvier 2021) | ✅ sourcé |

**Ce que ça change pour la création :**

- DEUX MARCHÉS PUBLICITAIRES, DEUX BUDGETS : au Sénégal, 1 000 impressions coûtent environ 200 à 1 200 FCFA [estimation] ; sur la diaspora en France, 3 300 à 9 800 FCFA [estimation]. Conséquence directe sur la production d'images : les créas Sénégal peuvent être nombreuses et jetables (tester 10 visuels à 3 000 FCFA/jour) ; les créas diaspora France doivent être peu nombreuses et très travaillées, car chaque impression coûte 5 à 15 fois plus cher. Ne pas produire le même volume des deux côtés.
- ATTAQUER L'ANGLE MORT N°1 EN IMAGE : les concurrents diaspora (SEETLU, Wizodia, HubCephas) montrent la PREUVE mais jamais le CONTRÔLE DE L'ARGENT. Le visuel signature de Locawave doit montrer les deux dans le même cadre : à gauche la photo réelle de la toiture posée, à droite le bouton 'Régler la phase 3' encore inactif. Prompt NanoBanana : écran de smartphone en mains, split-screen photo chantier / interface orange #f97316, bouton grisé avec libellé 'Valider les preuves', lumière de fin d'après-midi, main d'homme noir 40-50 ans, arrière-plan flou d'appartement européen en hiver.
- MOUVEMENT IMAGE→VIDÉO POUR CE VISUEL : très lent push-in sur l'écran (2 s), puis le pouce appuie et le bouton passe du gris à l'orange avec un léger flash. Durée totale 4 à 6 s. C'est le hook — il doit tenir dans les 2 premières secondes exigées par TikTok.
- LE CONTRASTE GÉOGRAPHIQUE EST LE HOOK LE PLUS FORT : plan 1 = fenêtre pluvieuse d'un appartement en France, plan 2 = même personne regardant son téléphone, plan 3 = ce qu'il voit, un chantier à Diamniadio en plein soleil avec un maçon qui salue la caméra. Trois images à générer, transition par match-cut sur le téléphone. Cette structure exploite l'insight émotionnel 'l'argent envoyé au pays' sans jamais accuser personne — donc sans risque de rejet culturel.
- REPRENDRE LA TRANSPARENCE TARIFAIRE COMME ARME VISUELLE : aucun concurrent identifié n'affiche ses prix. Produire un visuel unique, très épuré, fond bleu marine #1a2744, où seuls trois nombres apparaissent en très grande taille : 10 000 · 20 000 · 45 000 FCFA. Sous-titre : 'Le prix ne dépend pas de votre loyer.' C'est le format le moins cher à produire et le plus difficile à copier pour un concurrent qui a construit son modèle sur le devis opaque.
- POUR LE FEED FACEBOOK SÉNÉGAL (audience publicitaire Facebook = 3,50 M de personnes, source DataReportal janvier 2025) : ce canal est le plus large et le moins cher du pays. Y placer les créas 'douleur locative quotidienne' — la quittance écrite à la main, le carnet froissé, l'appel du 5 du mois. Prompt type : gros plan sur un carnet de loyers manuscrit taché, à côté un smartphone affichant une quittance PDF propre. Contraste physique/numérique, pas de texte dans l'image (Meta pénalise), le texte va dans la légende.
- POUR TIKTOK : privilégier le format Spark Ads, c'est-à-dire produire d'abord du contenu ORGANIQUE et ne booster que ce qui a déjà pris. Concrètement, les images générées doivent servir des vidéos qui ressemblent à du contenu de créateur, pas à une publicité : caméra à la main, lumière naturelle, visage visible, une seule idée par vidéo. Les créas 'studio' seront moins performantes.
- TIKTOK — DURÉE ET LANGUE : viser 15 à 30 s en In-Feed (le format autorise 60 s mais l'attention ne suit pas), français avec incrustations en wolof pour le marché sénégalais, français neutre pour la diaspora. Le son est un levier, pas un accessoire : prévoir dès la génération d'images des plans qui supportent une voix off en wolof ('Soo demee, ndax yaa xam ni sa kër dafay dox ?' — à faire valider par un locuteur natif).
- NE PAS FAIRE DE TIKTOK LE CANAL UNIQUE : la plateforme a été suspendue au Sénégal le 2 août 2023 et le rétablissement n'a jamais été officiellement daté. Toute créa produite pour TikTok doit être exportable en Reels et en Facebook feed sans retournage — donc cadrer 9:16 avec les zones de sécurité des trois plateformes, et ne jamais incruster de texte dans le tiers inférieur.
- FACEBOOK MARKETPLACE EST UN CANAL D'ANNONCES, PAS DE MARQUE : y publier les biens (le module marketplace de Locawave), pas le discours produit. C'est là que se joue la substitution à Expat-Dakar et CoinAfrique. L'argument à incruster en légende : 'La visite, le bail, le paiement et la quittance restent dans l'application' — c'est exactement ce que les plateformes d'annonces généralistes ne savent pas faire.
- ARBITRAGE ÉCONOMIQUE À GARDER EN TÊTE EN PRODUISANT LES CRÉAS DIASPORA : un lead diaspora coûte entre 18 000 et 66 000 FCFA [estimation dérivée], alors qu'un abonné Solo rapporte 120 000 FCFA sur 12 mois. Les créas diaspora ne doivent donc PAS vendre l'abonnement à 10 000 FCFA — elles doivent vendre le chantier (commission 5 %, panier bien plus élevé). Le visuel diaspora parle de construction et de preuve ; le visuel Sénégal parle de loyer et de quittance. Deux univers graphiques distincts.
- LA VALIDATION AVANT PAIEMENT DOIT ÊTRE MONTRÉE SANS MENTIR : Locawave ne détient jamais les fonds. Le visuel doit donc représenter un STATUT, pas un coffre-fort. Éviter absolument les icônes de coffre, de banque ou de pile de billets détenus par la marque. Préférer une frise de phases avec des pastilles : 'Fondations — payée', 'Élévation — payée', 'Toiture — en attente de votre validation'. C'est plus juste juridiquement et visuellement plus original que le vocabulaire escrow habituel.
- MESURER AVANT DE CROIRE : aucun coût par lead fiable n'existe pour le Sénégal. Prévoir 30 jours de test à budget faible (3 000 FCFA/jour à Dakar suffisent selon les estimations d'agence) avec 4 à 6 créas différentes, pour produire VOTRE propre benchmark. C'est ce chiffre-là, et pas un chiffre trouvé sur un blog, qui doit entrer dans le business plan.
- FORMATER LES MONTANTS PARTOUT AVEC ESPACE : '350 000 FCFA', jamais '350,000'. À vérifier explicitement dans chaque prompt NanoBanana, car les modèles d'image reproduisent par défaut la convention anglo-saxonne à la virgule et cela trahirait immédiatement une créa générée pour un public sénégalais.

---

## 2 — Stratégie de campagne

### L'idée centrale

> **Ne payez que ce que vous avez vu.**

Au Sénégal, tout le monde vous montre des photos ; personne ne conditionne l'argent à ce que vous avez vu. Locawave inverse l'ordre habituel : le chantier avance par phases, chaque phase doit être prouvée en photos et vidéos réelles, et vous ne réglez cette phase qu'après l'avoir validée — Locawave ne détient jamais les fonds, le blocage reste chez Wave ou Orange Money. La campagne ne vend donc pas la confiance (c'est le vocabulaire des escrocs, et il est brûlé), elle vend la vérification : une toiture à l'écran avant la toiture payée. Et ce même principe — la preuve d'abord, l'argent ensuite — se prolonge dans la location : quittance PDF, relance, score de ponctualité, chaque franc a une trace.

**Accroches alternatives à tester :**

- « La toiture n'est pas finie. Vous ne payez pas la toiture. »
- « Ce n'est pas de la méfiance. C'est de la clarté. »
- « Voir avant de payer. »
- « La preuve d'abord. L'argent ensuite. »
- « Votre chantier vous envoie des nouvelles. Chaque semaine. »
- « Demander des photos, ce n'est accuser personne. »
- « Le prix ne dépend pas de votre loyer. »

### Positionnement

Pour le propriétaire sénégalais — à Dakar comme à Bergame, Créteil ou Barcelone — qui met de l'argent dans un bien qu'il ne peut pas surveiller tous les jours, Locawave est le système du logement où le paiement suit la preuve. Les agences de suivi de chantier vous envoient des photos mais gardent la main sur l'argent ; les logiciels de gestion locative gèrent le loyer mais ignorent totalement le chantier ; Expat-Dakar et CoinAfrique s'arrêtent à l'échange d'un numéro de téléphone. Locawave est le seul à tenir les deux bouts : la preuve datée par phase ET le exigibilité du paiement conditionnée à votre validation, plus la continuité TROUVER → LOUER → GÉRER → ENTRETENIR → SERVIR. Position de marque : l'adversaire n'est jamais une personne, c'est le flou. On ne parle pas de famille, on ne parle pas de voleurs — on parle de dates, de photos, de phases et de montants en FCFA.

### Les piliers du message

Chaque promesse est adossée à une fonctionnalité réellement livrée — c'est ce qui
évite la publicité mensongère et la déception au premier usage.

| Pilier | Promesse | Preuve dans le produit |
|---|---|---|
| **Le paiement suit la preuve, phase par phase** | Vous ne réglez une phase de travaux qu'après avoir vu et validé les preuves de cette phase. | Suivi de chantier par phases avec photos et vidéos réelles ; le propriétaire valide les preuves depuis son téléphone et c'est cette validation qui rend le paiement dû. Locawave ne détient jamais les fonds : Locawave ne fait que verrouiller l'ordre : preuve, validation, puis règlement, le paiement ne devient dû qu'après votre validation. Formulation à l'écran : « Fondations — payée · Élévation — payée · Toiture — en attente de votre validation ». Interdit en créa : coffre-fort, pile de billets, mot « nous gardons votre argent ». |
| **Le silence du chantier déclenche une alerte** | Vous n'avez plus besoin d'appeler pour savoir où ça en est : c'est le chantier qui vous prévient. | Trois alertes chantier réellement livrées : « phase soumise », « budget dépassé », « aucune photo depuis 7 jours ». Cette dernière est la meilleure démonstration produit, parce qu'elle répond exactement au reproche le plus répandu — les mêmes photos, sous le même angle, à trois mois d'écart. Créa signature : notification sur écran verrouillé, fond bleu marine #1a2744, texte orange #f97316, « Aucune photo de votre chantier depuis 7 jours. » |
| **Le loyer rentre sans que vous couriez derrière** | Plus d'appels le 5 du mois, plus de quittance écrite à la main, et les bons payeurs ne sont pas harcelés. | Quittances PDF automatiques ; rappels dans l'app et sur WhatsApp ; relances progressives J+3 / J+7 / J+15 au ton croissant ; rappel intelligent qui épargne les bons payeurs ; score de ponctualité du locataire de 0 à 100 calculé sur l'historique réel ; alertes fin de bail à 90 / 60 / 30 jours ; OCR des reçus Wave et Orange Money ; tableau de bord encaissé / en attente / en retard / taux de recouvrement ; rapport hebdomadaire au propriétaire. |
| **Personne n'entre sans être vérifié, et tout reste écrit** | Le maçon, le plombier, le locataire, l'annonce : tout ce qui vous engage laisse une trace dans l'application. | KYC obligatoire pour tout prestataire affiché dans l'annuaire et pour tout propriétaire qui publie une annonce ; avis réservés à ceux qui ont réellement loué ou réservé ; messagerie intégrée — la transaction ne sort jamais de l'app, jamais un simple échange de numéro ; gestion des litiges avec médiation. À rapprocher du droit sénégalais, argument gratuit et vrai : le contrat verbal est la première source de litige, et sans état des lieux d'entrée contradictoire le bailleur ne peut rien retenir sur la caution. |
| **Le prix ne dépend pas de votre loyer** | Vous ne payez pas plus parce que votre bien rapporte plus. | Grille publique : Solo 10 000 FCFA/mois, Pro 20 000 FCFA/mois, Agence 45 000 FCFA/mois, commission 5 % uniquement sur les travaux et chantiers, essai gratuit. Aucun concurrent SaaS sénégalais identifié n'affiche ses prix publiquement — la transparence tarifaire est en elle-même un argument. Créa : deux immeubles côte à côte, l'un modeste l'autre haut de gamme, le même badge orange « 10 000 FCFA/mois » sur les deux. |

### Les personas

#### Ousmane Diallo, 47 ans, Bergame (Italie), magasinier en entrepôt frigorifique

**Profil.** Parti d'Italie il y a 19 ans, marié, trois enfants restés à Thiès. Construit une R+1 à Diamniadio depuis deux ans, financée par virements Wave successifs de 400 000 à 1 500 000 FCFA. Le chantier est supervisé par son beau-frère, « l'homme de confiance ». WhatsApp est son outil principal, avant l'email. Rentre au pays une fois tous les deux ans.

**Sa douleur.** Il a déjà envoyé plus de 20 millions FCFA et ne sait pas dire quel pourcentage de la maison est réellement fait. Les photos qu'il reçoit se ressemblent toutes : même angle, même heure, mur de parpaings inachevé. Chaque appel se termine par une demande d'argent sans facture. Il fait des heures supplémentaires de nuit pour financer un mur dont il n'est pas sûr qu'il existe. Et il n'ose pas demander de comptes : dans sa famille, réclamer, c'est risquer d'être traité de mbougoul mbook.

**Ce qui le fait basculer.** La demande de trop : on lui réclame l'argent de la toiture alors que la dernière photo date de six semaines. Il cherche « suivi chantier Sénégal diaspora » un dimanche soir, tombe sur une vidéo de 15 secondes montrant un pouce suspendu au-dessus d'un bouton orange et la phrase « La toiture n'est pas finie. Vous ne payez pas la toiture. »

**Son objection.** « Si je mets ça en place, mon beau-frère va comprendre que je ne lui fais pas confiance. Je vais casser la famille pour une application. »

**Ce qu'on lui répond.** Locawave n'est pas dirigé contre quelqu'un, il enlève une charge à tout le monde. Ce n'est pas vous qui réclamez des photos : c'est le système qui les demande, à date fixe, à tous les chantiers. Votre beau-frère cesse d'être celui qui doit se justifier au téléphone et devient celui dont le travail est validé par écrit — et payé plus vite, phase après phase, sans discussion. C'est aussi sa protection le jour où quelqu'un l'accusera à tort.

#### Aminata Sow, 38 ans, Créteil (France), aide-soignante en EHPAD

**Profil.** Née à Dakar, en France depuis 14 ans, deux enfants. A hérité avec ses frères de deux appartements à Grand Yoff loués 175 000 et 220 000 FCFA. C'est elle qui gère parce qu'elle est « celle qui a le temps », depuis son téléphone entre deux gardes. Sa mère, 71 ans, encaisse parfois les loyers en espèces. Aucun bail écrit sur l'un des deux logements.

**Sa douleur.** Elle ne sait jamais si le loyer est tombé. Les mois se mélangent, il n'existe aucune quittance, et chaque relance passe par sa mère qui n'aime pas insister. Un locataire est à trois mois de retard et elle n'a rien pour le prouver. Elle refait les comptes de tête à 23 h après une journée de douze heures, et ses frères lui demandent où va l'argent.

**Ce qui le fait basculer.** Un désaccord sur la caution en fin de bail : le locataire affirme avoir payé, elle n'a aucun écrit, elle perd. Elle veut, avant le prochain locataire, un bail écrit, un état des lieux et une trace de chaque paiement.

**Son objection.** « C'est encore un abonnement de plus. Et ma mère et mon locataire ne vont jamais utiliser une application. »

**Ce qu'on lui répond.** Le locataire ne s'inscrit pas de lui-même : il est invité par vous, et il reçoit ses rappels et son résumé mensuel sur WhatsApp, là où il est déjà. Votre mère n'a rien à installer — l'OCR lit le reçu Wave ou Orange Money qu'on lui envoie. Côté prix : 10 000 FCFA par mois, quel que soit le montant de vos loyers, contre une agence qui prendrait un pourcentage sur 395 000 FCFA encaissés chaque mois. Et l'essai est gratuit : vous pouvez éditer votre première quittance PDF ce soir avant de payer quoi que ce soit.

#### Cheikh Mbaye, 58 ans, Sacré-Cœur, Dakar, commerçant retraité

**Profil.** Bailleur résident, six logements aux Parcelles Assainies et à Liberté 6, loyers entre 90 000 et 300 000 FCFA. Tient un carnet manuscrit depuis quinze ans. Smartphone Android, WhatsApp et Facebook quotidiens, mais lit peu le français à l'écran et n'installe presque jamais d'application. Fait construire deux studios supplémentaires à l'arrière d'une parcelle à Yoff.

**Sa douleur.** Trois locataires paient toujours en retard, deux paient toujours à l'heure, et il les relance tous de la même façon — ce qui abîme ses meilleures relations. Il écrit ses quittances à la main. Il ne sait pas dire, sans ouvrir son carnet, combien il a réellement encaissé le mois dernier. Deux fins de bail lui sont passées sous le nez l'an dernier, logements vides trois mois.

**Ce qui le fait basculer.** Un fils ou un neveu lui montre le tableau de bord sur son téléphone : encaissé, en attente, en retard, taux de recouvrement, en un écran. Ou il voit passer sur Facebook le visuel du carnet froissé à côté d'une quittance PDF propre.

**Son objection.** « Je gère mes biens depuis vingt ans avec mon carnet. Et l'informatique, ce n'est pas pour moi. »

**Ce qu'on lui répond.** Le carnet ne relance pas vos locataires le 3, le 7 et le 15 du mois — Locawave le fait à votre place, sur WhatsApp, et laisse tranquilles ceux qui paient à l'heure. Vous n'avez rien à taper : vous photographiez le reçu Wave, l'application le lit et sort la quittance. C'est une application web, rien à installer depuis une boutique, et l'essai est gratuit. Si au bout d'un mois vous préférez votre carnet, vous gardez votre carnet.

#### Ndèye Fatou Gaye, 36 ans, Dakar (Point E), gérante d'une petite agence immobilière

**Profil.** Dirige une agence de 4 personnes, 60 lots en gestion pour une trentaine de propriétaires, dont une dizaine vivent en France, en Italie ou aux États-Unis. Travaille sur Excel, WhatsApp et un classeur papier. Publie ses annonces sur Expat-Dakar et CoinAfrique. Présente sur LinkedIn, c'est là qu'elle suit ce qui se fait dans le métier.

**Sa douleur.** Elle passe ses journées à rassurer des propriétaires à distance : envoyer une photo, refaire un décompte, justifier un retard. Ses annonces sont noyées au milieu des voitures et des offres d'emploi sur les plateformes généralistes, et la relation s'arrête à l'échange d'un numéro. Elle perd des mandats face à des propriétaires diaspora qui trouvent qu'ils ne voient rien.

**Ce qui le fait basculer.** Un propriétaire installé à Milan lui demande un accès pour suivre ses biens lui-même. Elle comprend qu'un accès propriétaire propre devient un argument commercial pour gagner des mandats diaspora, pas une perte de contrôle.

**Son objection.** « Si mes propriétaires voient tout en direct, ils vont se dire qu'ils n'ont plus besoin de moi. »

**Ce qu'on lui répond.** C'est l'inverse : ce qu'ils paient aujourd'hui, c'est votre travail de terrain, pas votre monopole sur l'information — et c'est justement l'opacité qui vous fait perdre des mandats. Une agence qui donne le tableau de bord, les quittances automatiques et les preuves de chantier à ses propriétaires expatriés en gagne d'autres. 45 000 FCFA par mois pour toute l'agence, quel que soit le montant des loyers gérés : c'est moins qu'un mandat perdu.

### Le tunnel de conversion

| Étape | Objectif | Canal | Message | KPI |
|---|---|---|---|---|
| **1. Notoriété — faire exister la douleur en 3 secondes, sans son** | Toucher deux audiences séparées (Sénégal résident / diaspora Europe) avec des créas courtes qui montrent le flou, jamais un logo. Deux campagnes, deux budgets, jamais dans le même ensemble publicitaire. | Facebook feed + Reels (le plus gros réseau ciblable du Sénégal, audience majoritairement masculine 35-55, ce qui colle au bailleur) pour le Sénégal ; Reels et TikTok organique/Spark Ads ciblés Île-de-France et Rhône-Alpes, Bergame, Milan, Turin, Rome, Gênes, Barcelone, Madrid, Séville, Murcie pour la diaspora. YouTube en soutien (série longue en wolof « suivre un chantier depuis l'étranger »). LinkedIn pour l'offre Agence. Tout en 9:16, plus un 1:1 pour Marketplace. | Sénégal : la douleur locative quotidienne — le carnet froissé et l'appel du 5 du mois. Diaspora : « Trois mois. La même photo. » / « Ce n'est pas de la méfiance. » Texte incrusté en français, 5 mots maximum, voix off wolof pour la version Sénégal, 100 % français pour la diaspora. Aucun visage coupable, aucun membre de la famille montré en fautif : l'antagoniste est le flou. | Taux de rétention à 3 secondes (viser au-dessus de 25 % avant d'augmenter un budget) et coût pour 1 000 impressions relevé dans VOTRE compte, pas dans un blog. Aucun CPM fiable n'existe pour le Sénégal : 30 jours de test à budget faible, 4 à 6 créas, pour produire votre propre référence. Ne jamais optimiser sur les likes. |
| **2. Considération — passer de l'émotion à la démonstration** | Amener la personne à voir concrètement la frise de phases et le bouton de validation, et ouvrir une conversation. | Click-to-WhatsApp en destination par défaut (WhatsApp est l'outil quotidien de cette audience, avant l'email) ; groupes Facebook de bailleurs et de Sénégalais d'Italie/Espagne/France en organique ; annonces sur Expat-Dakar et CoinAfrique où les propriétaires sont déjà en intention ; LinkedIn pour les agences ; YouTube pour la version longue. | Démonstration écran, pas discours : « Fondations — payée · Élévation — payée · Toiture — en attente de votre validation. » Et la phrase juridiquement exacte à ne jamais déformer : vous ne réglez qu'après avoir validé, par Wave ou Orange Money tant que vous n'avez pas validé — Locawave ne détient jamais les fonds. Pour le volet locatif : la quittance PDF et les relances J+3 / J+7 / J+15. | Coût par conversation WhatsApp réellement ouverte (et non par clic), et taux de réponse au deuxième message. Sur la diaspora, surveiller ce coût de près : un lead en France coûte plusieurs dizaines de milliers de FCFA quand un abonné Solo rapporte 120 000 FCFA sur douze mois — donc les créas diaspora doivent parler chantier (commission 5 %, panier élevé), pas abonnement à 10 000 FCFA. |
| **3. Essai — obtenir un premier acte réel en moins de 48 heures** | Faire produire à l'utilisateur sa première preuve : une quittance PDF envoyée, ou un chantier créé avec sa première phase. Tant qu'il n'a rien produit, il n'a rien compris. | Essai gratuit sur l'application web (PWA, rien à installer depuis une boutique) ; accompagnement humain par WhatsApp les 48 premières heures ; relance in-app. | Sénégal : « Ajoutez un bien, envoyez votre première quittance ce soir. » Diaspora : « Créez votre chantier, découpez-le en phases, demandez la première série de photos. » Une seule action demandée à la fois. | Taux d'activation à 48 h : pourcentage d'essais ayant créé au moins un bien et un locataire (ou un chantier avec une phase). Délai médian entre inscription et première quittance PDF émise. Ces deux chiffres pilotent tout le reste — un essai non activé ne se convertira pas. |
| **4. Abonnement — laisser la preuve chiffrée faire la vente** | Convertir l'essai en Solo, Pro ou Agence, en s'appuyant sur ce que l'utilisateur a lui-même constaté pendant l'essai. | In-app + rapport hebdomadaire au propriétaire (fonctionnalité déjà livrée, c'est le meilleur argument de renouvellement) + relance WhatsApp humaine + appel pour les agences. | « Vous avez encaissé 745 000 FCFA ce mois-ci, votre taux de recouvrement est passé à 92 %. » Et l'argument de prix mis en visuel plutôt qu'en tableau : le prix ne dépend pas de votre loyer — 10 000 / 20 000 / 45 000 FCFA, quel que soit le montant encaissé, là où une agence prend un pourcentage tous les mois. | Taux essai → abonné payant à J30, et coût par abonné payant comparé aux 120 000 FCFA de revenu sur douze mois d'un Solo. Suivre séparément Sénégal et diaspora : ce sont deux économies différentes. Suivre aussi le revenu commission 5 % par chantier, qui peut à lui seul justifier un coût d'acquisition diaspora élevé. |
| **5. Recommandation — transformer les 200 premiers en preuve publique** | Faire du parrainage le premier canal d'acquisition au Sénégal, où le bouche-à-oreille entre bailleurs et entre familles diaspora vaut plus que le budget média sur une cible aussi étroite. | Module de parrainage déjà en production ; avis vérifiés (réservés à ceux qui ont réellement loué ou réservé) ; témoignages face caméra en français teinté de wolof, tournés sans décor publicitaire, réinjectés en Spark Ads sur TikTok et en Reels ; annuaire de prestataires vérifiés qui devient lui-même un motif de venue. | « Il l'a fait construire depuis Bergame. Il a payé la toiture le jour où il l'a vue. » Le témoignage à la première personne peut dire ce que la marque ne dira jamais — y compris la peur d'être traité de mbougoul mbook — mais aucune accroche de marque ne doit reprendre ce registre. | Pourcentage d'abonnés ayant parrainé au moins une personne à J90, coût d'acquisition d'un inscrit parrainé comparé à un inscrit payant, et taux de rétention à 6 mois. Instrumenter dès le premier jour les 200 premiers inscrits (nombre de biens, quartier, résident au Sénégal ou à l'étranger, chantier ou pas) : aucune donnée publique n'existe sur le nombre de bailleurs au Sénégal, votre propre base sera la seule source de vérité du plan. |

---

## 3 — Les créations, canal par canal

**37 créations** prêtes à l'emploi. Pour chacune : le texte se copie-colle tel quel
dans le gestionnaire de publicités, et le prompt d'image se copie-colle tel quel dans
NanoBanana Pro. Les prompts d'images sont **en anglais** (le modèle y est plus précis)
mais tout texte à incruster dans le visuel est **en français**, entre guillemets.

### Index des créations

| ID | Canal | Angle | Cible |
|---|---|---|---|
| `HERO-01` | Héros chantier | Le flou | Ousmane Diallo, 47 ans, Bergame (Italie), mag |
| `HERO-02` | Héros chantier | La première preuve | Ousmane Diallo (spectateur) |
| `HERO-03` | Héros chantier | Le renversement d'objection, vu du côté du prestataire | Ousmane Diallo (l'objection familiale) + pres |
| `HERO-04` | Héros chantier | Le silence déclenche l'alerte | Ousmane Diallo (Bergame) et Aminata Sow (Crét |
| `HERO-05` | Héros chantier | Le climax : le pouce suspendu au-dessus du bouton orange, la toiture visiblement inachevée | Ousmane Diallo, 47 ans, Bergame |
| `HERO-06` | Héros chantier | La résolution, en horizontal 16:9 : c'est le plan de fin du montage long de 60-90 s | Ousmane Diallo |
| `FBD-01` | FB diaspora | les mêmes photos, sous le même angle, à trois mois d'écart | Ousmane Diallo, 47 ans, Bergame (Italie), mag |
| `FBD-02` | FB diaspora | retournement complet : le système ne le surveille pas, il le décharge et le fait payer plu | Ousmane Diallo (Bergame) et tout diaspora qui |
| `FBD-03` | FB diaspora | l'écart entre ce qu'on a payé et ce qu'on trouve | Diaspora France/Italie/Espagne/USA qui rentre |
| `FBD-04` | FB diaspora | l'alerte « aucune photo depuis 7 jours » | Diaspora Europe/USA, propriétaire d'un chanti |
| `FBD-05` | FB diaspora | la démonstration frontale de la mécanique : la frise de phases et le pouce suspendu au-des | Diaspora sur le point de payer une grosse pha |
| `FBD-06` | FB diaspora | la bailleuse à distance, l'héritage familial, la quittance PDF et la trace écrite | Aminata Sow, 38 ans, Créteil (France), aide-s |
| `FB-01` | FB feed | le bailleur résident qui abandonne son carnet manuscrit | Cheikh Mbaye, 58 ans, Sacré-Cœur Dakar, six l |
| `FB-02` | FB feed | la quittance manuscrite contre la quittance PDF | Aminata Sow, 38 ans, gère deux appartements à |
| `FB-03` | FB feed | les relances J+3 / J+7 / J+15 et le score de ponctualité | Bailleur résident de 40 à 60 ans qui a 3 à 8  |
| `FB-04` | FB feed | le prix ne dépend pas du montant du loyer | Bailleur qui hésite entre une agence à pource |
| `FB-05` | FB feed | le chantier que l'on paie sans le voir avancer | Propriétaire résident au Sénégal qui fait con |
| `FB-06` | FB feed | produire sa première quittance dès ce soir, gratuitement | Bailleur ou bailleuse de 35 à 55 ans, 1 à 4 l |
| `FBM-01` | Facebook Marketplace | L'annonce de location comme démonstration produit : un vrai logement, un propriétaire pass | Locataire solvable de Dakar en recherche acti |
| `FBM-02` | Facebook Marketplace | L'annonce de service qui parle au bailleur résident dans SA langue de tous les jours : le  | Cheikh Mbaye, 58 ans, Sacré-Cœur, six logemen |
| `FBM-03` | Facebook Marketplace | L'annonce de service diaspora, publiée sur les Marketplace locaux du Sénégal ET vue par le | Ousmane Diallo, 47 ans, Bergame, R+1 en const |
| `FBM-04` | Facebook Marketplace | Annonce de recrutement de prestataires | Prestataires du bâtiment de Dakar, Thiès, Mbo |
| `FBM-05` | Facebook Marketplace | L'annonce haut de gamme qui vend la MÉTHODE plutôt que le bien : dossier, visite planifiée | Locataire expatrié ou cadre dakarois pour la  |
| `FBM-06` | Facebook Marketplace | Annonce B2B pour les agences, publiée en catégorie Services et destinée à être partagée en | Ndèye Fatou Gaye, 36 ans, Point E, agence de  |
| `TT-01` | TikTok | le point de vue subjectif de l'homme qui reçoit la même photo depuis six semaines et à qui | Ousmane Diallo, 47 ans, Bergame (Italie), mag |
| `TT-02` | TikTok | la caution perdue faute d'écrit : bascule du volet locatif, raconté par une femme, à voix  | Aminata Sow, 38 ans, Créteil (France), aide-s |
| `TT-03` | TikTok | le carnet manuscrit froissé de quinze ans face au tableau de bord, sans jamais moquer le c | Cheikh Mbaye, 58 ans, Sacré-Cœur Dakar, six l |
| `TT-04` | TikTok | pas d'acteur, pas d'histoire : un doigt, une interface, la mécanique du paiement condition | Diaspora et Sénégal résident, 25-45 ans, en p |
| `TT-05` | TikTok | le 5 du mois et les excuses recyclées, joué en trois répliques, où la chute est que le pro | Cheikh Mbaye et tout bailleur résident au Sén |
| `TT-06` | TikTok | un homme devant la maison qu'il a fait construire à 5 000 km, qui dit ce que la marque ne  | Ousmane Diallo et la diaspora sénégalaise d'I |
| `TT-07` | TikTok | « 3 erreurs que font les propriétaires au Sénégal », dont une erreur juridique vraie et gr | Bailleurs résidents au Sénégal et petits prop |
| `TT-08` | TikTok | la maison qui se construit, mais rythmée par les validations : ce n'est pas le temps qui a | Diaspora Europe et USA en cours de constructi |
| `PRE-01` | Recrutement des prestataires (maçons, plombiers, électriciens, chefs de chantier) | l'annuaire vérifié transforme l'ouvrage en preuve publique | Maçon / chef de chantier expérimenté, 35-55 a |
| `PRE-02` | Recrutement des prestataires (maçons, plombiers, électriciens, chefs de chantier) | Le paiement par phase validée, raconté du côté de l'artisan : ce n'est pas un contrôle imp | Chef de chantier ou maçon qui travaille pour  |
| `PRE-03` | Recrutement des prestataires (maçons, plombiers, électriciens, chefs de chantier) | La douleur nue du travail non payé, dite avec la phrase que tous ont entendue | Électricien, plombier, carreleur indépendant, |
| `PRE-04` | Recrutement des prestataires (maçons, plombiers, électriciens, chefs de chantier) | La réputation qui se prouve : seuls les clients qui ont réellement travaillé avec vous peu | Plombier ou carreleur installé, bonne réputat |
| `PRE-05` | Recrutement des prestataires (maçons, plombiers, électriciens, chefs de chantier) | Le renversement du regard : ce n'est plus l'artisan qui cherche du travail, c'est le propr | Chef de chantier, maçon ou entrepreneur du bâ |

---

## Campagne héros — Le suivi de chantier · feuilleton en 6 épisodes (Facebook feed + Reels, TikTok, YouTube pour la version longue). 5 épisodes en vertical 9:16, l'épisode final en horizontal 16:9 pour le montage long de 60-90 s.

> **Note stratégique.** STRUCTURE DU FEUILLETON. Les six épisodes forment un arc en trois temps : manque (01), mécanisme (02-03), épreuve (04-05), résolution (06). L'ordre n'est pas interchangeable — 05 ne fonctionne que si 02 a déjà montré à quoi ressemble une preuve, et 04 ne fonctionne que si 03 a déjà retourné l'objection familiale. Le fil rouge visuel est la température : froid bleu-gris (01), plein soleil (02-03), noir absolu (04), lampe unique (05), or chaud (06). Le fil rouge sonore est le silence : total en 04, rompu par une seule vibration.
> 
> MONTAGE DE LA VERSION LONGUE (60-90 s, 16:9, YouTube + page d'accueil). Assembler dans l'ordre 01 → 02 → 03 → 04 → 05 → 06 en donnant 8 s aux épisodes 01, 02, 03 et 06, 6 s à 04 et 12 s à 05 (le pouce qui s'arrête est le point culminant, il doit respirer). Ajouter en tête un carton noir de 2 s avec la seule mention « Diamniadio, 2 ans de chantier, 20 millions FCFA » et en pied le logo 2 s. Le montage long se recoupe ensuite en verticaux sans retournage : chaque épisode est déjà cadré 9:16 sauf le 06, à produire dans les deux formats.
> 
> RYTHME DE PUBLICATION. Un épisode tous les deux jours pendant douze jours, toujours le soir entre 20 h et 22 h heure de Paris (c'est le créneau de la diaspora après le service, et il correspond à 19 h-21 h à Dakar). Ne pas publier les six en une semaine : le feuilleton doit laisser le temps aux commentaires de l'épisode précédent d'exister, c'est là que se joue la preuve sociale. Reprendre la même série en boucle sur TikTok trois semaines plus tard, en changeant uniquement les trois premières secondes.
> 
> DÉCOUPAGE DES BUDGETS. Deux campagnes séparées, jamais dans le même ensemble publicitaire. Diaspora Europe (Île-de-France, Rhône-Alpes, Bergame, Milan, Turin, Rome, Gênes, Barcelone, Madrid, Séville, Murcie) : épisodes 01, 04, 05, 06 — ce sont ceux qui parlent chantier, donc panier élevé et commission de 5 %, ce qui seul justifie un coût d'acquisition européen. Sénégal résident : épisodes 02, 03, 06 — plus terrain, plus produit, avec voix off en wolof à la place des scripts français fournis. Ne jamais mettre l'abonnement à 10 000 FCFA en avant sur les créas diaspora : c'est le chantier qui vend, l'abonnement suit.
> 
> CRÉAS À TESTER EN PREMIER. Lancer avec 01 et 04 en parallèle sur la diaspora : ce sont les deux qui produisent la meilleure rétention à 3 secondes, l'une par la reconnaissance de la douleur, l'autre par la curiosité d'un écran noir silencieux. 04 est aussi la moins chère à produire et la plus facile à décliner (changer le nombre de jours, le prénom, la ville). Si la rétention à 3 s de l'ensemble dépasse 25 % sur 30 jours à budget faible, alors seulement monter les budgets sur 05, qui est la créa de conversion.
> 
> REDIRECTION. Tous les épisodes pointent vers une conversation WhatsApp, pas vers un formulaire. Créer une audience de reciblage « a vu 75 % de l'épisode 01 » et lui servir directement 05, en sautant les épisodes intermédiaires : quelqu'un qui a reconnu sa douleur n'a pas besoin de la pédagogie, il a besoin de voir le pouce s'arrêter.
> 
> GARDE-FOUS NON NÉGOCIABLES. Aucune créa ne montre de coffre-fort, de liasse de billets ou de transfert d'argent. Aucune ne désigne un coupable : ni beau-frère, ni maçon, ni membre de la famille. La formulation du paiement ne se déforme jamais — « vous ne réglez le prestataire qu'après avoir validé la phase, Locawave ne détient jamais les fonds ». Le registre intime (la peur d'être traité de mbougoul mbook) est réservé aux témoignages à la première personne de la phase recommandation ; aucune accroche de marque ne l'emploie.

### `HERO-01` — Épisode 1 — Le flou. On installe la douleur sans jamais accuser personne : trois photos identiques à trois mois d'écart. L'antagoniste n'est pas le beau-frère, c'est l'absence de date, de phase et de preuve. Aucun logo dans les 3 premières secondes.

**Cible :** Ousmane Diallo, 47 ans, Bergame (Italie), magasinier — diaspora qui fait construire une R+1 à Diamniadio

**Accroche (les 1,5 première seconde) :** « Trois mois. Même photo. »

**Texte de l'annonce**

```
En deux ans, il a envoyé plus de 20 millions FCFA au pays.

Aujourd'hui, il est incapable de dire quel pourcentage de sa maison est réellement fait.

Des photos, il en reçoit. Toujours le même mur. Toujours le même angle. Toujours la même heure. Trois mois d'écart, une seule image.

Le problème n'est pas la personne au bout du fil. Le problème, c'est le flou.

Avec Locawave, un chantier n'est plus un tas d'argent envoyé au hasard : il est découpé en phases. Chaque phase doit être prouvée par des photos et des vidéos datée. Et vous ne réglez cette phase qu'après l'avoir validée — vous ne payez qu'après avoir validé, Locawave ne détient jamais les fonds.

Épisode 1 sur 6 : le flou.
```

**Texte à incruster dans le visuel :** `Trois mois. La même photo.`

**Appel à l'action :** Épisode 2 demain : les fondations. Écrivez « CHANTIER » sur WhatsApp pour ouvrir votre essai gratuit.

**Prompt image — NanoBanana Pro**

```text
Cinematic vertical medium close-up of a 47-year-old West African man with dark skin, short greying beard and tired eyes, wearing a navy blue #1a2744 insulated warehouse jacket with a thin orange #f97316 reflective stripe and a dark knitted cap, sitting alone at 22:00 on a metal bench in the changing room of a cold-storage warehouse in Bergamo Italy, leaning forward and scrolling a messaging thread on his smartphone that clearly displays three nearly identical photographs of the same unfinished grey cinder-block wall stacked vertically with small French date captions '12 mars', '04 mai' and '19 juin' under each one, harsh blue-white fluorescent ceiling light contrasted with the warm orange glow of the phone screen lighting his face from below, shot on a 50mm lens at f/1.8 with shallow depth of field and visible grain, desaturated palette of steel grey, concrete and navy with a single orange accent, bold white French text overlay in a heavy modern sans-serif across the upper third reading "Trois mois. La même photo.", photorealistic observational documentary style, vertical 9:16.
```

**Animation image → vidéo**

Très lent push-in de 4 s sur le visage (échelle 100 % → 108 %) avec un léger parallaxe : le téléphone et la main avancent un peu plus vite que le fond. À 2,5 s, micro-tremblement de caméra tenue à l'épaule. Pas de coupe : fondu au noir de 0,4 s sur la dernière syllabe de la voix off, puis enchaînement direct sur la lumière du jour de l'épisode 2 pour créer un choc de température.

**Voix off / dialogue**

> Vingt millions de francs envoyés. Trois photos du même mur. Le problème, ce n'est pas lui. Le problème, c'est qu'il n'y a ni date, ni phase, ni preuve.

### `HERO-02` — Épisode 2 — La première preuve. On passe du flou à la date : les fondations sont photographiées sur place, datée, rattachées à une phase. Démonstration produit côté terrain, lumineuse, exactement l'inverse visuel de l'épisode 1.

**Cible :** Ousmane Diallo (spectateur) — et par ricochet le chef de chantier / prestataire qui exécute

**Accroche (les 1,5 première seconde) :** « Fondations. Preuve datée. »

**Texte de l'annonce**

```
Jour 1. Les fondations.

Ce n'est plus « je t'envoie une photo quand j'y pense ». C'est une phase du chantier, avec ses preuves attendues, sa date et son heure.

Quatre photos, une courte vidéo, datées à leur dépôt et rattachées à une phase. Le propriétaire les reçoit à Bergame, les regarde le soir même, valide.

La phase « Fondations » passe en payée. Ni avant, ni au téléphone, ni sur promesse.

Et ce n'est pas vous qui réclamez les photos : c'est le système qui les demande, à date fixe, sur tous les chantiers. Celui qui travaille bien n'a plus à se justifier — il est validé par écrit et payé phase après phase.

Épisode 2 sur 6 : la première preuve.
```

**Texte à incruster dans le visuel :** `Fondations — payée.`

**Appel à l'action :** Épisode 3 demain : l'élévation. Essai gratuit — créez votre chantier et sa première phase ce soir.

**Prompt image — NanoBanana Pro**

```text
Wide vertical shot from a slightly low angle of a 30-year-old Senegalese site foreman with dark skin, wearing an orange #f97316 hard hat, a dusty navy blue #1a2744 work shirt with rolled sleeves and jeans, standing on the freshly poured concrete strip foundations of a two-storey R+1 house under construction in Diamniadio Senegal, holding his smartphone up with both hands to photograph the foundation trenches in front of him, red laterite earth, neat stacks of grey cinder blocks, protruding rebar and a wheelbarrow around him, a half-built neighbouring house and a lone acacia on the flat horizon, cloudless pale dry-season sky, warm low golden 7 a.m. side light casting long shadows across the concrete, shot on a 24mm lens with deep focus, palette of laterite orange, ochre dust and navy, the phone screen angled enough toward the camera to reveal a clean mobile app interface with a navy blue header, the French line "Fondations — preuve 2 / 4" in white and a small orange timestamp "07:42 · Diamniadio" below a photo thumbnail, bold orange French text overlay in the lower third reading "Fondations — payée.", photorealistic, vertical 9:16.
```

**Animation image → vidéo**

Départ sur un plan large fixe 1 s, puis lent travelling avant de 3 s combiné à une légère montée verticale (crane-up simulé) jusqu'à cadrer le téléphone en gros plan ; sur les 2 dernières secondes, zoom numérique doux sur l'écran jusqu'à ce que « Fondations — preuve 2 / 4 » soit lisible plein cadre. Transition : coupe franche sur un bruit sec de truelle pour ouvrir l'épisode 3.

**Voix off / dialogue**

> Jour un. Les fondations. Quatre photos, une vidéo, prises sur place, datée. Il les regarde le soir même à Bergame. Il valide. La phase est payée. Pas avant.

### `HERO-03` — Épisode 3 — Le renversement d'objection, vu du côté du prestataire. C'est la créa qui désamorce « mon beau-frère va croire que je me méfie » : ici, celui qui travaille est protégé, validé par écrit et payé plus vite. Point de vue inversé, seul épisode où le propriétaire n'apparaît pas.

**Cible :** Ousmane Diallo (l'objection familiale) + prestataires / chefs de chantier sénégalais

**Accroche (les 1,5 première seconde) :** « Validée. Payée. Vendredi. »

**Texte de l'annonce**

```
Jour 15. L'élévation.

On croit que demander des preuves protège le propriétaire. C'est faux : ça protège d'abord celui qui travaille.

Avant, le maçon appelait, expliquait, attendait. Il avançait de sa poche, il relançait, et le jour où quelqu'un l'accusait à tort, il n'avait rien à montrer.

Maintenant il soumet sa phase avec ses photos. Le propriétaire valide depuis Bergame. Vous réglez la phase par Wave après l'avoir validée — Locawave ne détient jamais les fonds, il ne fait que constater que la preuve est là.

Personne ne se justifie au téléphone. Tout est écrit.

Épisode 3 sur 6 : celui qui travaille est payé plus vite.
```

**Texte à incruster dans le visuel :** `Élévation validée. Phase validée.`

**Appel à l'action :** Épisode 4 demain : le silence. Prestataires vérifiés, propriétaires à distance — écrivez « CHANTIER » sur WhatsApp.

**Prompt image — NanoBanana Pro**

```text
Vertical medium shot of a muscular 42-year-old Senegalese mason with dark skin and cement-dusted forearms, wearing a faded orange #f97316 t-shirt, grey work trousers and a cloth tied around his head, standing on a simple wooden scaffold plank against the half-built cinder-block first floor of an R+1 house in Diamniadio Senegal, pausing with a trowel still in his left hand while he reads his smartphone held in his right hand, fine cement dust floating in the air and catching the light, blue plastic water barrel and a cement mixer visible below, warm late-afternoon sun raking across the rough block wall and throwing his shadow onto it, shot on a 35mm lens at f/2.8, palette of grey block, ochre dust, orange and deep navy shadow, the phone screen clearly readable and showing a navy app card with the French lines "Élévation — validée par le propriétaire" and "Phase validée · 1 250 000 FCFA à régler" with an orange check icon, bold white French text overlay at the top reading "Validée. Payée. Sans discussion.", photorealistic documentary style, vertical 9:16.
```

**Animation image → vidéo**

Plan fixe 1 s sur le maçon qui lit, puis lent pan latéral droite→gauche de 3 s le long du mur d'élévation qui révèle la hauteur atteinte, et retour en zoom serré de 2 s sur l'écran du téléphone jusqu'à « Phase validée · 1 250 000 FCFA à régler ». Sur le dernier tiers, la poussière de ciment est animée en particules lentes. Transition : fondu au noir rapide 0,3 s, coupure totale du son pour ouvrir l'épisode 4 sur le silence.

**Voix off / dialogue**

> On croit que la preuve protège le propriétaire. Elle protège d'abord le maçon. Il soumet sa phase, elle est validée par écrit, il est payé. Plus personne ne se justifie au téléphone.

### `HERO-04` — Épisode 4 — Le silence déclenche l'alerte. Créa signature de la campagne : aucun humain, aucun visage, uniquement l'écran verrouillé. C'est la fonctionnalité la plus démonstrative (« aucune photo depuis 7 jours ») et la plus économique à produire.

**Cible :** Ousmane Diallo (Bergame) et Aminata Sow (Créteil) — tout propriétaire à distance

**Accroche (les 1,5 première seconde) :** « Sept jours. Rien. »

**Texte de l'annonce**

```
Jour 22. Plus rien.

Pas de photo, pas de message, pas de nouvelle du chantier. Avant, ce silence pouvait durer six semaines avant que vous ne le remarquiez — souvent le jour où on vous redemandait de l'argent.

Locawave le remarque au septième jour. Et c'est lui qui vous prévient, pas vous qui appelez.

Trois alertes veillent sur votre chantier : une phase a été soumise, le budget est dépassé, ou aucune photo n'est arrivée depuis 7 jours.

Demander où ça en est n'accuse personne quand c'est le système qui le demande, à date fixe, pour tout le monde.

Épisode 4 sur 6 : le silence a une date.
```

**Texte à incruster dans le visuel :** `Aucune photo de votre chantier depuis 7 jours.`

**Appel à l'action :** Épisode 5 demain : la toiture. Activez l'alerte sur votre chantier — essai gratuit.

**Prompt image — NanoBanana Pro**

```text
Extreme close-up vertical still life of a modern smartphone lying face-up on a worn wooden bedside table in a small apartment in Créteil France at 05:41 in the morning, the locked screen filling most of the frame and glowing in the dark with a deep navy #1a2744 background, showing the large white time "05:41" and the date "jeudi 22" above a single crisp notification card whose small app name reads "Locawave" in orange #f97316 and whose message in bold orange text reads "Aucune photo de votre chantier depuis 7 jours.", a bunch of house keys, a half-full cold glass of water and a folded pair of reading glasses sitting slightly out of focus beside it, thin cold blue dawn light bleeding through the gap of heavy curtains in the background, shot on a 85mm macro lens at f/2.2 with very shallow depth of field and realistic screen reflections on the glass, palette almost entirely navy blue and black with the orange text as the only colour, photorealistic, vertical 9:16.
```

**Animation image → vidéo**

Écran d'abord noir 0,8 s en silence total, puis l'écran s'allume (montée de luminosité sur 0,3 s) et la notification glisse du haut vers sa position en 0,4 s avec une vibration légère du téléphone sur le bois. Ensuite push-in très lent de 3 s sur la notification jusqu'à ce que la phrase remplisse le cadre, un léger flou de mise au point qui se corrige. Durée totale 6 s. Transition : coupe sèche sur le plan de l'épisode 5 (main et pouce), aucun son ajouté sauf la vibration.

**Voix off / dialogue**

> Aucune voix off. Silence total pendant six secondes, puis une seule vibration. C'est le vide qui doit être entendu. Sous-titre incrusté uniquement.

### `HERO-05` — Épisode 5 — Le climax : le pouce suspendu au-dessus du bouton orange, la toiture visiblement inachevée sur la photo de preuve. C'est la créa qui porte l'accroche signature et le mécanisme de validation avant paiement, formulé exactement comme il est juridiquement vrai.

**Cible :** Ousmane Diallo, 47 ans, Bergame — décision de paiement d'une phase à fort montant

**Accroche (les 1,5 première seconde) :** « Le pouce s'arrête. »

**Texte de l'annonce**

```
Jour 30. La toiture.

On lui demande de payer la toiture. Il ouvre l'application, il regarde les preuves de la phase. La charpente est posée. La couverture, non.

Alors il ne valide pas. Et parce qu'il ne valide pas, rien ne part.

À retenir, mot pour mot : vous ne réglez le prestataire qu'après avoir validé la phase. Locawave ne détient jamais les fonds. Il constate la preuve, il déclenche votre validation, c'est tout.

Dix jours plus tard, les tuiles sont posées, les photos arrivent, il valide. La toiture est payée le jour où elle existe.

Ce n'est pas de la méfiance. C'est de la clarté.

Épisode 5 sur 6 : la toiture n'est pas finie, vous ne payez pas la toiture.
```

**Texte à incruster dans le visuel :** `Toiture — en attente de votre validation`

**Appel à l'action :** Épisode 6 demain : le retour au pays. Ouvrez votre chantier gratuitement — écrivez « CHANTIER » sur WhatsApp.

**Prompt image — NanoBanana Pro**

```text
Tight vertical over-the-shoulder macro shot of the calloused dark-skinned thumb of a middle-aged West African man hovering one centimetre above and deliberately not touching a large rounded orange #f97316 button on a smartphone screen held in his other hand, the screen sharply readable and showing a navy #1a2744 vertical phase timeline in French with the lines "Fondations — payée" and "Élévation — payée" each with a small orange check, then a highlighted row "Toiture — en attente de votre validation" above a photo thumbnail of a bare wooden roof frame with no tiles on it against a Senegalese sky, the blurred background showing the modest tiled kitchen of an apartment in Bergamo Italy at night with a cold cup of coffee and a set of work gloves on the table, single warm lamp overhead plus the orange bounce of the screen on his skin, shot on a 100mm macro lens at f/2.8 with extremely shallow depth of field, palette of navy, warm skin tones and one saturated orange, bold white French text overlay across the top reading "La toiture n'est pas finie.", photorealistic, vertical 9:16.
```

**Animation image → vidéo**

Le pouce descend de 2 cm puis s'arrête net et remonte légèrement, en 1,5 s — c'est le geste qui raconte tout, à animer en priorité. Ensuite plan tenu quasi fixe 2 s avec seule la respiration de la main, puis zoom lent de 2,5 s sur la vignette photo de la charpente sans tuiles. Le texte incrusté « La toiture n'est pas finie. » apparaît en fondu 0,3 s au moment exact où le pouce s'arrête. Transition : fondu enchaîné lumineux vers le plein soleil de l'épisode 6.

**Voix off / dialogue**

> On lui demande de payer la toiture. La charpente est posée. La couverture, non. Il ne valide pas. L'argent reste chez le propriétaire. Dix jours plus tard, les tuiles sont là. Il valide. La toiture est payée le jour où elle existe.

### `HERO-06` — Épisode 6 — La résolution, en horizontal 16:9 : c'est le plan de fin du montage long de 60-90 s. Le récapitulatif complet des phases validées, la maison réelle derrière, et l'accroche signature. Seule créa où l'on voit le résultat et où la marque s'affiche pleinement.

**Cible :** Ousmane Diallo — et toute la diaspora sénégalaise d'Italie, de France, d'Espagne et des États-Unis

**Accroche (les 1,5 première seconde) :** « La maison existe. »

**Texte de l'annonce**

```
Jour 45 — il rentre.

Deux ans plus tôt, il envoyait de l'argent et recevait des photos qui se ressemblaient toutes. Cette fois, il connaissait la maison avant de la voir : quatre phases, quatre séries de preuves datée, quatre validations depuis son téléphone à Bergame.

Fondations — payée. Élévation — payée. Toiture — payée. Finitions — payée.

Aucune phase réglée sans preuve. Aucun franc parti sans qu'il ait vu pourquoi.

Et ce principe ne s'arrête pas au chantier : quand le bien se loue, c'est la même règle. Quittance PDF automatique, relances J+3, J+7 et J+15, score de ponctualité du locataire, tableau de bord de ce qui est encaissé, en attente ou en retard.

Le prix, lui, ne dépend pas de votre loyer : Solo 10 000 FCFA par mois, Pro 20 000 FCFA, Agence 45 000 FCFA, et 5 % uniquement sur les travaux et chantiers. Essai gratuit.

Épisode 6 sur 6. Ne payez que ce que vous avez vu.
```

**Texte à incruster dans le visuel :** `Ne payez que ce que vous avez vu.`

**Appel à l'action :** Commencez votre chantier aujourd'hui, gratuitement. Écrivez « CHANTIER » sur WhatsApp et créez votre première phase en 10 minutes.

**Prompt image — NanoBanana Pro**

```text
Cinematic horizontal wide shot of a 47-year-old Senegalese man with dark skin and a short greying beard, wearing a freshly ironed pale blue boubou, standing relaxed and slightly off-centre in the sandy courtyard of his newly completed two-storey R+1 house in Diamniadio Senegal, the finished ochre-rendered facade with navy blue #1a2744 window frames, a low wall and a magenta bougainvillea rising behind him, a yellow-and-black Dakar taxi just visible through the open gate at the far right, he is looking up at the roof with his smartphone held at chest height and turned slightly toward the camera showing a navy app screen with an orange progress bar at 100 percent and four French lines "Fondations — payée", "Élévation — payée", "Toiture — payée", "Finitions — payée" each with an orange check mark, warm late-afternoon golden light with long soft shadows across the sand and a cloudless dry-season sky, shot on a 35mm lens at f/4 with natural anamorphic-style framing and generous headroom, palette of ochre, sand, magenta, navy and orange, bold white French text overlay in the lower left third reading "Ne payez que ce que vous avez vu.", photorealistic, horizontal 16:9.
```

**Animation image → vidéo**

Ouverture sur un très lent travelling arrière de 5 s : on part du téléphone en gros plan (frise des quatre phases validées lisible) et on recule jusqu'au plan large qui révèle la maison entière — c'est l'inverse exact du mouvement de l'épisode 2, ce qui referme la boucle. Puis 3 s de plan large tenu, avec un léger mouvement des bougainvilliers et de la poussière en suspension. Le texte « Ne payez que ce que vous avez vu. » apparaît en fondu sur la 7e seconde, suivi du logo Locawave 1,5 s sur fond bleu marine. Durée totale 10 s, plan final du montage long.

**Voix off / dialogue**

> Il n'a pas découvert sa maison en arrivant. Il la connaissait déjà : quatre phases, quatre séries de preuves, quatre validations depuis son téléphone. Locawave. Ne payez que ce que vous avez vu.

---

## Facebook — campagne diaspora (France, Italie, Espagne, USA)

> **Note stratégique.** Six créations, six angles réellement différents, tous articulés sur une seule mécanique : la preuve d'abord, l'argent ensuite. Règles tenues dans chaque créa : l'antagoniste est toujours le flou, jamais une personne ; aucun membre de la famille n'est montré en fautif (FB-02 fait même du beau-frère le bénéficiaire du système) ; jamais de coffre-fort, de liasse de billets ni de formule laissant croire que Locawave détient les fonds — la phrase juridiquement exacte « vous ne réglez le prestataire qu'après avoir validé la phase » est reprise à l'identique dans les six textes. Répartition des formats : trois carrés 1:1 pour le feed (FB-01, FB-03, FB-05) et trois verticaux 9:16 pour les Reels (FB-02, FB-04, FB-06). Répartition des cibles : quatre créas chantier (FB-01, FB-02, FB-03, FB-05) qui portent le panier élevé et la commission de 5 %, et deux créas de respiration — FB-04 sur l'alerte produit, la meilleure démonstration disponible, et FB-06 sur la bailleuse diaspora, seule créa féminine et seule créa locative, indispensable pour ne pas réduire la diaspora aux hommes qui construisent. À tester par paires : FB-01 contre FB-03 (douleur constatée à distance contre douleur constatée sur place), FB-05 contre FB-04 (démonstration du paiement contre démonstration de l'alerte). Ne jamais mélanger cette campagne diaspora avec la campagne Sénégal résident dans le même ensemble publicitaire : ce sont deux économies et deux coûts par conversation totalement différents. Destination recommandée : click-to-WhatsApp, et mesure sur le coût par conversation ouverte, pas sur le clic. Un mot de vigilance : le registre « mbougoul mbook » et la peur d'être traité d'ingrat n'apparaissent dans aucune accroche de marque — ils sont réservés aux témoignages à la première personne de l'étape 5 du tunnel.

### `FBD-01` — La maison qu'on construit depuis l'étranger — les mêmes photos, sous le même angle, à trois mois d'écart. La douleur constatée à distance, sans accuser personne.

**Cible :** Ousmane Diallo, 47 ans, Bergame (Italie), magasinier — construit une R+1 à Diamniadio depuis deux ans

**Accroche (les 1,5 première seconde) :** « Trois mois. Identique. »

**Texte de l'annonce**

```
Trois mois. La même photo, sous le même angle.

Vous avez envoyé 1 200 000 FCFA pour l'élévation. Vous recevez une image qui ressemble trait pour trait à celle d'avril. Et vous n'osez pas insister, parce qu'insister, chez nous, ça coûte plus cher que l'argent.

Locawave change l'ordre des choses. Votre chantier est découpé en phases. Chaque phase doit être prouvée par des photos et des vidéos datée, prises sur place. Vous ne réglez cette phase qu'après l'avoir validée, depuis votre téléphone, à Bergame comme à Barcelone.

Locawave ne détient jamais votre argent : vous ne le versez qu'après avoir validé la phase.

Ce n'est pas de la méfiance. C'est de la clarté.
Essai gratuit, rien à installer.
```

**Texte à incruster dans le visuel :** `Trois mois. La même photo.`

**Appel à l'action :** Envoyez-nous un message sur WhatsApp

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic editorial medium close-up of a 47-year-old West African Senegalese man with a short greying beard and tired but dignified eyes, wearing a navy blue #1a2744 zipped fleece work jacket over a grey t-shirt, sitting alone at a small kitchen table in a modest apartment in Bergamo Italy at 23h, holding his smartphone up and slightly angled so the screen is fully readable to the camera, the screen showing a clean mobile app interface with two stacked photographs of the exact same unfinished cement-block R+1 house shot from the exact same angle in the same harsh midday light, the top one labelled in French "12 avril" and the bottom one labelled "14 juillet", and below them a bright orange #f97316 banner with white text reading "Aucune photo nouvelle depuis 94 jours", cold blue night light from the window falling on one side of his face and the warm orange glow of the phone lighting the other, shot on a 50mm lens at f/2 with shallow depth of field and a muted navy-and-grey palette broken only by the orange of the screen, large bold clean white sans-serif French headline across the top of the frame reading "Trois mois. La même photo.", square 1:1.
```

**Animation image → vidéo**

6 secondes. Départ sur un plan très légèrement plus large, slow push-in continu vers l'écran du téléphone (échelle 1,0 à 1,12), puis à la seconde 3 un micro-zoom supplémentaire cadré uniquement sur les deux dates « 12 avril » et « 14 juillet » qui restent lisibles 1,5 seconde. Léger effet de parallaxe sur l'arrière-plan de la cuisine pour donner du volume. Aucun mouvement sur le visage, il doit rester immobile et digne. Transition vers le plan suivant : fondu au bleu marine #1a2744 de 0,4 seconde, sur lequel s'écrit en orange « Ne payez que ce que vous avez vu. »

**Voix off / dialogue**

> Aucune voix off. Sous-titre unique qui apparaît à la fin : « Ne payez que ce que vous avez vu. » La créa doit fonctionner à 100 % sans son.

### `FBD-02` — Le frère, le cousin, l'homme de confiance — retournement complet : le système ne le surveille pas, il le décharge et le fait payer plus vite. Répond frontalement à l'objection numéro un.

**Cible :** Ousmane Diallo (Bergame) et tout diaspora qui a confié son chantier à un proche — créa pensée pour lever la peur de « casser la famille »

**Accroche (les 1,5 première seconde) :** « Demander des photos »

**Texte de l'annonce**

```
Demander des photos, ce n'est accuser personne.

Votre cousin, votre beau-frère, l'homme qui suit le chantier pour vous : aujourd'hui, c'est lui qui doit se justifier au téléphone, de mémoire, sans preuve, chaque fois que quelqu'un dans la famille pose une question.

Avec Locawave, ce n'est plus vous qui réclamez. C'est le système qui demande les photos, à date fixe, à tous les chantiers. Il dépose ses preuves, vous validez depuis l'étranger, la phase est payée. Sans discussion, sans coup de fil pénible, plus vite qu'avant.

Le jour où quelqu'un l'accusera à tort, il aura un dossier daté qui parle pour lui.

Locawave ne détient jamais les fonds : vous ne payez qu'après avoir validé jusqu'à votre validation.

Ce n'est pas de la méfiance. C'est de la clarté.
```

**Texte à incruster dans le visuel :** `"Phase Élévation — validée. Phase validée."`

**Appel à l'action :** Découvrir le suivi de chantier

**Prompt image — NanoBanana Pro**

```text
Vertical 9:16 photorealistic documentary portrait, low three-quarter angle, of a 35-year-old Senegalese site foreman with dark skin, a short beard and a genuinely relieved half-smile, wearing an orange #f97316 hard hat, a dusty navy blue #1a2744 work shirt with rolled sleeves and cement dust on his forearms, standing in the middle of an unfinished R+1 concrete-block house under construction in Diamniadio with exposed rebar columns, wooden scaffolding and stacked cement blocks behind him, looking down at the smartphone in his hand whose screen is clearly readable and shows a mobile app with a vertical phase timeline in French reading "Fondations — payée", "Élévation — validée par le propriétaire", "Toiture — à venir" with a green check beside the second line and the amount "1 450 000 FCFA · phase validée, à régler" underneath, late afternoon dry-season sunlight raking across the site with warm golden dust in the air and a pale blue Sahel sky, shot on a 35mm lens at f/2.8, palette of ochre dust, navy and orange, bold white French text in the lower third reading "Il n'a plus à se justifier. Son travail est validé par écrit.", vertical 9:16.
```

**Animation image → vidéo**

8 secondes. Seconde 0 à 3 : parallaxe latérale lente vers la droite sur le chantier, le premier plan (blocs de ciment) se déplace plus vite que l'arrière-plan, le personnage reste au centre. Seconde 3 à 5,5 : zoom progressif sur l'écran du téléphone jusqu'à ce que la ligne « Élévation — validée par le propriétaire » occupe le tiers de l'image, la coche verte apparaît en pop léger à la seconde 4. Seconde 5,5 à 8 : retour arrière lent (pull-out) jusqu'au plan d'origine pendant que le texte du tiers inférieur s'écrit. Transition : coupe franche sur carton bleu marine #1a2744 avec la mention orange « Essai gratuit ».

**Voix off / dialogue**

> Voix off masculine française posée, chaleureuse, sans musique dramatique : « Ce n'est pas lui qu'on vérifie. C'est le travail qu'on prouve. Il dépose les photos, vous validez depuis l'étranger, la phase est payée. Locawave. La preuve d'abord, l'argent ensuite. »

### `FBD-03` — Le retour au pays et la déception — l'écart entre ce qu'on a payé et ce qu'on trouve. Angle du constat sur place, digne, sans colère ni coupable à l'écran.

**Cible :** Diaspora France/Italie/Espagne/USA qui rentre une fois tous les deux ans et découvre l'état réel de son chantier

**Accroche (les 1,5 première seconde) :** « Vous rentrez. Enfin. »

**Texte de l'annonce**

```
Vous avez pris deux semaines de congés, un billet à 480 000 FCFA, et vous êtes venu voir votre maison.

Elle n'est pas là où vous la croyiez.

Ça n'arrive pas parce que les gens sont malhonnêtes. Ça arrive parce que pendant deux ans, l'information a circulé par appels et par photos envoyées à la va-vite, sans dates, sans montants, sans rien d'écrit. Et personne, ni vous ni celui qui suit le chantier, n'a jamais eu la vraie image.

Locawave donne cette image, chaque semaine, sans que vous ayez à demander : phase par phase, photos et vidéos datées et rattachées à une phase, budget dépensé, budget restant. Et vous ne réglez une phase qu'après avoir validé ses preuves — vous ne payez qu'après avoir validé jusque-là.

Le prochain voyage, vous saurez exactement ce qui vous attend avant de monter dans l'avion.

Essai gratuit.
```

**Texte à incruster dans le visuel :** `Vous saviez qu'elle en était là ?`

**Appel à l'action :** Créer mon chantier

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic wide editorial shot from behind of a 50-year-old Senegalese man seen from the back, wearing a light blue short-sleeved shirt and dark trousers, one hand still holding the handle of a large travel suitcase covered in airline stickers, standing motionless in the red sandy courtyard of an unfinished house in Diamniadio, facing a bare grey cement-block structure with no roof, empty window openings, rusting rebar sticking out of the top of the columns and a lone bougainvillea growing against the wall, harsh white late-morning dry-season light casting a hard short shadow, distant Sahel horizon with a yellow-and-black taxi passing on the sand track, shot on a 35mm lens at f/5.6 with deep focus, dusty ochre and pale blue palette, a clean navy blue #1a2744 rectangular caption bar across the lower quarter of the image containing white French text "Vous saviez qu'elle en était là ?" with a small orange #f97316 underline beneath it, no faces visible, square 1:1.
```

**Animation image → vidéo**

7 secondes. Seconde 0 à 4 : push-in très lent et régulier vers la maison inachevée, l'homme et la valise restent fixes au premier plan, effet de parallaxe léger entre le sujet et la construction. Seconde 4 à 5 : arrêt net du mouvement, l'image se fige une seconde entière — le silence visuel est l'effet. Seconde 5 à 7 : la barre de légende bleu marine monte depuis le bas et le texte s'écrit. Transition : fondu au blanc de 0,3 seconde vers le plan démonstration produit (frise de phases de FB-05).

**Voix off / dialogue**

> Aucune voix off, aucune musique triste. Un seul son d'ambiance : vent et tôle. Texte final à l'écran : « La prochaine fois, vous saurez avant de monter dans l'avion. »

### `FBD-04` — La preuve en photo — l'alerte « aucune photo depuis 7 jours ». Démonstration produit pure, zéro émotion narrative : c'est le chantier qui vous prévient, vous n'appelez plus.

**Cible :** Diaspora Europe/USA, propriétaire d'un chantier en cours, qui passe ses dimanches soirs à réclamer des nouvelles

**Accroche (les 1,5 première seconde) :** « Aucune photo depuis... »

**Texte de l'annonce**

```
Vous n'avez plus besoin d'appeler pour savoir où ça en est.

Locawave surveille le silence. Trois alertes arrivent directement sur votre téléphone, en France, en Italie, en Espagne ou aux États-Unis :

— « Une phase vient d'être soumise, vos preuves sont disponibles »
— « Le budget de cette phase est dépassé »
— « Aucune photo de votre chantier depuis 7 jours »

Cette dernière est celle qui change tout. Parce que le vrai problème, ce n'est pas qu'on vous mente : c'est que pendant six semaines, personne ne vous dit rien, et que vous n'osez pas relancer.

Maintenant, c'est le chantier qui vous envoie des nouvelles. Chaque semaine.

Essai gratuit, rien à installer.
```

**Texte à incruster dans le visuel :** `Aucune photo de votre chantier depuis 7 jours.`

**Appel à l'action :** Activer les alertes chantier

**Prompt image — NanoBanana Pro**

```text
Vertical 9:16 photorealistic close-up of a modern smartphone lying screen-up on a dark wooden table beside a set of keys and a cooling cup of café touba, the phone showing a locked screen with a deep navy blue #1a2744 wallpaper and one single push notification card, the notification clearly legible in French with a small orange #f97316 app icon, the app name "Locawave" in small grey letters, the title in bold white "Aucune photo de votre chantier depuis 7 jours." and the subtitle in lighter grey "Chantier Diamniadio · Phase Toiture · dernier dépôt le 12 juillet", the time "21:47" displayed large above it, the room around the phone almost entirely dark so the screen is the only light source and it throws a soft orange-blue glow onto the wood grain and the rim of the cup, shot from a slightly high angle on a 50mm macro lens at f/2.8 with the phone screen tack sharp and the table edges falling out of focus, palette limited to navy, orange and warm brown, vertical 9:16 with generous dark space above and below the phone.
```

**Animation image → vidéo**

6 secondes. Seconde 0 : écran noir, table à peine visible. Seconde 0,5 : l'écran du téléphone s'allume d'un coup et la notification glisse depuis le haut avec un rebond très court, la lumière orange-bleue envahit la table au même instant. Seconde 1 à 4 : push-in lent et régulier vers la notification jusqu'à ce qu'elle occupe les deux tiers de la hauteur, texte parfaitement lisible. Seconde 4 à 6 : léger recul et la ligne « Chantier Diamniadio · Phase Toiture » se surligne en orange. Transition : l'écran s'éteint en fondu de 0,3 seconde, puis logo Locawave orange sur fond bleu marine.

**Voix off / dialogue**

> Voix off féminine française, calme et neutre, sans emphase : « Sept jours sans une photo. Vous n'avez rien demandé. C'est le chantier qui vous prévient. Locawave. »

### `FBD-05` — Le paiement par étape validée — la démonstration frontale de la mécanique : la frise de phases et le pouce suspendu au-dessus du bouton. C'est la créa de considération, celle qui explique le produit en trois secondes.

**Cible :** Diaspora sur le point de payer une grosse phase (toiture, dalle, menuiseries) sans preuve — panier élevé, commission 5 %

**Accroche (les 1,5 première seconde) :** « La toiture ? Non. »

**Texte de l'annonce**

```
La toiture n'est pas finie. Vous ne payez pas la toiture.

Voilà à quoi ressemble votre chantier dans Locawave :

Fondations — payée
Élévation — payée
Toiture — en attente de votre validation

Tant que vous n'avez pas ouvert les photos et les vidéos de la toiture, tant que vous n'avez pas appuyé sur ce bouton, la phase n'est pas réglée. Et ce n'est pas Locawave qui garde l'argent — nous ne détenons jamais les fonds : vous ne les versez qu'après votre validation.

Vous êtes à Créteil, à Bergame, à Barcelone ou à New York. Vous voyez la toiture à l'écran avant de payer la toiture.

La preuve d'abord. L'argent ensuite.
Essai gratuit · commission de 5 % uniquement sur les travaux.
```

**Texte à incruster dans le visuel :** `Toiture — en attente de votre validation`

**Appel à l'action :** Voir la démonstration sur WhatsApp

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic close-up product shot of a dark-skinned West African man's hand and thumb hovering two centimetres above a smartphone screen without touching it, the phone held in the other hand against a plain deep navy blue #1a2744 background, the screen filling most of the frame and showing a crisp mobile app interface in French with a vertical phase timeline: "Fondations — payée · 3 200 000 FCFA" with a green check, "Élévation — payée · 4 750 000 FCFA" with a green check, and "Toiture — en attente de votre validation · 2 900 000 FCFA" highlighted in orange #f97316, above the timeline a small grid of four thumbnail photographs of a real Senegalese construction site showing fresh roof timbers and corrugated sheets, and at the bottom a wide orange #f97316 button with white text reading "Valider cette phase", crisp studio lighting with a soft highlight along the phone edge and the orange screen glow reflecting on the fingertips, shot on a 85mm lens at f/4, high contrast navy and orange palette, no other text in the frame, square 1:1.
```

**Animation image → vidéo**

5 secondes, la plus courte de la série, pensée pour la rétention à 3 secondes. Seconde 0 à 1,5 : zoom serré sur la ligne « Fondations — payée », puis pan vertical descendant le long de la frise, une ligne par demi-seconde. Seconde 2 : arrêt sur « Toiture — en attente de votre validation », la ligne pulse une fois en orange. Seconde 2,5 à 4 : le cadre s'élargit pour révéler le pouce suspendu au-dessus du bouton, qui reste immobile — il ne touche jamais l'écran, c'est tout le message. Seconde 4 à 5 : le texte « Ne payez que ce que vous avez vu. » s'écrit en blanc sur le fond bleu marine à droite du téléphone. Transition : coupe franche.

**Voix off / dialogue**

> Voix off masculine française, très courte, une phrase par plan : « Fondations, payée. Élévation, payée. Toiture… vous ne l'avez pas encore vue. Alors elle n'est pas payée. »

### `FBD-06` — La diaspora qui ne construit pas mais qui loue — la bailleuse à distance, l'héritage familial, la quittance PDF et la trace écrite. Seule créa féminine, seule créa locative, indispensable pour ne pas réduire la diaspora aux hommes qui bâtissent.

**Cible :** Aminata Sow, 38 ans, Créteil (France), aide-soignante — deux appartements hérités à Grand Yoff, loyers 175 000 et 220 000 FCFA

**Accroche (les 1,5 première seconde) :** « Il a payé ? »

**Texte de l'annonce**

```
« Il a payé ce mois-ci ? » — « Je crois. »

Vous gérez deux appartements à Grand Yoff depuis Créteil, entre deux gardes. Personne n'a de bail écrit. Les mois se mélangent. Votre mère encaisse parfois en espèces et n'aime pas insister. Et le jour où le locataire dit qu'il a payé, vous n'avez rien à opposer.

Avec Locawave : quittance PDF automatique à chaque loyer reçu, rappels envoyés sur WhatsApp à sa place, relances progressives au 3, au 7 et au 15 — et les bons payeurs, eux, ne sont jamais harcelés. Score de ponctualité de 0 à 100 calculé sur l'historique réel. Alerte de fin de bail à 90, 60 et 30 jours, pour ne plus laisser un logement vide trois mois.

Votre locataire n'a rien à installer : c'est vous qui l'invitez, il reçoit tout sur WhatsApp. Votre mère non plus : elle envoie le reçu Wave, l'application le lit toute seule.

10 000 FCFA par mois. Le même prix que vos loyers soient de 90 000 ou de 400 000 FCFA. Une agence, elle, prend un pourcentage tous les mois.

Le prix ne dépend pas de votre loyer.
Essai gratuit — votre première quittance peut partir ce soir.
```

**Texte à incruster dans le visuel :** `Loyer juillet · 220 000 FCFA · reçu`

**Appel à l'action :** Essayer gratuitement

**Prompt image — NanoBanana Pro**

```text
Vertical 9:16 photorealistic intimate shot of a 38-year-old Senegalese woman with dark skin, short braided hair pulled back and a calm relieved expression, still wearing a pale blue healthcare tunic after a night shift, sitting on the edge of a sofa in a small apartment in Créteil France at dawn with grey-blue window light on her face, holding her smartphone in both hands with the screen angled toward the camera and fully readable, the screen showing a clean French mobile app dashboard titled "Grand Yoff · Appartement 2" with a green line reading "Loyer juillet · 220 000 FCFA · reçu le 3 juillet", below it a document card labelled "Quittance_juillet.pdf" with a small orange #f97316 download icon, and at the bottom a progress bar labelled "Score de ponctualité : 94 / 100", a folded navy blue #1a2744 blanket beside her and a framed family photo from Dakar on the shelf behind, shot on a 50mm lens at f/2 with soft natural light and a muted blue-grey palette warmed only by the orange accents of the screen, bold white French text in the upper third reading "Elle dort. La quittance est déjà partie.", vertical 9:16.
```

**Animation image → vidéo**

9 secondes. Seconde 0 à 3 : plan large fixe avec un très léger flottement de caméra à la main, la lumière de l'aube monte progressivement sur son visage (rampe de luminosité de +15 %). Seconde 3 à 6 : push-in vers l'écran du téléphone, la ligne « Loyer juillet · 220 000 FCFA · reçu » se surligne en vert à la seconde 4, la carte « Quittance_juillet.pdf » glisse vers le haut à la seconde 5. Seconde 6 à 7,5 : zoom sur la barre « Score de ponctualité : 94 / 100 » qui se remplit en animation. Seconde 7,5 à 9 : pull-out vers le plan large et apparition du carton final. Transition : fondu vers fond bleu marine #1a2744 avec en orange « 10 000 FCFA/mois · Essai gratuit ».

**Voix off / dialogue**

> Voix off féminine française, douce, rythme lent : « Vous rentrez de garde à six heures. Le loyer est tombé à trois heures. La quittance est partie toute seule. Vous n'avez couru derrière personne. Locawave. Dix mille francs par mois, quel que soit votre loyer. »

---

## Facebook — feed (publications organiques et publicités image), cible propriétaires bailleurs résidant au Sénégal, 35-60 ans

> **Note stratégique.** Logique des six créas : elles couvrent deux économies différentes chez le même propriétaire résident — le locatif quotidien (FB-01, FB-02, FB-03, FB-06) et le chantier (FB-05) — plus l'argument de prix (FB-04) qui sert d'arme de closing en retargeting. Ne pas les lancer dans un même ensemble publicitaire : mettre FB-01, FB-02 et FB-05 en acquisition froide (objectif notoriété/trafic, budget faible, 30 jours de test pour construire VOTRE référence de CPM et de coût par conversation WhatsApp — aucun benchmark public fiable n'existe pour le Sénégal), puis FB-03, FB-04 et FB-06 en retargeting des personnes ayant regardé plus de 50 % de la vidéo ou cliqué. Destination par défaut : Click-to-WhatsApp, pas un formulaire — cette audience répond sur WhatsApp, pas par email. Optimiser sur la conversation ouverte, jamais sur les likes.
> 
> Points de vigilance juridiques et de marque, à ne pas déformer en production :
> 1. FB-01 est écrit à la première personne. Tel quel, c'est un SCRIPT, pas un témoignage authentique. Meta et le droit de la publicité interdisent de faire passer un texte inventé pour la parole d'un client réel. Deux options propres : (a) le tourner avec un vrai abonné qui reprend ses propres mots à partir de cette structure — c'est de loin le plus performant, et le persona Cheikh Mbaye existe très probablement déjà dans votre base ; (b) le publier tel quel mais à la deuxième personne, en supprimant les guillemets et le format témoignage. Ne pas publier un faux client avec un visage généré et un prénom inventé présenté comme réel.
> 2. Paiement : la seule formulation autorisée est « vous ne réglez le prestataire qu'après avoir validé la phase — Locawave ne détient jamais les fonds ». Jamais « nous gardons votre argent », jamais de coffre-fort, de cadenas sur des billets ni de pile de FCFA en visuel. C'est repris tel quel dans FB-05.
> 3. Aucune fonctionnalité inventée : tout ce qui est cité (quittance PDF, relances J+3/J+7/J+15, rappel intelligent, score de ponctualité, alertes fin de bail 90/60/30, alertes chantier, OCR Wave/OM, tableau de bord, rapport hebdomadaire, KYC, médiation) est dans le périmètre livré. Les chiffres affichés à l'écran (745 000 FCFA, 92 %, 96/100, 220 000 FCFA) sont des exemples d'interface, pas des résultats promis à l'annonceur — ne pas les transformer en promesse du type « augmentez votre recouvrement de 92 % ».
> 4. L'antagoniste est toujours le flou, jamais une personne. Aucune créa ne montre un maçon, un locataire ou un parent en position de coupable. FB-05 va jusqu'à retourner l'argument au bénéfice du chef de chantier — c'est ce qui désamorce l'objection « je vais vexer mon homme de confiance », et c'est aussi ce qui rend l'annonce partageable sans honte.
> 5. Production images : NanoBanana Pro rend bien le texte mais dérape sur les longues chaînes. Générer chaque prompt 3 à 4 fois et ne garder que la version où les montants en FCFA et les accents français sont exacts ; vérifier systématiquement « Encaissé », « En retard », « Ponctualité », et l'espace comme séparateur de milliers (220 000 FCFA, jamais 220,000). Si une incrustation ressort fautive, régénérer sans le texte et l'ajouter au montage.
> 6. Ratio texte/image de Meta : les bandeaux de FB-04 et les titres incrustés doivent rester sous environ 20 % de la surface, sinon la diffusion est bridée. Prévoir aussi une version 4:5 de FB-01, FB-03 et FB-06 : c'est le format qui occupe le plus de hauteur dans le fil mobile, où se trouve la quasi-totalité de cette audience.
> 7. Premier paragraphe : chaque texte tient son argument dans les 120 premiers caractères, avant le « Voir plus ». Ne pas ajouter d'emoji ni de ligne d'accroche générique avant — cela repousserait l'argument sous la troncature.

### `FB-01` — Témoignage — le bailleur résident qui abandonne son carnet manuscrit

**Cible :** Cheikh Mbaye, 58 ans, Sacré-Cœur Dakar, six logements aux Parcelles Assainies et à Liberté 6, carnet manuscrit depuis quinze ans

**Accroche (les 1,5 première seconde) :** « Mon carnet ne relançait personne. »

**Texte de l'annonce**

```
Mon carnet ne relançait personne. Moi non plus, franchement.

Six logements aux Parcelles et à Liberté 6. Quinze ans de quittances écrites à la main. Trois locataires toujours en retard, deux toujours à l'heure — et je les appelais tous de la même façon. Les meilleurs finissaient par mal le prendre.

Depuis que je suis passé sur Locawave :
• les rappels partent tout seuls sur WhatsApp, le 3, le 7 et le 15
• ceux qui paient à l'heure ne sont plus dérangés
• je photographie le reçu Wave, la quittance PDF sort toute seule
• en un écran je vois ce que j'ai encaissé, ce qui est en attente, ce qui est en retard

Je n'ai rien installé. C'est une application web : elle s'ouvre dans le téléphone comme Facebook.

Solo 10 000 FCFA/mois, quel que soit le montant de vos loyers. Essai gratuit.
Écrivez-nous sur WhatsApp, on ajoute votre premier bien avec vous.
```

**Texte à incruster dans le visuel :** `« Mon carnet ne relançait personne. »`

**Appel à l'action :** Envoyer un message

**Prompt image — NanoBanana Pro**

```text
Documentary-style medium close-up portrait, square 1:1, of a 58-year-old West African Senegalese landlord with a short grey beard and reading glasses pushed up on his forehead, wearing a pale blue embroidered boubou, sitting on a moulded plastic chair in the shaded courtyard of a Dakar family house, a worn handwritten rent ledger closed on his knee held together by a rubber band while his right hand holds a modern Android smartphone turned slightly toward the camera, the phone screen crisply readable showing the Locawave dashboard on a deep navy #1a2744 background with orange #f97316 accents and the French lines "Encaissé 745 000 FCFA", "En attente 90 000 FCFA", "En retard 0 FCFA", "Taux de recouvrement 92 %", warm late-afternoon dry-season light filtering through magenta bougainvillea and a whitewashed wall behind him, shot on a 50mm lens at f/2 with shallow depth of field and true rich dark skin tones, colour palette anchored on navy blue and orange with the boubou and the sky in cool tones, clean bold white French text overlaid in the upper-left third reading "Mon carnet ne relançait personne." and a small orange rounded badge in the lower-right reading "Locawave", square 1:1 format, photorealistic, no logo watermark, no European or American décor.
```

**Animation image → vidéo**

0 s à 3 s : très lent push-in de la caméra vers le visage (échelle 100 % → 108 %), grain fin, léger flottement de la lumière dans le bougainvillier. 3 s à 6 s : zoom secondaire recadré sur l'écran du téléphone (crop 45 %) avec apparition en fondu des chiffres du tableau de bord ligne par ligne, 0,3 s d'écart. 6 s à 8 s : retour large en dézoom doux et apparition du texte incrusté par fondu montant. Transition sortie : coupe franche sur fond bleu marine avec le logo.

**Voix off / dialogue**

> Voix off masculine, français teinté de wolof, calme : « Quinze ans de carnet. Et le 5 du mois, c'est moi qui appelais. Maintenant, c'est l'application qui relance — et ceux qui paient à l'heure, on les laisse tranquilles. »

### `FB-02` — Avant / après — la quittance manuscrite contre la quittance PDF

**Cible :** Aminata Sow, 38 ans, gère deux appartements à Grand Yoff sans aucun écrit, et tout bailleur qui écrit encore ses quittances à la main

**Accroche (les 1,5 première seconde) :** « Écrite à la main. »

**Texte de l'annonce**

```
Écrite à la main, une quittance ne prouve rien le jour du désaccord.

À gauche : le carnet. L'encre bave, la page se déchire, et personne ne retrouve le mois de février.
À droite : Locawave. Une quittance PDF datée, envoyée au locataire, conservée dans l'application.

Ce qui change vraiment :
• quittance PDF automatique à chaque loyer encaissé
• historique complet, mois par mois, locataire par locataire
• OCR des reçus Wave et Orange Money : vous photographiez, l'application enregistre
• alertes fin de bail à 90, 60 et 30 jours, pour ne plus laisser un logement vide trois mois

Au Sénégal, le contrat verbal est la première source de litige — et sans écrit, c'est toujours le bailleur qui perd du temps et de l'argent.

Votre carnet, vous pouvez le garder. Mais il ne vous défendra pas.

Essai gratuit. Solo 10 000 FCFA/mois, quel que soit votre loyer.
```

**Texte à incruster dans le visuel :** `À gauche : « Écrite à la main » — À droite : « Envoyée en 10 secondes »`

**Appel à l'action :** En savoir plus

**Prompt image — NanoBanana Pro**

```text
Overhead flat-lay product photograph, horizontal 16:9, split cleanly down the middle by a thin orange #f97316 vertical line, on the left half a creased and yellowed handwritten Senegalese rent receipt booklet lying on a dusty dark wooden table with a torn corner, smudged blue ballpoint figures reading "Loyer 220 000" and a crossed-out date, an old bic pen and a few crumpled banknote-free paper scraps around it, cool dull shadow light, on the right half a modern smartphone lying flat on the same table but under clean bright light, its screen crisply displaying a Locawave PDF receipt on white with a navy #1a2744 header and orange accents, readable French text "QUITTANCE DE LOYER", "Juillet 2026", "Appartement — Grand Yoff", "Montant : 220 000 FCFA", "Payé le 3 juillet 2026", shot straight from above with a 35mm lens, high detail, realistic textures of paper grain and glass, palette navy and orange against warm wood, small white French label overlaid at the bottom-left reading "Écrite à la main" and at the bottom-right reading "Envoyée en 10 secondes", horizontal 16:9 format, photorealistic, Senegalese context, no European stationery.
```

**Animation image → vidéo**

0 s à 2 s : plan fixe sur la moitié gauche uniquement, léger tremblement caméra à main levée sur le carnet. 2 s à 4 s : pan latéral franc de gauche à droite (vitesse constante) qui découvre le téléphone, la lumière s'éclaircit pendant le mouvement. 4 s à 6 s : arrêt et push-in vertical sur l'écran du PDF, les lignes de la quittance apparaissent l'une après l'autre. 6 s à 7 s : dézoom rapide pour montrer les deux moitiés côte à côte avec les deux libellés. Transition sortie : wipe horizontal orange vers le plan suivant.

**Voix off / dialogue**

> Voix off féminine, française, posée : « Le carnet, c'est votre mémoire. Le PDF, c'est votre preuve. »

### `FB-03` — Démonstration produit — les relances J+3 / J+7 / J+15 et le score de ponctualité

**Cible :** Bailleur résident de 40 à 60 ans qui a 3 à 8 locataires et qui déteste réclamer son loyer au téléphone

**Accroche (les 1,5 première seconde) :** « Le 3, le 7, le 15. »

**Texte de l'annonce**

```
Le 3, le 7, le 15 : les relances partent sans vous. Et les bons payeurs ne sont pas dérangés.

Voilà exactement ce que fait Locawave quand un loyer n'est pas tombé :
• J+3 — rappel simple sur WhatsApp, ton courtois
• J+7 — relance ferme, mois et montant rappelés
• J+15 — mise en demeure claire, avec tout l'historique de paiement

Et le locataire qui paie à l'heure depuis huit mois ? Il ne reçoit rien du tout. Son score de ponctualité monte, et vous le voyez sur sa fiche : 96/100. Vous savez enfin, chiffre à l'appui, qui vous fait perdre du temps et qui mérite d'être gardé.

De votre côté, un rapport arrive chaque semaine : encaissé, en attente, en retard, taux de recouvrement.

Plus d'appel gênant le 5 du mois. Le système parle à votre place.

Essai gratuit — ensuite Solo 10 000 FCFA/mois, quel que soit votre loyer.
```

**Texte à incruster dans le visuel :** `« Vous n'appelez plus. »`

**Appel à l'action :** Envoyer un message

**Prompt image — NanoBanana Pro**

```text
Close-up product photograph, square 1:1, of the hands of a Senegalese man in his fifties, wearing a white wax-print shirt with rolled sleeves, holding a modern smartphone vertically at chest height while standing in the sunlit inner corridor of a Dakar apartment building with pale green painted walls and a metal gate slightly out of focus behind him, the phone screen large, sharp and perfectly readable showing the Locawave app on a deep navy #1a2744 background with orange #f97316 buttons: a tenant card at the top reading "Aya Ndiaye — Appartement 2B — Parcelles Assainies" and "Score de ponctualité : 96/100", below it a vertical timeline of three relance items reading "J+3 · Rappel envoyé", "J+7 · Relance envoyée", "J+15 · Mise en demeure" with the first two marked done in orange, and a bottom line reading "Loyer : 150 000 FCFA", late morning hard sunlight raking across the wall, shot on an 85mm lens at f/2.8 with the phone tack sharp and the corridor softly blurred, realistic dark skin tones and visible skin texture, palette navy and orange, bold white French text overlaid across the top reading "Vous n'appelez plus.", square 1:1 format, photorealistic, authentic Senegalese setting.
```

**Animation image → vidéo**

0 s à 2 s : parallaxe légère (fond qui glisse plus lentement que la main) avec la caméra qui descend doucement vers l'écran. 2 s à 5 s : zoom serré sur l'écran, les trois étapes J+3, J+7, J+15 s'allument en orange l'une après l'autre à 0,8 s d'intervalle avec un léger pulse. 5 s à 7 s : le score 96/100 se remplit en compteur animé de 0 à 96. 7 s à 8 s : dézoom sur la main et le couloir, apparition du texte incrusté. Transition sortie : fondu au bleu marine.

**Voix off / dialogue**

> Voix off masculine, français clair : « Le 3, un rappel. Le 7, une relance. Le 15, une mise en demeure. Vous, vous n'avez rien fait — et le loyer est rentré. »

### `FB-04` — Chiffre choc — le prix ne dépend pas du montant du loyer

**Cible :** Bailleur qui hésite entre une agence à pourcentage et une gestion en direct, notamment celui dont les loyers sont élevés

**Accroche (les 1,5 première seconde) :** « 10 000 FCFA. »

**Texte de l'annonce**

```
10 000 FCFA par mois. Que votre loyer soit de 90 000 ou de 900 000 FCFA.

Une agence prend un pourcentage. Chaque mois. Sur chaque loyer. Plus votre bien rapporte, plus elle vous coûte — pour exactement le même travail.

Locawave, non :
• Solo — 10 000 FCFA/mois
• Pro — 20 000 FCFA/mois
• Agence — 45 000 FCFA/mois
• 5 % uniquement sur les travaux et les chantiers
• Essai gratuit

Le même prix pour l'immeuble des Almadies et pour le studio des Parcelles. Vous ne payez pas plus parce que votre loyer est élevé.

Et tout est compris : quittances PDF automatiques, rappels WhatsApp, relances J+3 / J+7 / J+15, score de ponctualité du locataire, alertes fin de bail à 90 / 60 / 30 jours, tableau de bord encaissé / en attente / en retard.

Écrivez-nous : on vous montre l'écran en 5 minutes, sans engagement.
```

**Texte à incruster dans le visuel :** `« Le prix ne dépend pas de votre loyer. » + deux badges « 10 000 FCFA/mois »`

**Appel à l'action :** En savoir plus

**Prompt image — NanoBanana Pro**

```text
Wide architectural photograph, horizontal 16:9, of two Senegalese residential buildings standing side by side against a clear dry-season Dakar sky, on the left a modest ochre-painted R+1 rental house in Parcelles Assainies with laundry drying on the balcony, a satellite dish, exposed concrete stairs and a sand street in front, on the right a modern high-end white villa in the Almadies with large tinted windows, a manicured hedge and a 4x4 parked at the gate, both buildings framed symmetrically with the horizon line at the same height, midday sunlight with strong clean shadows, shot on a 24mm lens with corrected verticals, hyper-realistic architectural photography, palette of warm ochre and white against a deep blue sky with brand navy #1a2744 and orange #f97316, an identical orange rounded badge floating over each building reading "10 000 FCFA/mois" in white bold text, and a wide navy band across the bottom of the frame with white French text reading "Le prix ne dépend pas de votre loyer.", horizontal 16:9 format, photorealistic, strictly Senegalese architecture, no Western suburban houses.
```

**Animation image → vidéo**

0 s à 2 s : pan latéral lent de gauche à droite, du bâtiment modeste vers la villa, sans jamais montrer les deux badges. 2 s à 4 s : la caméra recule (dézoom) jusqu'à cadrer les deux bâtiments ensemble, les deux badges orange tombent en place l'un après l'autre avec un léger rebond (0,4 s chacun). 4 s à 6 s : plan fixe, le bandeau bleu marine monte du bas et le texte apparaît lettre par lettre. Transition sortie : coupe sèche sur l'écran tarifs.

**Voix off / dialogue**

> Voix off masculine, ton net : « Même application. Même prix. Dix mille francs par mois, que votre loyer soit de quatre-vingt-dix mille ou de neuf cent mille. »

### `FB-05` — Question directe — le chantier que l'on paie sans le voir avancer

**Cible :** Propriétaire résident au Sénégal qui fait construire (studios à l'arrière d'une parcelle, R+1 à Yoff ou Diamniadio) et qui règle par tranches sans preuve

**Accroche (les 1,5 première seconde) :** « Sans appeler personne : »

**Texte de l'annonce**

```
Sans appeler personne : où en est votre chantier aujourd'hui ?

Vous avez payé les fondations. Vous avez payé l'élévation. Maintenant on vous réclame la toiture — mais la dernière photo date de six semaines, prise sous le même angle que la précédente.

Sur Locawave, le chantier est découpé en phases, et chaque phase doit être prouvée :
• photos et vidéos réelles déposées phase par phase
• alerte automatique « aucune photo depuis 7 jours »
• alerte « budget dépassé » et alerte « phase soumise »
• vous ne réglez une phase qu'après l'avoir VALIDÉE

À l'écran, c'est aussi simple que ça :
Fondations — payée · Élévation — payée · Toiture — en attente de votre validation.

Locawave ne détient jamais votre argent : vous ne le versez qu'après avoir validé la phase.

Ce n'est pas de la méfiance, c'est de la clarté. Et votre chef de chantier y gagne aussi : son travail est validé par écrit, et il est payé plus vite, phase après phase, sans discussion.

Commission 5 % sur les travaux. Essai gratuit.
```

**Texte à incruster dans le visuel :** `« Aucune photo de votre chantier depuis 7 jours. »`

**Appel à l'action :** Envoyer un message

**Prompt image — NanoBanana Pro**

```text
Low-angle photograph, square 1:1, of an unfinished Senegalese concrete-block construction site at the back of a family plot in Yoff, two half-built studio rooms in grey parpaing with rusted rebar rising from the columns, a wheelbarrow, a heap of sand and a stack of cement bags in the mid-ground, a whitewashed neighbouring wall and a bright hazy dry-season sky above, in the immediate foreground a hand holding a smartphone up against the site so the screen overlaps the unfinished wall, the phone showing a lock-screen notification on a deep navy #1a2744 background with a small orange #f97316 app square and crisp white French text reading "Aucune photo de votre chantier depuis 7 jours." and below it a smaller line "Toiture — en attente de votre validation", late afternoon side light, shot on a 35mm lens with the phone sharp and the site slightly softer, dust particles visible in the light, palette of grey concrete and warm sand against navy and orange, bold white French question overlaid at the top of the frame reading "Où en est votre chantier aujourd'hui ?", square 1:1 format, photorealistic, authentic Senegalese building site, no safety-poster look, no piles of cash, no safe or vault imagery.
```

**Animation image → vidéo**

0 s à 2 s : plan fixe sur le chantier seul, léger vent sur la bâche et la poussière (animation subtile). 2 s à 4 s : la notification apparaît sur l'écran verrouillé avec un glissement vers le bas de 20 pixels et une vibration légère du cadre. 4 s à 6 s : slow push-in vers le téléphone jusqu'à ce que la notification remplisse 70 % du cadre. 6 s à 8 s : coupe intérieure sur la frise des phases (Fondations payée, Élévation payée, Toiture en attente) qui s'affiche ligne par ligne. Transition sortie : fondu enchaîné vers un plan de toiture terminée pour la fin du montage.

**Voix off / dialogue**

> Voix off masculine, sobre : « La toiture n'est pas finie. Vous ne payez pas la toiture. »

### `FB-06` — Offre d'essai — produire sa première quittance dès ce soir, gratuitement

**Cible :** Bailleur ou bailleuse de 35 à 55 ans, 1 à 4 logements, qui gère depuis son téléphone et n'a jamais utilisé de logiciel

**Accroche (les 1,5 première seconde) :** « Ce soir, votre première quittance. »

**Texte de l'annonce**

```
Ce soir, votre première quittance PDF. Sans payer un franc.

L'essai Locawave est gratuit et ne demande rien à installer : c'est une application web, elle s'ouvre dans votre téléphone comme Facebook.

En 10 minutes, accompagné sur WhatsApp :
1. vous ajoutez un bien et son loyer
2. vous ajoutez votre locataire — c'est vous qui l'invitez, il ne s'inscrit pas tout seul
3. vous enregistrez le paiement du mois, ou vous photographiez simplement le reçu Wave ou Orange Money
4. la quittance PDF part au locataire

Ensuite, ça tourne sans vous : rappels le 3, le 7 et le 15, score de ponctualité de chaque locataire, alertes fin de bail à 90 / 60 / 30 jours, rapport hebdomadaire avec ce que vous avez encaissé, ce qui est en attente et ce qui est en retard.

Si au bout d'un mois vous préférez votre carnet, vous gardez votre carnet.

Après l'essai : Solo 10 000 FCFA/mois, quel que soit le montant de vos loyers.
Écrivez-nous le mot ESSAI en message, on démarre avec vous.
```

**Texte à incruster dans le visuel :** `« Essai gratuit » + « Quittance envoyée · 220 000 FCFA »`

**Appel à l'action :** Envoyer un message

**Prompt image — NanoBanana Pro**

```text
Warm interior photograph, square 1:1, of a 45-year-old Senegalese woman with braided hair pulled back, wearing an orange and navy wax-print blouse, sitting at a wooden dining table in a modest Dakar living room at night, a glass of bissap and a small paper Wave receipt beside her elbow, she is holding her smartphone in both hands and smiling faintly at the screen, the screen bright and perfectly readable showing the Locawave app on white with a navy #1a2744 header and an orange #f97316 confirmation banner, French text on screen reading "Quittance envoyée à Modou Fall", "Juillet 2026 — 220 000 FCFA", "Appartement — Grand Yoff" and a small orange pill reading "Essai gratuit", soft warm tungsten light from a ceiling bulb with the phone screen lighting her face, a patterned curtain and a wall calendar softly out of focus behind her, shot on a 50mm lens at f/1.8, realistic deep skin tones, palette of warm interior browns with navy and orange, bold white French text overlaid at the top reading "Votre première quittance, ce soir." and a small line below in orange reading "Essai gratuit", square 1:1 format, photorealistic, authentic Senegalese home, no European apartment.
```

**Animation image → vidéo**

0 s à 2 s : slow push-in très doux vers le visage éclairé par l'écran, léger scintillement de la lumière du téléphone. 2 s à 4 s : coupe sur un insert vertical de l'écran, le bouton orange « Envoyer la quittance » est pressé par le pouce, micro-animation d'appui puis coche de validation qui apparaît. 4 s à 6 s : retour sur elle en plan taille, elle relève la tête, apparition du texte incrusté par fondu montant. 6 s à 8 s : plan fixe sur le bandeau orange « Essai gratuit » avec un léger pulse à 1 Hz. Transition sortie : fondu au bleu marine avec le logo et l'invitation WhatsApp.

**Voix off / dialogue**

> Voix off féminine, chaleureuse : « Un bien. Un locataire. Un paiement. Et la quittance part toute seule. Ce soir, sans payer un franc. »

---

## Facebook Marketplace

> **Note stratégique.** COMMENT UTILISER FACEBOOK MARKETPLACE POUR RECRUTER DES PROPRIÉTAIRES
> 
> 1) Ce que Marketplace est, et ce qu'il n'est pas
> Marketplace n'est pas un canal de publicité de marque : personne n'y va pour découvrir une entreprise, tout le monde y va pour publier ou pour chercher. La marque y est donc invisible et inutile. En revanche, Marketplace est le seul endroit du Sénégal où des propriétaires bailleurs s'identifient EUX-MÊMES, publiquement, gratuitement et en temps réel. Un propriétaire qui publie une annonce de location déclare simultanément quatre choses : il possède un bien, ce bien est vacant (donc il perd de l'argent chaque semaine), il cherche activement une solution, et il vient d'exposer son numéro de téléphone à des centaines d'inconnus. C'est le prospect le plus qualifié que vous trouverez, et il ne coûte pas un franc de média. Le budget ici n'est pas de l'argent, c'est du temps humain.
> 
> 2) Les deux usages, à ne jamais mélanger
> USAGE A — la vitrine (créations FBM-01 et FBM-05). Vous publiez de VRAIES annonces de VRAIS biens de propriétaires réellement inscrits, avec leur accord écrit. Jamais une annonce inventée : une fausse annonce immobilière vous fait bannir de Marketplace et détruit le seul actif qui compte ici, la crédibilité. Ces annonces travaillent deux fois : elles trouvent un locataire pour votre client (donc elles prouvent la valeur de l'abonnement) et elles servent de démonstration silencieuse aux autres propriétaires qui parcourent les annonces des Almadies ou de Grand Yoff. Le badge « Propriétaire vérifié » et le bloc « ce que ça veut dire pour vous » sont ce qui déclenche la question « c'est quoi votre outil ? ». Gardez toujours la ligne de recrutement en dernier paragraphe : elle ne gêne pas le locataire et elle est lue par le bailleur.
> USAGE B — la prospection sortante (le vrai moteur). Les créations FBM-02, FBM-03, FBM-04 et FBM-06 sont publiées en catégorie Services, mais leur fonction principale est d'être le lien que vous envoyez en message privé. Une annonce Services vous donne une page propre, gratuite, hébergée par Facebook, que le prospect peut consulter sans quitter l'application et sans avoir l'impression de cliquer sur une pub.
> 
> 3) Routine de prospection quotidienne (45 à 60 minutes, tous les jours ouvrés)
> · Filtrez Marketplace sur Immobilier · Location, rayon Dakar puis Thiès, Mbour, Saly, tri par plus récent.
> · Ne traitez que les annonces publiées depuis moins de 48 heures. Au-delà, le propriétaire est déjà noyé et démotivé.
> · Distinguez le propriétaire particulier de l'agence : photos prises au téléphone, une à trois annonces sur le profil, description courte, numéro dans le texte, pas de logo. C'est votre cible Solo. Les profils avec logo et quinze annonces sont votre cible Agence à 45 000 FCFA (FBM-06), à approcher autrement.
> · Notez le quartier et le montant du loyer : vous les réutiliserez dans le message, c'est ce qui prouve que vous avez lu.
> · Envoyez 15 à 25 messages personnalisés par jour au maximum, depuis un vrai profil personnel renseigné (photo, ville, activité). Copier-coller à l'identique en volume vous fait tomber dans les filtres anti-spam de Messenger et vous coûtera le compte.
> · Second point de contact gratuit et sous-exploité : les commentaires. Sur les publications de groupes Facebook de bailleurs relayées dans Marketplace, une réponse utile et non commerciale (« pensez à faire l'état des lieux d'entrée avec photos, sans ça vous ne pourrez rien retenir sur la caution ») génère plus de messages entrants qu'un lien.
> 
> 4) L'angle d'attaque : jamais l'application, toujours le problème du jour
> Le propriétaire qui vient de publier n'a pas un problème de logiciel, il a un problème d'heure : il reçoit quarante messages dont trois sérieux, il va faire visiter à des gens qui ne viendront pas, et il va signer sans bail écrit. Votre première phrase doit parler de ça. L'application n'arrive qu'au troisième message, quand il l'a demandée.
> 
> 5) L'offre d'entrée qui convertit : le service rendu avant la vente
> Ne proposez pas un essai gratuit, proposez un livrable : « je vous prépare gratuitement le bail écrit et l'état des lieux d'entrée pour ce logement-là ». C'est concret, c'est daté, ça correspond exactement à ce qu'il est en train de faire, et ça crée le premier acte dans l'application — qui est le seul indicateur qui prédit l'abonnement.
> 
> 6) Ce qu'on mesure ici (aucun CPM, aucun like)
> Messages envoyés · taux de réponse au premier message · nombre de conversations WhatsApp réellement ouvertes · nombre de biens créés dans l'application à 48 h · abonnements payants à J30. Objectif de référence à construire pendant 30 jours dans VOS chiffres, pas dans un blog : conversations ouvertes par heure de prospection, et coût réel d'un abonné en heures de travail. Marketplace n'a de sens que s'il coûte moins qu'une publicité Facebook payante par abonné acquis — vérifiez-le, ne le supposez pas.
> 
> 7) Contraintes de la plateforme à respecter
> Une annonce de service doit être publiée en catégorie Services, pas en Immobilier — une annonce de service déguisée en bien à louer est supprimée. Les annonces immobilières doivent correspondre à un bien réel, disponible, au prix affiché. Renouvelez chaque annonce Services tous les 7 jours (republier plutôt que modifier : la republication remonte dans le fil). Prévoyez le même visuel 1:1 décliné en 3 photos par annonce, Marketplace favorisant les annonces à plusieurs images. Enfin : dès qu'une conversation est chaude, basculez-la sur WhatsApp (« je vous envoie ça sur WhatsApp, c'est plus simple ») — mais la relation locataire-propriétaire, elle, doit revenir dans la messagerie intégrée de Locawave, jamais rester en échange de numéros.
> 
> ---
> 
> SCRIPT DE MESSAGE PRIVÉ — approcher un propriétaire qui vient de publier une annonce de location
> 
> MESSAGE 1 — dans les 24 heures suivant la publication. Court, pas de lien, pas de pièce jointe, aucune mention de prix.
> « Bonjour, j'ai vu votre annonce pour l'appartement à Grand Yoff à 220 000 FCFA. Rassurez-vous, je ne cherche pas à louer.
> Je travaille sur Locawave, un outil de gestion locative fait au Sénégal. Une question simple : vous avez déjà reçu combien de messages depuis hier, et combien étaient sérieux ?
> Si vous êtes comme la plupart des bailleurs à qui je parle, vous allez faire visiter cinq fois pour un seul dossier valable, et signer sans bail écrit parce que ça traîne.
> Je peux vous préparer gratuitement, pour ce logement-là, le bail écrit et l'état des lieux d'entrée avec photos. C'est ce qui vous protège sur la caution en fin de bail. Ça vous intéresse ou je vous laisse tranquille ? »
> 
> MESSAGE 2 — s'il répond oui ou pose une question. On livre avant de vendre.
> « Parfait. J'ai besoin de trois choses : le nom du quartier et l'adresse exacte, le montant du loyer et de la caution, et la date d'entrée prévue.
> Je vous renvoie le bail et l'état des lieux en PDF, prêts à signer, dans la journée. Vous n'avez rien à installer : Locawave s'ouvre dans le navigateur de votre téléphone.
> Et pendant qu'on y est, une fois le locataire entré, l'outil sort la quittance PDF tout seul à chaque loyer et relance à J+3, J+7 et J+15 sur WhatsApp — sauf ceux qui paient à l'heure, ceux-là on les laisse tranquilles. Vous le testez gratuitement, vous décidez après. »
> 
> MESSAGE 3 — s'il demande le prix, ou s'il hésite. On répond au chiffre par le chiffre.
> « 10 000 FCFA par mois, quel que soit le montant de vos loyers. Vous louez à 220 000 FCFA, votre voisin loue à 600 000 FCFA : c'est le même prix pour tous les deux. Une agence, elle, prendrait un pourcentage tous les mois.
> L'essai est gratuit et vous pouvez éditer votre première quittance ce soir. Si dans un mois ça ne vous sert à rien, vous arrêtez, vous gardez vos PDF. »
> 
> MESSAGE 4 — relance à J+3, une seule fois, jamais deux. Puis on laisse.
> « Bonjour, juste pour savoir : le logement de Grand Yoff est parti ?
> Si oui, félicitations — et pensez à faire l'état des lieux d'entrée avec photos avant la remise des clés, c'est là que ça se joue.
> Si non, ma proposition tient : bail + état des lieux offerts, et vous voyez par vous-même. Bonne journée. »
> 
> RÈGLES DU SCRIPT, non négociables : on nomme le quartier et le montant réels de son annonce dès la première ligne ; on annonce tout de suite qu'on n'est pas un locataire (sinon on le fait espérer, et il se braque) ; on ne met aucun lien dans le premier message (Messenger dégrade la distribution des messages contenant des liens venant d'un profil inconnu) ; on laisse une porte de sortie explicite (« ou je vous laisse tranquille »), ce qui fait monter le taux de réponse ; on ne relance qu'une fois. Pour une agence, on remplace l'accroche par : « Vous gérez combien de lots, et combien de vos propriétaires vivent à l'étranger ? » — et on enchaîne sur la démonstration à 45 000 FCFA sur trois de leurs biens réels.

### `FBM-01` — L'annonce de location comme démonstration produit : un vrai logement, un propriétaire passé au KYC, un bail écrit et une quittance PDF. On ne vend rien dans l'annonce — on montre à quoi ressemble une annonce sérieuse, et on glisse une seule ligne de recrutement en bas pour les propriétaires qui publient eux aussi ici.

**Cible :** Locataire solvable de Dakar en recherche active (cible immédiate) + Cheikh Mbaye, 58 ans, bailleur résident au carnet manuscrit, et Aminata Sow, 38 ans, Créteil, qui parcourent Marketplace pour voir comment les autres publient (cible réelle du recrutement)

**Accroche (les 1,5 première seconde) :** « Propriétaire vérifié. »

**Texte de l'annonce**

```
Titre : Appartement 2 chambres — Grand Yoff — 220 000 FCFA/mois
Prix : 220 000 FCFA
Catégorie : Immobilier · Location · Appartement

Appartement de 2 chambres au 3e étage à Grand Yoff, entièrement refait : peinture, plomberie, carrelage. Salon, cuisine équipée, salle d'eau, balcon. Compteurs d'eau et d'électricité individuels. Quartier calme, 5 minutes de la VDN.

Ce logement est publié via Locawave. Concrètement, pour vous locataire, cela veut dire :
· le propriétaire a été vérifié — pièce d'identité et titre de propriété contrôlés avant publication ;
· le bail est écrit et l'état des lieux d'entrée est fait avec photos, des deux côtés ;
· chaque loyer payé déclenche une quittance PDF automatique, envoyée sur votre téléphone ;
· les échanges restent dans la messagerie de l'application : personne ne récupère votre numéro tant que vous ne le donnez pas.

Caution : 2 mois. Disponible immédiatement. Visites du lundi au samedi.

Vous êtes propriétaire et vous publiez vous aussi des annonces ici ? C'est le même outil qui a produit cette annonce, le bail, l'état des lieux et les quittances. 10 000 FCFA par mois, quel que soit le montant de votre loyer. Essai gratuit.
```

**Texte à incruster dans le visuel :** `Propriétaire vérifié · 220 000 FCFA / mois`

**Appel à l'action :** Envoyez « VISITE » en message pour recevoir les créneaux de la semaine.

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic real-estate listing photograph, wide interior view of a freshly renovated two-bedroom apartment in Grand Yoff, Dakar, cream painted walls and pale grey floor tiles, a deep navy blue #1a2744 three-seat sofa, a low dark wood table with a small orange #f97316 ceramic bowl on it, an open aluminium sliding window on the right letting in hard bright dry-season West African daylight that casts crisp geometric shadows across the tiles, a courtyard with magenta bougainvillea and a neighbouring cream-coloured R+2 building visible through the window, shot on a 24mm lens at f/5.6, natural light only, no flash, no people, clean uncluttered composition, warm neutral palette accented by navy #1a2744 and orange #f97316, with a small crisp rounded rectangular badge in the bottom right corner showing a white check mark and the white text "Propriétaire vérifié" on a solid orange #f97316 background, and a thin semi-transparent navy #1a2744 bar across the bottom edge with white text reading "220 000 FCFA / mois · Grand Yoff", square 1:1 format, sharp, high detail.
```

**Animation image → vidéo**

Slow push-in de 4 secondes vers la fenêtre ouverte (zoom 100 % vers 112 %), très lent, comme une visite qui avance dans la pièce. À la 3e seconde, le badge « Propriétaire vérifié » apparaît en fondu en 0,4 s avec un léger rebond. Transition : coupe franche sur le plan suivant (photo de la cuisine), pas de fondu — on reste dans le registre annonce, pas dans le registre pub.

**Voix off / dialogue**

> Aucune voix off. Marketplace se consomme sans son : le texte incrusté et la légende font tout le travail. Si une version vidéo est montée, ajouter uniquement un son d'ambiance discret (rue de Dakar au loin, ventilateur).

### `FBM-02` — L'annonce de service qui parle au bailleur résident dans SA langue de tous les jours : le carnet, le 5 du mois, les trois retardataires. On ne dit pas « digitalisation », on dit « le carnet ne relance personne ». Le prix fixe est l'argument de clôture.

**Cible :** Cheikh Mbaye, 58 ans, Sacré-Cœur, six logements aux Parcelles Assainies et à Liberté 6, quinze ans de carnet manuscrit

**Accroche (les 1,5 première seconde) :** « Le carnet ne relance personne. »

**Texte de l'annonce**

```
Titre : Gestion locative — quittances, relances et suivi des loyers — 10 000 FCFA/mois
Prix : 10 000 FCFA
Catégorie : Services

Vous avez un, trois ou dix logements, et vous tenez encore vos comptes dans un carnet. Le carnet fait très bien son travail : il écrit. Mais il ne relance pas vos locataires.

Ce que Locawave fait à votre place :
· Quittance PDF automatique dès qu'un loyer est encaissé. Plus rien à écrire à la main.
· Relances du locataire à J+3, J+7 et J+15, sur WhatsApp, avec un ton qui monte progressivement.
· Les bons payeurs ne sont pas relancés. Vous arrêtez d'abîmer vos meilleures relations.
· Un score de ponctualité de 0 à 100 par locataire, calculé sur son historique réel de paiement.
· Alerte fin de bail à 90, 60 et 30 jours. Plus de logement vide pendant trois mois faute d'avoir vu la date arriver.
· Vous photographiez le reçu Wave ou Orange Money : l'application le lit et enregistre le paiement.
· Un seul écran pour tout : encaissé, en attente, en retard, taux de recouvrement.

Le prix ne dépend pas de vos loyers : Solo 10 000 FCFA par mois, Pro 20 000 FCFA par mois, Agence 45 000 FCFA par mois. Que vous louiez à 90 000 FCFA ou à 600 000 FCFA, c'est le même tarif — là où une agence prend un pourcentage tous les mois.

Rien à installer depuis une boutique : ça s'ouvre dans le navigateur du téléphone. Essai gratuit. Si au bout d'un mois vous préférez votre carnet, vous gardez votre carnet.
```

**Texte à incruster dans le visuel :** `Le carnet ne relance personne.`

**Appel à l'action :** Écrivez « CARNET » en message : on enregistre votre premier logement avec vous et vous sortez votre première quittance ce soir.

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic overhead flat-lay shot on a worn dark wooden table in a Dakar living room, showing on the left an old creased hardback accounting notebook with handwritten rent entries in blue ballpoint ink, curled corners, a rubber band around it and a cheap plastic pen resting on top, and on the right a modern Android smartphone held upright in a dark-skinned Senegalese man's hand with visible age and calluses, the phone screen displaying a clean French-language Locawave dashboard on a navy #1a2744 header reading "Juillet" with four tiles below in white cards showing "Encaissé 745 000 FCFA", "En attente 180 000 FCFA", "En retard 90 000 FCFA" and an orange #f97316 progress ring labelled "Recouvrement 92 %", warm late-afternoon Senegalese light coming from the left through a shutter and striping the table, shallow depth of field on a 50mm lens at f/2.8, palette of aged paper beige, dark wood, navy #1a2744 and orange #f97316, bold white sans-serif text overlaid across the top of the image reading "Le carnet ne relance personne.", square 1:1 format.
```

**Animation image → vidéo**

Parallaxe verticale de 5 secondes : la caméra descend très lentement vers la table (dolly top-down) pendant que le téléphone reste net et que le carnet part légèrement en flou. À la 2e seconde, les chiffres du tableau de bord s'incrémentent brièvement (745 000 FCFA qui monte de 700 000 à 745 000). Transition : fondu au noir de 0,3 s puis carte de fin « 10 000 FCFA / mois · Essai gratuit ».

**Voix off / dialogue**

> Voix off wolof teintée de français, ton calme d'homme de 50 ans : « Le carnet, il écrit bien. Mais le 5 du mois, c'est toi qui appelles. » Puis, en français : « Locawave relance à ta place. Et ceux qui paient à l'heure, on les laisse tranquilles. »

### `FBM-03` — L'annonce de service diaspora, publiée sur les Marketplace locaux du Sénégal ET vue par les diasporas qui parcourent les annonces de Dakar depuis l'étranger. Angle : la phrase juridique exacte — vous ne payez qu'après avoir validé, Locawave ne détient jamais les fonds — et le désamorçage familial en fin d'annonce.

**Cible :** Ousmane Diallo, 47 ans, Bergame, R+1 en construction à Diamniadio supervisée par son beau-frère

**Accroche (les 1,5 première seconde) :** « Voir avant de payer. »

**Texte de l'annonce**

```
Titre : Suivi de chantier au Sénégal depuis l'étranger — photos par phase, paiement après votre validation
Prix : 0 FCFA (essai gratuit)
Catégorie : Services

Vous construisez à Diamniadio, Thiès, Mbour ou Saly pendant que vous travaillez en France, en Italie, en Espagne ou aux États-Unis. Vous envoyez l'argent. Vous recevez des photos. Et vous ne sauriez pas dire, aujourd'hui, quel pourcentage de la maison est réellement fait.

Locawave découpe votre chantier en phases : fondations, élévation, dalle, toiture, finitions. À chaque phase, le chef de chantier dépose des photos et des vidéos datée depuis son téléphone. Vous les regardez depuis le vôtre. Vous ne réglez la phase qu'après l'avoir validée.

À l'écran, ça ressemble à ça :
Fondations — payée
Élévation — payée
Toiture — en attente de votre validation

Point important, à lire deux fois : Locawave ne détient jamais votre argent. Le montant n'est dû qu'après votre validation, tant que vous n'avez pas validé la phase.

Vous recevez aussi trois alertes automatiques : phase soumise, budget dépassé, et aucune photo depuis 7 jours.

Et pour la question que tout le monde se pose sans l'écrire : ce n'est dirigé contre personne. Ce n'est pas vous qui réclamez des photos, c'est le système qui les demande, à date fixe, à tous les chantiers. Celui qui travaille bien arrête d'avoir à se justifier au téléphone : son travail est validé par écrit, et payé plus vite, phase après phase.

Essai gratuit. Commission de 5 % uniquement sur les travaux réalisés.
```

**Texte à incruster dans le visuel :** `La toiture n'est pas finie. Vous ne payez pas la toiture.`

**Appel à l'action :** Envoyez « CHANTIER » en message : on découpe votre chantier en phases avec vous, en 20 minutes, et vous demandez la première série de photos ce soir.

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic shot from behind and slightly over the shoulder of a Senegalese man's dark-skinned hand holding a smartphone upright in the foreground, sharply in focus, while behind it, softly out of focus, stands a real half-built R+1 concrete-block house in Diamniadio, Senegal, grey cinder-block walls, rusted rebar rods sticking up from the unfinished first floor, wooden scaffolding poles, a pile of sand and a red plastic bucket in the red laterite dirt yard, hard midday dry-season sun and a pale blue cloudless sky, the phone screen showing a clean French-language Locawave construction timeline on a navy #1a2744 background with three rows of white text and status chips reading "Fondations — payée" with a green check, "Élévation — payée" with a green check, and "Toiture — en attente de votre validation" in an orange #f97316 chip, plus a large orange #f97316 button at the bottom of the screen reading "Valider la phase", shot on an 85mm lens at f/2.0 for strong subject separation, palette of grey concrete, red earth, navy #1a2744 and orange #f97316, white bold sans-serif caption across the top of the image reading "La toiture n'est pas finie. Vous ne payez pas la toiture.", square 1:1 format.
```

**Animation image → vidéo**

Rack focus de 6 secondes : on démarre net sur le chantier flou-avant-plan inversé, puis en 1,5 s la mise au point glisse du chantier vers l'écran du téléphone. Le pouce vient survoler le bouton orange « Valider la phase » et s'arrête à 2 mm au-dessus, immobile, pendant 2 secondes — il ne clique pas. Léger tremblement naturel de la main. Transition : la ligne « Toiture — en attente de votre validation » clignote une fois en orange, puis coupe franche.

**Voix off / dialogue**

> Français neutre, voix d'homme posée, aucun pathos : « Fondations, payée. Élévation, payée. Toiture… la toiture n'est pas finie. » Silence de 1 seconde. « Alors vous ne payez pas la toiture. Vous validez, puis vous payez. Locawave n'y touche pas. »

### `FBM-04` — Annonce de recrutement de prestataires. On renverse le récit : sur Marketplace, le maçon est habituellement celui qu'on soupçonne. Ici il est celui qu'on protège — payé plus vite, protégé le jour où on l'accuse à tort. C'est aussi la meilleure façon de remplir l'annuaire vérifié, qui est un actif de la marketplace Locawave.

**Cible :** Prestataires du bâtiment de Dakar, Thiès, Mbour, Saly, Diamniadio : maçons, plombiers, électriciens, chefs de chantier, carreleurs

**Accroche (les 1,5 première seconde) :** « Phase validée, à régler. »

**Texte de l'annonce**

```
Titre : Maçons, plombiers, électriciens : entrez dans l'annuaire vérifié Locawave (inscription gratuite)
Prix : 0 FCFA
Catégorie : Services

Vous travaillez bien, et vous passez quand même votre temps à courir après le paiement. Et on vous met dans le même sac que ceux qui prennent l'avance et disparaissent.

Locawave met en relation des propriétaires — beaucoup vivent en France, en Italie, en Espagne ou aux États-Unis — avec des prestataires vérifiés au Sénégal.

Ce que ça change pour vous :
· Vous passez la vérification d'identité (KYC). C'est obligatoire pour apparaître, et c'est exactement ce qui vous distingue de la concurrence.
· Vous êtes visible dans l'annuaire avec vos réalisations et vos avis — et seuls les clients qui ont réellement travaillé avec vous peuvent en laisser un. Personne ne peut vous salir gratuitement.
· Le chantier est découpé en phases, avec un montant convenu par phase. Vous déposez les photos de la phase terminée depuis votre téléphone.
· Le client valide, puis règle la phase par Wave ou Orange Money. Fini le « je t'envoie ça la semaine prochaine ».
· Tout est écrit et daté : le montant, la date, les photos. Le jour où quelqu'un conteste votre travail, vous avez la preuve. C'est votre protection autant que la sienne.

Inscription à l'annuaire gratuite. Zones couvertes : Dakar, Thiès, Mbour, Saly, Diamniadio.
```

**Texte à incruster dans le visuel :** `Phase validée. Phase validée.`

**Appel à l'action :** Envoyez « PRESTATAIRE » en message avec votre métier et votre zone : on lance votre vérification cette semaine.

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic medium close-up portrait of a Senegalese mason in his late thirties, dark skin, short beard, wearing a dusty navy blue #1a2744 work shirt with rolled sleeves and an orange #f97316 hard hat pushed slightly back, cement dust on his forearms, standing on an unfinished concrete slab of an R+1 house under construction in Diamniadio with cinder-block walls and rebar behind him, looking down at the smartphone he holds in both hands with a calm satisfied half-smile, the phone screen clearly visible and showing a French-language Locawave screen with a navy #1a2744 header reading "Élévation" and a large white card containing a green check mark, the text "Phase validée par le propriétaire" and below it in bold "450 000 FCFA à régler", late afternoon golden Senegalese sun raking from the left creating warm rim light on his shoulder and hat, shot on a 50mm lens at f/2.2, palette of grey concrete, red laterite dust, navy #1a2744 and orange #f97316, bold white sans-serif text overlaid along the bottom reading "Phase validée. Phase validée.", square 1:1 format.
```

**Animation image → vidéo**

Push-in lent de 5 secondes vers le visage puis micro-tilt vers l'écran du téléphone (zoom 100 % vers 118 %). À la 2,5e seconde, la carte « 450 000 FCFA à régler » apparaît sur l'écran avec un slide-up de 0,3 s, et l'homme relève la tête et sourit. Transition : coupe sur un plan large du chantier au coucher du soleil.

**Voix off / dialogue**

> Voix d'homme, wolof puis français : « Ce n'est pas le client qui décide s'il te paie. C'est la phase. » Puis : « Tu montres le travail, il valide, l'argent sort. Inscription gratuite. »

### `FBM-05` — L'annonce haut de gamme qui vend la MÉTHODE plutôt que le bien : dossier, visite planifiée, aucun numéro échangé. Elle attire un locataire premium mais surtout elle humilie doucement la concurrence d'annonces à côté (photos floues + « appelez ce numéro »), ce qui est le vrai déclencheur pour un propriétaire qui scrolle.

**Cible :** Locataire expatrié ou cadre dakarois pour la location ; Ndèye Fatou Gaye et les propriétaires diaspora qui comparent les annonces des Almadies pour le recrutement

**Accroche (les 1,5 première seconde) :** « Aucun numéro échangé. »

**Texte de l'annonce**

```
Titre : Villa 4 chambres meublée — Almadies — 650 000 FCFA/mois
Prix : 650 000 FCFA
Catégorie : Immobilier · Location · Maison

Villa de plain-pied, 4 chambres dont une suite parentale, grand séjour, cuisine américaine équipée, terrasse couverte, jardin clos avec bougainvilliers, place pour deux voitures. Meublée, climatisée, groupe électrogène. Quartier des Almadies, à 10 minutes de la corniche.

Cette annonce fonctionne différemment des autres :
· Le propriétaire est vérifié — identité et titre de propriété contrôlés avant publication. Il vit à l'étranger, mais tout passe par l'application, pas par un intermédiaire qu'on n'arrive plus à joindre.
· Aucun échange de numéro de téléphone. Tout se fait dans la messagerie intégrée, jusqu'à la signature. Vous ne recevrez pas dix appels d'inconnus après avoir écrit.
· Visite planifiée à un créneau précis, pas « venez voir, on est sur place ». Une visite vidéo est disponible si vous êtes hors du Sénégal.
· Bail écrit et état des lieux d'entrée contradictoire avec photos, signés des deux côtés. Sans état des lieux d'entrée, personne ne peut rien retenir sur votre caution à la sortie — c'est la première source de litige au Sénégal, et elle est évitable.
· Quittance PDF automatique à chaque loyer payé, et un résumé mensuel de vos paiements.

Caution : 2 mois. Disponible au 1er du mois prochain.

Propriétaire : cette annonce, le bail, l'état des lieux et les quittances sortent tous du même outil. 10 000 FCFA par mois, quel que soit votre loyer. Essai gratuit.
```

**Texte à incruster dans le visuel :** `Aucun numéro échangé.`

**Appel à l'action :** Envoyez « DOSSIER » en message : vous recevez les photos complètes, la visite vidéo et le créneau de visite.

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic architectural photograph of a modern single-storey villa in the Almadies district of Dakar at golden hour, white rendered walls and a flat roof with a covered terrace held by slim square columns, large sliding glass doors reflecting the warm sky, a neat green lawn bordered by tall magenta and orange bougainvillea, two low navy #1a2744 outdoor armchairs and an orange #f97316 cushion on the terrace, a paved driveway in the foreground, warm low sun from the left giving long soft shadows and a deep blue evening sky above, shot on a 20mm tilt-shift lens at f/8 with perfectly vertical lines, no people, no cars, crisp and premium but not glossy, palette of white, deep green, navy #1a2744 and orange #f97316, a small rounded badge in the top left corner in white on orange #f97316 with a check mark reading "Propriétaire vérifié", and a thin navy #1a2744 bar along the bottom edge with white text reading "650 000 FCFA / mois · Almadies · Visite sur créneau", square 1:1 format.
```

**Animation image → vidéo**

Parallaxe latérale de 5 secondes de gauche à droite (effet 2,5D : la végétation au premier plan glisse plus vite que la villa), très doux. À la 3e seconde, le badge « Propriétaire vérifié » apparaît en fondu. À la 4e seconde, la barre du bas se met à jour de « 650 000 FCFA / mois · Almadies » vers « Aucun numéro échangé ». Transition : coupe franche vers l'intérieur du séjour.

**Voix off / dialogue**

> Aucune voix off — le silence est l'argument. Si vidéo montée : ambiance de fin de journée aux Almadies (vent, oiseaux) et un seul son d'interface, le clic de validation, à la 4e seconde.

### `FBM-06` — Annonce B2B pour les agences, publiée en catégorie Services et destinée à être partagée en message privé aux agences repérées sur Marketplace. Angle contre-intuitif : la transparence ne vous fait pas perdre le mandat, c'est l'opacité qui vous le fait perdre. Chiffre de clôture : 45 000 FCFA/mois pour toute l'agence, quel que soit le volume de loyers gérés.

**Cible :** Ndèye Fatou Gaye, 36 ans, Point E, agence de 4 personnes, 60 lots, une dizaine de propriétaires en France, en Italie et aux États-Unis

**Accroche (les 1,5 première seconde) :** « Ils veulent voir. Montrez-leur. »

**Texte de l'annonce**

```
Titre : Agences immobilières — accès propriétaire pour vos mandats diaspora — 45 000 FCFA/mois
Prix : 45 000 FCFA
Catégorie : Services

Vos propriétaires expatriés vous demandent une photo, un décompte, une explication sur un retard. Vous passez vos journées à rassurer au lieu de gérer. Et vous perdez des mandats face à des propriétaires qui trouvent qu'ils « ne voient rien ».

Locawave donne à chacun de vos propriétaires son propre accès en lecture, sans vous retirer la main :
· Ils voient leurs biens, leurs loyers encaissés, en attente et en retard, et leur taux de recouvrement. Ils arrêtent de vous appeler pour ça.
· Ils reçoivent un rapport hebdomadaire automatique. Vous ne l'écrivez pas.
· Les quittances PDF partent toutes seules, les relances locataires aussi, à J+3, J+7 et J+15 sur WhatsApp.
· Pour les propriétaires qui font construire : suivi de chantier par phases, avec photos datées et rattachées à une phase et paiement dû seulement après leur validation. L'argent reste chez Wave ou Orange Money — ni vous ni Locawave ne le détenez.
· Vos annonces sortent avec le badge propriétaire vérifié, et la relation ne s'arrête plus à un numéro de téléphone donné à un inconnu.

45 000 FCFA par mois pour toute l'agence, quel que soit le montant des loyers gérés. C'est moins qu'un mandat perdu.

Ce que vos propriétaires paient, ce n'est pas votre monopole sur l'information : c'est votre travail de terrain. Le donner à voir, c'est ce qui vous fait gagner les mandats diaspora des autres.

Essai gratuit, mise en place accompagnée de votre portefeuille.
```

**Texte à incruster dans le visuel :** `Ils veulent voir. Montrez-leur.`

**Appel à l'action :** Écrivez « AGENCE » en message avec votre nombre de lots : on vous fait la démonstration sur trois de vos biens réels.

**Prompt image — NanoBanana Pro**

```text
Square 1:1 photorealistic environmental portrait of a confident Senegalese woman in her mid-thirties, dark skin, short natural hair, wearing a tailored white blouse and a navy #1a2744 blazer with small gold earrings, seated at a clean modern desk in a small bright real-estate agency office in Point E, Dakar, an open laptop in front of her showing a French-language Locawave agency dashboard with a navy #1a2744 sidebar and white cards reading "60 lots gérés", "Recouvrement 94 %" and an orange #f97316 button labelled "Inviter un propriétaire", her right hand holding a smartphone up toward the camera displaying the owner view with the line "Rapport hebdomadaire envoyé", behind her a wall with a simple shelf, a green potted plant and a framed street map of Dakar, soft diffused daylight from a large window on the right, shot on a 35mm lens at f/2.5, professional but warm and unstaged, palette of white, wood, navy #1a2744 and orange #f97316, bold white sans-serif text on a navy #1a2744 band across the top reading "Ils veulent voir. Montrez-leur.", square 1:1 format.
```

**Animation image → vidéo**

Push-in très léger de 4 secondes sur le visage (zoom 100 % vers 108 %) avec un micro-mouvement de tête naturel, puis à la 2,5e seconde un focus pull rapide (0,4 s) du visage vers l'écran du téléphone qu'elle tend. La notification « Rapport hebdomadaire envoyé » glisse du haut de l'écran. Transition : fondu blanc de 0,3 s vers une carte de fin bleu marine « 45 000 FCFA / mois · toute l'agence ».

**Voix off / dialogue**

> Voix féminine française, ton professionnel et direct : « Vos propriétaires ne paient pas votre silence. Ils paient votre terrain. » Puis : « Donnez-leur le tableau de bord — c'est comme ça qu'on gagne les mandats des autres. »

---

## TikTok

> **Note stratégique.** Huit scripts, huit formats natifs TikTok réellement différents (POV, storytime, avant/après, démo écran, humour, témoignage, listicle, time-lapse) — jamais la même idée déclinée. Découpage par plans avec un prompt d'image autonome par plan : chaque prompt se copie-colle seul dans NanoBanana Pro et produit une image qui tient dans une timeline 9:16.
> 
> Répartition d'audience : TT-01, TT-06 et TT-08 sont des créas DIASPORA (chantier, panier élevé, commission 5 % — c'est ce qui justifie un coût d'acquisition européen). TT-03, TT-05 et TT-07 sont des créas SÉNÉGAL RÉSIDENT (locatif, abonnement 10 000 FCFA). TT-02 et TT-04 marchent sur les deux. Ne jamais mettre diaspora et Sénégal dans le même ensemble publicitaire : ce sont deux économies différentes.
> 
> Trois règles tenues dans les huit scripts : (1) l'antagoniste est le flou, jamais une personne — aucun beau-frère, aucun locataire, aucun maçon n'est montré en fautif ; (2) la formulation du paiement n'est jamais déformée — vous ne payez qu'après avoir validé, Locawave ne détient jamais les fonds ; aucun coffre-fort, aucune liasse de billets dans les visuels ; (3) le hook tombe avant 1,5 s, en image et en texte incrusté de 5 mots maximum, lisible sans son.
> 
> Production : tourner les 8 en une session de génération, puis animer. Les plans « écran » (TT-04, TT-01 PLAN 5, TT-08 PLAN 5) sont les plus rentables à réutiliser — générez-les en haute définition, ils resserviront en Reels et sur Marketplace. Pour la version Sénégal de TT-03, TT-05 et TT-07, réenregistrer la voix off en wolof sur exactement le même montage : le texte incrusté reste en français.
> 
> Mesure : ne jugez que la rétention à 3 secondes sur les 72 premières heures, et le coût par conversation WhatsApp ouverte — pas les likes. Coupez toute créa sous 25 % de rétention à 3 s avant d'augmenter le moindre budget.

### `TT-01` — POV diaspora — le point de vue subjectif de l'homme qui reçoit la même photo depuis six semaines et à qui on réclame l'argent de la toiture

**Cible :** Ousmane Diallo, 47 ans, Bergame (Italie), magasinier — construit une R+1 à Diamniadio

**Accroche (les 1,5 première seconde) :** « Six semaines. Même photo. »

**Texte de l'annonce**

```
SCRIPT — 24 secondes, 6 plans, POV, sans son obligatoire (tout est lisible en texte incrusté)

PLAN 1 — 0,0 à 1,6 s
Écran de téléphone, deux photos de chantier superposées, rigoureusement identiques.
Texte incrusté : « Six semaines d'écart. »

PLAN 2 — 1,6 à 5,0 s
Ousmane, 47 ans, gilet de travail, pause de nuit dans un entrepôt frigorifique à Bergame.
Texte incrusté : « Il fait des nuits pour ce mur. »

PLAN 3 — 5,0 à 9,0 s
Gros plan sur le message reçu : « Envoie 1 200 000 FCFA pour la toiture. »
Texte incrusté : « La toiture. Déjà. »

PLAN 4 — 9,0 à 13,0 s
Son pouce reste suspendu au-dessus du téléphone. Il ne répond pas. Il n'ose pas demander.
Texte incrusté : « Demander des photos, ce n'est accuser personne. »

PLAN 5 — 13,0 à 20,0 s
Bascule sur l'écran Locawave : la frise des phases du chantier.
Texte incrusté : « Fondations — payée · Élévation — payée · Toiture — en attente de votre validation. »
Puis, en bas : « Vous validez, puis vous payez. Locawave n'y touche jamais. »

PLAN 6 — 20,0 à 24,0 s
La toiture apparaît en photos datées et rattachées à une phase sur l'écran. Le bouton orange devient actif.
Texte incrusté : « Ne payez que ce que vous avez vu. »

SON : nappe grave et pulsation lente type afro-cinématique, aucune parole jusqu'au PLAN 5 ; à 13,0 s un « clic » d'interface sec + montée de percussions sabar filtrées ; coupure nette du son à 24,0 s sur le logo.
```

**Texte à incruster dans le visuel :** `Six semaines d'écart.`

**Appel à l'action :** Lien en bio — essai gratuit. Créez votre chantier, découpez-le en phases, demandez la première série de photos.

**Prompt image — NanoBanana Pro**

```text
PLAN 1 : Extreme close-up vertical 9:16 of a slightly scratched Android phone screen held in the calloused hand of a dark-skinned West African man, the screen showing a green-and-white messaging thread with two almost identical photographs stacked vertically of an unfinished grey concrete-block two-storey house in Diamniadio Senegal, same camera angle same harsh midday shadow in both, the two visible date stamps clearly readable as "12 mars" and "24 avril", cold blue-white night light from an unseen window raking across the glass while the room behind falls into deep navy #1a2744 darkness, shot on a 50mm macro lens at f/2 with shallow depth of field and visible fingerprint smudges, bold French overlay text in orange #f97316 across the lower third reading "Six semaines d'écart.", vertical 9:16 format.

PLAN 2 : Medium shot vertical 9:16 of a 47-year-old West African man with short greying hair and a tired lined face, wearing a padded navy blue #1a2744 work jacket over a high-visibility orange #f97316 safety vest, standing alone between tall metal racks in a cold-storage warehouse in Bergamo Italy at 2 a.m., faint condensation of his breath in the freezing air, harsh green-tinted overhead fluorescent tubes above and a lit phone screen glowing warm orange under his chin, shot on a 35mm lens at f/2.8 with slight handheld feel, desaturated industrial palette broken only by the orange vest, bold French overlay text in white across the top third reading "Il fait des nuits pour ce mur.", vertical 9:16 format.

PLAN 3 : Tight over-the-shoulder vertical 9:16 shot of the same man's phone screen filling most of the frame, a messaging conversation in French where the last received bubble reads clearly "Envoie 1 200 000 FCFA pour la toiture", the text cursor blinking in an empty reply field below, his blurred unshaven jaw and warehouse fluorescents out of focus behind, screen glow lighting his fingers, shot on an 85mm lens at f/1.8, cold blue ambient light against the warm screen, French overlay text in orange #f97316 at the bottom reading "La toiture. Déjà.", vertical 9:16 format.

PLAN 4 : Very tight vertical 9:16 close-up of a dark-skinned man's thick thumb frozen in mid-air one centimetre above a phone keyboard, absolutely still, not touching the glass, the empty reply field visible and lit, tiny dust particles caught in the screen light, the rest of the frame swallowed by navy #1a2744 shadow, shot on a 100mm macro lens at f/2.8 with extremely shallow focus on the thumbnail, French overlay text in white centred in the lower area reading "Demander des photos, ce n'est accuser personne.", vertical 9:16 format.

PLAN 5 : Clean vertical 9:16 product shot of a modern smartphone held upright in a dark-skinned hand against a deep navy #1a2744 background, the screen displaying the Locawave French mobile app interface: a vertical construction timeline with three rows, the first row "Fondations" with a green check and the label "payée", the second row "Élévation" with a green check and the label "payée", the third row "Toiture" greyed out with an orange #f97316 clock icon and the label "en attente de votre validation", a greyed inactive orange button at the bottom reading "Valider cette phase" and beneath it small white text "1 200 000 FCFA", crisp studio rim light on the phone edges, shot on a 50mm lens at f/5.6, small white French overlay text at the very bottom of the frame reading "Vous validez, puis vous payez. Locawave n'y touche jamais.", vertical 9:16 format.

PLAN 6 : Vertical 9:16 split composition, the upper two thirds a real photograph of a freshly completed red-brown corrugated roof on a two-storey concrete house in Diamniadio Senegal under a bright dry-season sky with a small timestamp overlay reading "7 juin · 16 h 12", the lower third the same phone interface where the "Toiture" row now shows a green check and the orange #f97316 button is fully active and glowing, reading "Valider cette phase", warm late-afternoon Senegalese sunlight, shot on a 24mm lens at f/8 with high clarity, large bold French overlay text in orange #f97316 centred over the join reading "Ne payez que ce que vous avez vu.", vertical 9:16 format.
```

**Animation image → vidéo**

PLAN 1 (1,6 s) : zoom numérique très lent sur les deux dates, 105 % à 112 %, aucun autre mouvement — l'immobilité est le message. Coupe sèche. PLAN 2 (3,4 s) : léger travelling avant type push-in à 3 % avec micro-tremblement handheld, la buée de la respiration animée. Coupe sèche. PLAN 3 (4 s) : parallax doux, le téléphone reste net, l'arrière-plan glisse de 8 px vers la gauche ; le curseur du champ de réponse clignote 3 fois. Fondu au noir de 4 images. PLAN 4 (4 s) : plan quasi fixe, seul le pouce a un micro-mouvement de tremblement de 2 px, zoom out imperceptible de 104 % à 100 %. Transition : flash blanc de 3 images. PLAN 5 (7 s) : la caméra descend lentement le long de la frise des phases (pan vertical de haut en bas, 6 % de la hauteur), puis arrêt net sur la ligne « Toiture » ; l'icône orange pulse deux fois. Transition : balayage vertical de bas en haut. PLAN 6 (4 s) : push-in sur la photo de toiture pendant 2 s, puis le bouton orange s'illumine avec un flare court ; la phrase finale apparaît lettre par lettre sur 0,8 s. Fin sur fond bleu marine plein cadre.

**Voix off / dialogue**

> (Voix off masculine, grave, calme, aucune emphase — à partir du PLAN 3 seulement) : « On lui demande l'argent de la toiture. La dernière photo a six semaines. Il ne dit rien, parce que réclamer, chez lui, ça se paie cher. » (temps) « Alors ce n'est plus lui qui réclame. C'est le système. Fondations, payée. Élévation, payée. Toiture : en attente de sa validation. Vous validez, puis vous payez tant qu'il n'a pas vu. » (temps) « Ne payez que ce que vous avez vu. »

### `TT-02` — Storytime face caméra — la caution perdue faute d'écrit : bascule du volet locatif, raconté par une femme, à voix basse, la nuit

**Cible :** Aminata Sow, 38 ans, Créteil (France), aide-soignante, deux appartements à Grand Yoff

**Accroche (les 1,5 première seconde) :** « J'ai perdu, madame. »

**Texte de l'annonce**

```
SCRIPT — 28 secondes, 6 plans, storytime face caméra

PLAN 1 — 0,0 à 1,5 s
Gros plan visage, cuisine, 23 h. Elle regarde l'objectif.
Texte incrusté : « J'ai perdu. Faute d'un papier. »

PLAN 2 — 1,5 à 7,0 s
Elle raconte : deux appartements à Grand Yoff, 175 000 FCFA et 220 000 FCFA. Aucun bail écrit sur l'un des deux.
Texte incrusté : « 395 000 FCFA par mois. Zéro papier. »

PLAN 3 — 7,0 à 12,0 s
Fin de bail. Le locataire dit qu'il a payé. Elle n'a rien à montrer.
Texte incrusté : « Sa parole contre ma mémoire. »

PLAN 4 — 12,0 à 17,0 s
La vraie phrase : ce n'est pas la personne, c'est le vide.
Texte incrusté : « Ce n'était pas lui le problème. C'était le vide. »

PLAN 5 — 17,0 à 24,0 s
Écran : quittance PDF de juin, historique des paiements, score de ponctualité 78/100.
Texte incrusté : « Maintenant chaque franc a une trace. »

PLAN 6 — 24,0 à 28,0 s
Elle repose son téléphone, souffle, sourit à peine.
Texte incrusté : « 10 000 FCFA/mois. Quel que soit le loyer. »

SON : silence quasi total sur les PLANS 1 à 4, juste l'ambiance d'appartement (frigo, horloge). Piano très simple, deux notes, à partir du PLAN 4. Aucune musique tendance : le silence fait le sérieux.
```

**Texte à incruster dans le visuel :** `J'ai perdu. Faute d'un papier.`

**Appel à l'action :** Lien en bio — essai gratuit. Éditez votre première quittance PDF ce soir, avant de payer quoi que ce soit.

**Prompt image — NanoBanana Pro**

```text
PLAN 1 : Tight vertical 9:16 portrait of a 38-year-old Senegalese woman with short natural hair and small gold hoop earrings, still wearing a pale blue healthcare tunic, sitting at a small kitchen table in a modest apartment in Créteil France at 11 p.m., looking directly into the lens with tired steady eyes and no makeup, a single warm overhead kitchen light above her and a cold blue window night behind, shot on a 35mm lens at f/2 with natural handheld framing and slightly off-centre composition, muted palette of navy #1a2744 shadows and warm skin tones, bold French overlay text in white across the lower third reading "J'ai perdu. Faute d'un papier.", vertical 9:16 format.

PLAN 2 : Vertical 9:16 insert shot of two small printed photographs and a phone lying on a worn kitchen table, the photographs showing two simple apartment buildings with painted balconies and satellite dishes in Grand Yoff Dakar under bright dry-season light, a cheap ballpoint pen and an unpaid electricity bill beside them, warm tungsten kitchen light from above at a steep angle casting long shadows, shot on a 50mm lens at f/2.8 slightly overhead, French overlay text in orange #f97316 across the middle reading "395 000 FCFA par mois. Zéro papier.", vertical 9:16 format.

PLAN 3 : Vertical 9:16 close-up of the same woman's hands opening a small empty spiral notebook on the kitchen table, the pages blank except for three scribbled crossed-out numbers, her wedding ring visible, her face out of frame above, harsh single overhead light, shot on a 50mm macro lens at f/2.8, desaturated and cold, French overlay text in white at the top reading "Sa parole contre ma mémoire.", vertical 9:16 format.

PLAN 4 : Vertical 9:16 medium portrait of the same Senegalese woman leaning back slightly from the table, exhaling, eyes lowered then lifting toward the lens, the kitchen behind her dark and out of focus with a single orange #f97316 fridge magnet visible as the only warm accent, soft window bounce from the left, shot on an 85mm lens at f/1.8 with creamy background separation, French overlay text in white centred low reading "Ce n'était pas lui le problème. C'était le vide.", vertical 9:16 format.

PLAN 5 : Clean vertical 9:16 shot of a smartphone held upright by a Senegalese woman's hand over the kitchen table, the screen showing the Locawave French app: a white PDF receipt card headed "Quittance de loyer — juin" with the line "220 000 FCFA · réglé le 3 juin", below it a payment history list with three green ticks, and at the bottom a circular gauge in orange #f97316 labelled "Score de ponctualité 78/100", warm tungsten light on the phone edges, shot on a 50mm lens at f/4 with the screen perfectly legible, French overlay text in white at the very bottom reading "Maintenant chaque franc a une trace.", vertical 9:16 format.

PLAN 6 : Vertical 9:16 portrait of the same woman putting the phone face down on the table and letting her shoulders drop, the faintest relieved half-smile, looking slightly off-lens, warm kitchen light now feeling softer and more golden, a glass of water and the closed notebook beside her, shot on a 35mm lens at f/2, French overlay text in orange #f97316 across the lower third reading "10 000 FCFA/mois. Quel que soit le loyer.", vertical 9:16 format.
```

**Animation image → vidéo**

PLAN 1 (1,5 s) : plan fixe strict, uniquement un cillement animé et un très léger push-in de 2 % — le visage immobile qui parle fait le hook. Coupe sèche. PLAN 2 (5,5 s) : lent pan latéral de gauche à droite au-dessus de la table, 10 % de la largeur, comme un regard qui balaie. Coupe sèche. PLAN 3 (5 s) : push-in serré sur le carnet vide, 100 % à 115 %, les pages blanches remplissent le cadre en fin de plan. Transition : coupe au noir de 6 images (le vide). PLAN 4 (5 s) : plan quasi fixe, micro-parallax de la tête, le regard remonte vers l'objectif à 15,5 s. Coupe sèche. PLAN 5 (7 s) : zoom sur le téléphone de 100 % à 120 % en 3 s, puis la jauge orange se remplit de 0 à 78 en 1,5 s, puis arrêt. Transition : fondu enchaîné de 8 images. PLAN 6 (4 s) : zoom out lent de 112 % à 100 %, la respiration visible ; le prix apparaît en fondu à 26,0 s et reste 2 s à l'écran.

**Voix off / dialogue**

> (Voix féminine, basse, fatiguée, presque chuchotée, accent français avec des inflexions dakaroises) : « Deux appartements à Grand Yoff. 175 000 et 220 000 par mois. Et sur l'un des deux, pas de bail écrit. » (temps) « Fin de bail, il me dit qu'il a tout payé. Moi je refais les comptes de tête à 23 h après douze heures de garde. J'ai rien. Aucune quittance, aucune date. J'ai perdu. » (temps) « Ce n'était pas lui le problème. C'était le vide. » (temps, ton qui remonte) « Aujourd'hui j'ai la quittance de juin, l'historique, et un score de ponctualité. Dix mille francs par mois. Pas un pourcentage sur mes loyers. »

### `TT-03` — Avant / après tangible — le carnet manuscrit froissé de quinze ans face au tableau de bord, sans jamais moquer le carnet

**Cible :** Cheikh Mbaye, 58 ans, Sacré-Cœur Dakar, six logements, carnet manuscrit depuis quinze ans

**Accroche (les 1,5 première seconde) :** « Ce carnet a raison. »

**Texte de l'annonce**

```
SCRIPT — 22 secondes, 5 plans, avant/après

PLAN 1 — 0,0 à 1,4 s
Gros plan sur un carnet manuscrit corné, colonnes tracées à la règle, montants en FCFA.
Texte incrusté : « Ce carnet a raison depuis 15 ans. »

PLAN 2 — 1,4 à 6,0 s
Main d'homme âgé qui écrit une quittance au stylo bille. Lenteur.
Texte incrusté : « Mais il ne relance personne. »

PLAN 3 — 6,0 à 11,0 s
Le même homme photographie un reçu Wave posé sur la table. Flash.
Texte incrusté : « Vous photographiez. L'app lit. »

PLAN 4 — 11,0 à 18,0 s
Écran : tableau de bord. Encaissé 745 000 FCFA · En attente 180 000 FCFA · En retard 90 000 FCFA · Taux de recouvrement 92 %.
Texte incrusté : « Tout ça, sans ouvrir le carnet. »

PLAN 5 — 18,0 à 22,0 s
Le carnet et le téléphone côte à côte sur la même table. Personne n'a jeté le carnet.
Texte incrusté : « Gardez le carnet. Ajoutez la preuve. »

SON : mbalax acoustique très dépouillé, une kora et un shaker, tempo lent ; le bruit réel du stylo sur le papier au PLAN 2 laissé au premier plan ; petit son d'obturateur au PLAN 3.
```

**Texte à incruster dans le visuel :** `Ce carnet a raison depuis 15 ans.`

**Appel à l'action :** Lien en bio — essai gratuit, rien à installer. Si dans un mois vous préférez votre carnet, vous gardez votre carnet.

**Prompt image — NanoBanana Pro**

```text
PLAN 1 : Extreme close-up vertical 9:16 of a heavily worn hand-ruled paper notebook lying open on a dark wooden table, its pages yellowed and dog-eared with fifteen years of blue and black ballpoint entries in columns, tenant names and amounts clearly legible in French such as "Loyer 150 000" and "Reçu 90 000", a few smudges and one coffee ring, warm late-afternoon Dakar sunlight falling through a window blind and striping the page, shot on a 60mm macro lens at f/4 from directly above, rich warm browns against navy #1a2744 shadow, bold French overlay text in white across the bottom reading "Ce carnet a raison depuis 15 ans.", vertical 9:16 format.

PLAN 2 : Vertical 9:16 close-up of the hands of a 58-year-old Senegalese man with visible veins and a simple silver ring, wearing the sleeve of a pale blue embroidered boubou, slowly writing a handwritten rent receipt on a small carbon-copy pad, forming the words "Reçu de loyer" and the figure "150 000 FCFA", his other hand steadying the pad, warm sunlight from a courtyard doorway to the left and a green bougainvillea shadow on the wall behind, shot on a 50mm lens at f/2.8, French overlay text in orange #f97316 across the upper third reading "Mais il ne relance personne.", vertical 9:16 format.

PLAN 3 : Vertical 9:16 medium close-up of the same Senegalese man in a pale blue boubou holding an Android phone above a small printed Wave mobile-money receipt lying on the wooden table, the phone camera framing the receipt, his reading glasses pushed up on his forehead, warm afternoon light through a Dakar window with a yellow-and-black taxi barely visible out of focus in the street beyond, shot on a 35mm lens at f/3.5 slightly from the side, French overlay text in white across the lower third reading "Vous photographiez. L'app lit.", vertical 9:16 format.

PLAN 4 : Clean vertical 9:16 shot of an Android phone held upright by an older Senegalese man's hand, the screen showing the Locawave French dashboard on a navy #1a2744 background with four cards in a column: "Encaissé 745 000 FCFA" in green, "En attente 180 000 FCFA" in grey, "En retard 90 000 FCFA" in orange #f97316, and a wide progress bar labelled "Taux de recouvrement 92 %", crisp and perfectly legible, warm ambient reflection on the phone edges, shot on a 50mm lens at f/5.6, French overlay text in white at the very bottom reading "Tout ça, sans ouvrir le carnet.", vertical 9:16 format.

PLAN 5 : Vertical 9:16 overhead flat-lay of the same dark wooden table with the worn handwritten notebook open on the left and the phone showing the orange-accented Locawave dashboard on the right, both lit by the same warm slanted Dakar afternoon sun, a pair of reading glasses and a glass of bissap between them, no hand in frame, shot on a 35mm lens at f/5.6 from directly above, warm wood and navy #1a2744 screen against orange #f97316 accents, bold French overlay text in orange centred across the bottom reading "Gardez le carnet. Ajoutez la preuve.", vertical 9:16 format.
```

**Animation image → vidéo**

PLAN 1 (1,4 s) : push-in rapide mais contrôlé de 100 % à 118 % en 1,4 s, la bande de lumière glisse légèrement sur la page — l'accélération donne le hook. Coupe sèche. PLAN 2 (4,6 s) : plan fixe, seule la main est animée en écriture réelle, léger drift latéral de 3 px. Transition : coupe sur le son du stylo. PLAN 3 (5 s) : parallax léger, le téléphone descend de 10 px vers le reçu, flash blanc de 2 images à 9,5 s au moment de la photo. Transition : le flash sert de coupe. PLAN 4 (7 s) : les quatre cartes apparaissent en cascade de bas en haut sur 1,5 s, puis la barre « taux de recouvrement » se remplit de 0 % à 92 % en 2 s, puis plan fixe 3 s. Transition : fondu enchaîné de 10 images. PLAN 5 (4 s) : zoom out vertical très lent de 115 % à 100 %, révélant les deux objets côte à côte ; la phrase finale s'écrit en deux temps (« Gardez le carnet. » puis « Ajoutez la preuve. »).

**Voix off / dialogue**

> (Voix off masculine sénégalaise, chaleureuse, respectueuse — version wolof à enregistrer sur le même montage) : « Ce carnet a raison depuis quinze ans. Personne ne dit le contraire. » (temps) « Mais le carnet ne relance pas le 3, le 7 et le 15 du mois. Et il laisse tranquille personne. » (temps) « Là, vous photographiez le reçu Wave. L'application le lit, sort la quittance, et envoie le rappel sur WhatsApp. » (temps) « Encaissé, en attente, en retard, taux de recouvrement. Sans ouvrir le carnet. » (temps) « Gardez le carnet. Ajoutez la preuve. »

### `TT-04` — Démo écran pure — pas d'acteur, pas d'histoire : un doigt, une interface, la mécanique du paiement conditionné à la preuve montrée en 20 secondes

**Cible :** Diaspora et Sénégal résident, 25-45 ans, en phase de considération (retargeting des vues à 75 % des créas émotionnelles)

**Accroche (les 1,5 première seconde) :** « Regardez le bouton. »

**Texte de l'annonce**

```
SCRIPT — 20 secondes, 5 plans, démo écran (style capture d'écran filmée)

PLAN 1 — 0,0 à 1,3 s
Plein écran : la frise des phases. Un doigt entre dans le cadre.
Texte incrusté : « Regardez le bouton. »

PLAN 2 — 1,3 à 6,0 s
Le doigt scrolle. Fondations : payée. Élévation : payée. Toiture : en attente.
Texte incrusté : « Deux phases payées. Une bloquée. »

PLAN 3 — 6,0 à 11,0 s
Le doigt appuie sur « Toiture ». La galerie s'ouvre : 0 photo. Le bouton reste gris.
Texte incrusté : « Pas de preuve, pas de bouton. »

PLAN 4 — 11,0 à 16,0 s
4 photos datées et rattachées à une phase se chargent. Le bouton orange s'allume : « Valider cette phase — 1 200 000 FCFA ».
Texte incrusté : « La preuve d'abord. L'argent ensuite. »

PLAN 5 — 16,0 à 20,0 s
Bandeau explicatif sous le bouton.
Texte incrusté : « Les fonds restent chez Wave ou Orange Money. Locawave n'y touche jamais. »

SON : sound design d'interface uniquement — clics, glissements, un « pop » sur le chargement des photos, un son de déverrouillage grave sur l'activation du bouton. Nappe électronique minimale en fond, aucun vocal. Type ASMR d'interface : c'est ce qui fait rester sur ce format.
```

**Texte à incruster dans le visuel :** `Pas de preuve, pas de bouton.`

**Appel à l'action :** Lien en bio — essai gratuit. Créez un chantier, ajoutez une phase, voyez le bouton rester gris.

**Prompt image — NanoBanana Pro**

```text
PLAN 1 : Full-bleed vertical 9:16 screen capture of the Locawave French mobile app on a deep navy #1a2744 background, showing a header "Chantier — Diamniadio · R+1" and beneath it a vertical phase timeline with connected dots, a dark-skinned index finger entering from the bottom right corner of the frame about to touch the glass, ultra-crisp UI rendering with clean sans-serif French labels, subtle screen glare, shot as a straight-on device capture with no perspective distortion, orange #f97316 as the only accent colour, bold French overlay text in orange at the top reading "Regardez le bouton.", vertical 9:16 format.

PLAN 2 : Full-bleed vertical 9:16 screen capture of the same Locawave French app timeline mid-scroll, three rows fully legible: "Fondations" with a green check and "payée · 3 400 000 FCFA", "Élévation" with a green check and "payée · 5 100 000 FCFA", and "Toiture" greyed with an orange #f97316 clock icon and "en attente de votre validation · 1 200 000 FCFA", a dark-skinned thumb blurred in motion at the right edge, deep navy #1a2744 background, ultra-crisp UI, straight-on device capture, French overlay text in white at the bottom reading "Deux phases payées. Une bloquée.", vertical 9:16 format.

PLAN 3 : Full-bleed vertical 9:16 screen capture of the Locawave French app detail screen headed "Toiture", showing an empty photo gallery area with a dashed grey outline and the centred French message "Aucune photo reçue pour cette phase", and at the bottom a fully greyed-out disabled button reading "Valider cette phase", a dark-skinned fingertip pressing the dead button with a faint grey ripple, deep navy #1a2744 background, ultra-crisp UI rendering, straight-on device capture, French overlay text in orange #f97316 across the middle reading "Pas de preuve, pas de bouton.", vertical 9:16 format.

PLAN 4 : Full-bleed vertical 9:16 screen capture of the same Locawave French "Toiture" screen now populated with a two-by-two grid of four real photographs of a red-brown corrugated metal roof being installed on a concrete house in Diamniadio Senegal under bright dry-season sky, each thumbnail carrying a small white timestamp such as "7 juin · 16 h 12", and below them a fully active glowing orange #f97316 button reading "Valider cette phase — 1 200 000 FCFA", deep navy #1a2744 background, ultra-crisp UI, straight-on device capture, French overlay text in white at the top reading "La preuve d'abord. L'argent ensuite.", vertical 9:16 format.

PLAN 5 : Full-bleed vertical 9:16 screen capture of the Locawave French app zoomed on the bottom section, the active orange #f97316 button reading "Valider cette phase" with, directly beneath it, a small grey information banner with a lock-free shield icon and two lines of legible French text "Vous validez, puis vous payez." and "Locawave ne détient jamais votre argent.", deep navy #1a2744 background, ultra-crisp UI rendering, straight-on device capture with a slight screen bloom around the button, no hand in frame, French overlay text in white at the very top reading "Ne payez que ce que vous avez vu.", vertical 9:16 format.
```

**Animation image → vidéo**

PLAN 1 (1,3 s) : plan fixe absolu, seul le doigt entre dans le cadre par le bas en 0,5 s — la netteté brutale de l'interface est le hook. Coupe sèche. PLAN 2 (4,7 s) : scroll vertical simulé, l'image glisse de 18 % vers le haut en 1,2 s puis s'arrête net sur la ligne « Toiture », qui pulse une fois. Coupe sèche. PLAN 3 (5 s) : léger tremblement de 2 px au moment de l'appui sur le bouton mort (effet « refus »), zoom fixe, aucune autre animation — laisser durer 3 s, l'inconfort est volontaire. Transition : coupe sèche. PLAN 4 (5 s) : les quatre vignettes photo apparaissent une par une toutes les 0,25 s avec un léger scale-up 90 %→100 %, puis le bouton passe du gris à l'orange en 0,4 s avec un halo lumineux qui se diffuse. Transition : push-in de 100 % à 130 % vers le bas de l'écran. PLAN 5 (4 s) : plan fixe serré sur le bouton et le bandeau, très léger flottement de 1 px, le bandeau explicatif apparaît en fondu à 17,0 s et reste lisible 3 s pleines.

**Voix off / dialogue**

> Aucune voix off. Le format vit du sound design d'interface et du texte incrusté. Si une voix est ajoutée pour la version Sénégal, une seule phrase à 16,0 s : « Les fonds restent chez votre opérateur. Locawave n'y touche jamais. »

### `TT-05` — Humour situationnel sénégalais — le 5 du mois et les excuses recyclées, joué en trois répliques, où la chute est que le propriétaire arrête d'appeler

**Cible :** Cheikh Mbaye et tout bailleur résident au Sénégal, 30-55 ans, 2 à 8 logements

**Accroche (les 1,5 première seconde) :** « « Tonton, le réseau… » »

**Texte de l'annonce**

```
SCRIPT — 26 secondes, 6 plans, humour joué

PLAN 1 — 0,0 à 1,5 s
Gros plan sur un téléphone qui sonne dans le vide. Écran : « Appel 4 — Locataire ».
Texte incrusté : « 4e appel. Le 5 du mois. »

PLAN 2 — 1,5 à 6,0 s
Le propriétaire, dans sa cour, téléphone à l'oreille, patient, un peu las.
Texte incrusté : « Il connaît déjà la réponse. »

PLAN 3 — 6,0 à 11,0 s
Le locataire, dans un salon, répond avec un aplomb parfait.
Réplique incrustée : « Tonton, le réseau était mauvais. »

PLAN 4 — 11,0 à 15,0 s
Retour propriétaire, il ferme les yeux une seconde.
Texte incrusté : « Le réseau. Trois mois de suite. »

PLAN 5 — 15,0 à 22,0 s
Écran WhatsApp : les relances J+3, J+7, J+15 déjà parties toutes seules, ton croissant. Le propriétaire n'a rien tapé.
Texte incrusté : « J+3. J+7. J+15. Sans vous. »

PLAN 6 — 22,0 à 26,0 s
Le propriétaire pose le téléphone et boit son thé tranquillement.
Texte incrusté : « Et les bons payeurs, on leur fiche la paix. »

SON : mbalax rapide et sautillant en fond, coupé net au PLAN 4 (silence de 0,4 s sur les yeux fermés — c'est le gag), reprise au PLAN 5. Sonneries de téléphone réelles, notification WhatsApp authentique sur chaque relance.
```

**Texte à incruster dans le visuel :** `4e appel. Le 5 du mois.`

**Appel à l'action :** Lien en bio — essai gratuit. Vos relances partent toutes seules dès ce mois-ci.

**Prompt image — NanoBanana Pro**

```text
PLAN 1 : Extreme close-up vertical 9:16 of an Android phone lying face-up on a woven plastic mat in a Dakar courtyard, the screen showing an outgoing call in progress with the French label "Appel 4 — Locataire" and a running timer at "00:47", the phone visibly vibrating with a faint motion blur at its edge, bright hard midday Senegalese sun casting a sharp shadow of the phone across the mat, a green bougainvillea petal fallen beside it, shot on a 60mm macro lens at f/4 from directly above, saturated warm colours, bold French overlay text in orange #f97316 across the bottom reading "4e appel. Le 5 du mois.", vertical 9:16 format.

PLAN 2 : Medium vertical 9:16 shot of a 58-year-old Senegalese man in a white embroidered boubou and leather sandals standing in a walled Dakar courtyard with pink bougainvillea and a blue plastic chair, phone pressed to his ear, eyebrows raised in weary patience, faintly amused, bright dry-season sunlight from high left with strong shadows on the ochre wall, a navy #1a2744 painted gate behind him, shot on a 35mm lens at f/4 at chest height, French overlay text in white across the lower third reading "Il connaît déjà la réponse.", vertical 9:16 format.

PLAN 3 : Medium vertical 9:16 shot of a relaxed 32-year-old Senegalese man in a bright orange #f97316 patterned wax shirt sprawled comfortably on a brown sofa in a modest Dakar living room, phone held loosely to his ear, one hand raised in an entirely sincere explanatory gesture, a fan and a flat-screen TV behind him, warm indoor light mixed with strong daylight from a curtained window, shot on a 35mm lens at f/2.8, French overlay text in white in a speech-bubble style across the middle reading "Tonton, le réseau était mauvais.", vertical 9:16 format.

PLAN 4 : Tight vertical 9:16 close-up of the same 58-year-old Senegalese man's face in the courtyard, eyes closed for one long second, jaw set, phone still at his ear, an expression of total resigned recognition, hard midday sun rim-lighting his cheekbone against the ochre wall, shot on an 85mm lens at f/2.5 with shallow focus, French overlay text in orange #f97316 across the bottom reading "Le réseau. Trois mois de suite.", vertical 9:16 format.

PLAN 5 : Clean vertical 9:16 shot of an Android phone held in an older Senegalese man's hand, the screen showing a WhatsApp-style outgoing thread with three automatic French messages of escalating firmness clearly legible: "Bonjour, votre loyer de 150 000 FCFA est arrivé à échéance il y a 3 jours.", then "Rappel : 7 jours de retard sur le loyer de juin.", then "15 jours de retard. Merci de régulariser sous 48 h.", each with a delivered double-tick and a small orange #f97316 "envoyé automatiquement" tag, the reply field untouched and empty, warm courtyard light, shot on a 50mm lens at f/4, French overlay text in white at the bottom reading "J+3. J+7. J+15. Sans vous.", vertical 9:16 format.

PLAN 6 : Wide vertical 9:16 shot of the same Senegalese man in his white boubou now seated in the blue plastic chair in his courtyard, phone face down on a small table, calmly pouring foamy attaya tea from height into a small glass, bougainvillea and an ochre wall behind, late-afternoon golden Dakar light, shot on a 28mm lens at f/5.6 from slightly low, warm and generous palette with a navy #1a2744 gate in frame, French overlay text in orange #f97316 across the lower third reading "Et les bons payeurs, on leur fiche la paix.", vertical 9:16 format.
```

**Animation image → vidéo**

PLAN 1 (1,5 s) : vibration réelle animée sur 3 cycles + push-in rapide de 100 % à 115 % — mouvement nerveux, c'est un hook comique. Coupe sèche sur la sonnerie. PLAN 2 (4,5 s) : plan quasi fixe, léger balancement handheld, le personnage change d'appui. Coupe sèche. PLAN 3 (5 s) : whip-pan d'entrée de 4 images (transition dynamique entre les deux lieux), puis plan stable avec la main qui gesticule. Whip-pan retour de 4 images. PLAN 4 (4 s) : plan fixe absolu, yeux fermés 1,2 s, coupure totale du son — ne rien animer d'autre, le vide fait le rire. Coupe sèche. PLAN 5 (7 s) : les trois bulles de relance apparaissent une par une toutes les 0,8 s avec un son de notification à chaque fois, puis lent push-in sur le champ de saisie vide. Transition : fondu enchaîné de 8 images. PLAN 6 (4 s) : plan large fixe avec le filet de thé animé en boucle, très léger zoom out de 108 % à 100 % ; la phrase finale monte du bas du cadre.

**Voix off / dialogue**

> (Dialogue joué, français teinté de wolof, jamais méchant) — LE PROPRIÉTAIRE : « Allô. Bonjour. C'est pour le loyer. » — LE LOCATAIRE, très détendu : « Tonton ! Le réseau était mauvais, je t'ai appelé, ça ne passait pas. » — LE PROPRIÉTAIRE, après un temps : « Le réseau. Trois mois de suite. » (silence) — VOIX OFF, calme : « Maintenant, c'est l'application qui relance. Le 3, le 7, le 15. Ton de plus en plus ferme. Et ceux qui paient à l'heure, on leur fiche la paix. »

### `TT-06` — Témoignage face caméra, tourné sans décor publicitaire — un homme devant la maison qu'il a fait construire à 5 000 km, qui dit ce que la marque ne dira jamais

**Cible :** Ousmane Diallo et la diaspora sénégalaise d'Italie, France, Espagne — hommes 35-55 ans en cours de construction

**Accroche (les 1,5 première seconde) :** « Je n'osais pas demander. »

**Texte de l'annonce**

```
SCRIPT — 30 secondes, 5 plans, témoignage première personne

PLAN 1 — 0,0 à 1,5 s
Homme debout devant une R+1 terminée à Diamniadio. Il regarde l'objectif. Vent.
Texte incrusté : « Je n'osais pas demander de photos. »

PLAN 2 — 1,5 à 9,0 s
Il raconte : 19 ans en Italie, un chantier supervisé de loin, plus de 20 millions FCFA envoyés.
Texte incrusté : « 19 ans dehors. Une maison jamais vue. »

PLAN 3 — 9,0 à 17,0 s
Il dit la vraie peur : passer pour celui qui ne fait pas confiance.
Texte incrusté : « J'avais peur de vexer, pas de perdre. »

PLAN 4 — 17,0 à 25,0 s
Il montre son téléphone : la frise des phases, chaque validation datée.
Texte incrusté : « J'ai payé la toiture le jour où je l'ai vue. »

PLAN 5 — 25,0 à 30,0 s
Plan large, il entre dans la maison. Personne ne commente.
Texte incrusté : « Ce n'est pas de la méfiance. C'est de la clarté. »

SON : aucune musique jusqu'à 17,0 s — uniquement le vent, le son direct, des voix d'enfants au loin. Kora seule à partir du PLAN 4, montée douce jusqu'à la fin. Ne jamais mettre de musique publicitaire sur un témoignage : ça le tue.
```

**Texte à incruster dans le visuel :** `Je n'osais pas demander de photos.`

**Appel à l'action :** Lien en bio — essai gratuit. Découpez votre chantier en phases avant d'envoyer le prochain virement.

**Prompt image — NanoBanana Pro**

```text
PLAN 1 : Medium vertical 9:16 documentary portrait of a 47-year-old Senegalese man with short greying hair, wearing a simple navy #1a2744 polo shirt, standing in the sandy foreground with a newly completed two-storey concrete house with a red-brown corrugated roof and unpainted boundary wall behind him in Diamniadio Senegal, looking straight into the lens without smiling, dust and wind lifting slightly, harsh but beautiful late-afternoon dry-season sunlight from behind camera left, shot on a 35mm lens at f/2.8 handheld with a natural unpolished documentary feel and no production lighting, bold French overlay text in white across the lower third reading "Je n'osais pas demander de photos.", vertical 9:16 format.

PLAN 2 : Tight vertical 9:16 handheld portrait of the same 47-year-old Senegalese man from the chest up, talking, one hand gesturing low, his face lined and honest, the out-of-focus house and a white sky behind him, a small orange #f97316 detail on his shirt collar trim, wind moving his shirt, natural harsh sunlight with real shadow under the brow, shot on a 50mm lens at f/2 with slight handheld drift and no colour grading polish, French overlay text in orange #f97316 across the bottom reading "19 ans dehors. Une maison jamais vue.", vertical 9:16 format.

PLAN 3 : Very tight vertical 9:16 close-up of the same man's face slightly turned away from the lens, eyes lowered then returning, jaw tense, real emotion without performance, the blurred concrete wall of the house filling the background in warm ochre tones, golden hour side light raking across his cheek, shot on an 85mm lens at f/1.8 handheld with breathing framing, French overlay text in white centred low reading "J'avais peur de vexer, pas de perdre.", vertical 9:16 format.

PLAN 4 : Vertical 9:16 over-the-shoulder shot of the same man holding up his phone toward the camera in front of the finished house, the screen clearly showing the Locawave French app phase timeline with "Fondations — validée le 14 janvier", "Élévation — validée le 2 avril", "Toiture — validée le 7 juin · 1 200 000 FCFA" each with a green check on a navy #1a2744 background and orange #f97316 accents, his thumb resting beside the screen, warm late-afternoon Senegalese light with the real roof visible above the phone in the same frame, shot on a 35mm lens at f/4, French overlay text in white at the bottom reading "J'ai payé la toiture le jour où je l'ai vue.", vertical 9:16 format.

PLAN 5 : Wide vertical 9:16 shot from behind of the same 47-year-old Senegalese man walking away from camera across sandy ground toward the open doorway of his finished two-storey house in Diamniadio, arms loose at his sides, two children's bicycles leaning against the wall, long shadows stretching toward the lens, warm golden dry-season light and a wide pale sky, shot on a 28mm lens at f/5.6 from low, unhurried and undramatic, bold French overlay text in orange #f97316 across the lower third reading "Ce n'est pas de la méfiance. C'est de la clarté.", vertical 9:16 format.
```

**Animation image → vidéo**

PLAN 1 (1,5 s) : plan quasi fixe avec micro-drift handheld de 4 px et vent animé sur le vêtement — surtout ne pas zoomer, l'authenticité tient à l'absence d'effet. Coupe sèche. PLAN 2 (7,5 s) : léger flottement caméra à l'épaule, respiration de cadre de 2 %, aucun zoom. Coupe sèche (jump cut assumé, on laisse voir le montage). PLAN 3 (8 s) : push-in très lent de 100 % à 110 % sur 8 s, imperceptible, qui accompagne l'aveu. Transition : coupe sèche. PLAN 4 (8 s) : la main monte le téléphone dans le cadre en 1 s, puis pan vertical de l'écran vers le vrai toit au-dessus pour raccorder la preuve à la réalité (2 s), retour sur l'écran. Transition : fondu enchaîné de 12 images. PLAN 5 (5 s) : léger travelling arrière de 6 % pendant qu'il marche, l'ombre s'allonge ; la phrase finale apparaît à 27,0 s et reste 3 s. Pas de logo animé : carton fixe bleu marine 1,5 s.

**Voix off / dialogue**

> (Son direct, voix masculine, accent sénégalais teinté d'italien, hésitations conservées au montage) : « Dix-neuf ans que je suis en Italie. Cette maison, je l'ai payée pierre par pierre sans jamais la voir. » (temps) « Le plus dur, ce n'était pas l'argent. C'était de demander. Chez nous, tu demandes des photos, on te regarde autrement. Alors je payais et je me taisais. » (temps) « Maintenant, ce n'est plus moi qui demande. Fondations, élévation, toiture : chaque phase, ses photos, et je valide. J'ai payé la toiture le jour où je l'ai vue. » (temps) « Et celui qui travaille là-bas, il est payé plus vite, sans discussion. Ce n'est pas de la méfiance. C'est de la clarté. »

### `TT-07` — Format listicle éducatif — « 3 erreurs que font les propriétaires au Sénégal », dont une erreur juridique vraie et gratuite (le bail verbal et l'état des lieux)

**Cible :** Bailleurs résidents au Sénégal et petits propriétaires diaspora, 30-55 ans, 1 à 6 logements

**Accroche (les 1,5 première seconde) :** « Erreur numéro un. »

**Texte de l'annonce**

```
SCRIPT — 29 secondes, 6 plans, listicle

PLAN 1 — 0,0 à 1,5 s
Plan serré, un homme lève un doigt, direct caméra.
Texte incrusté : « 3 erreurs qui coûtent cher. »

PLAN 2 — 1,5 à 9,0 s
ERREUR 1 — Le bail verbal.
Texte incrusté : « 1. Louer sans bail écrit. »
Sous-titre : « Première source de litige. »

PLAN 3 — 9,0 à 16,0 s
ERREUR 2 — Pas d'état des lieux d'entrée.
Texte incrusté : « 2. Aucun état des lieux. »
Sous-titre : « Sans lui, vous ne pouvez rien retenir sur la caution. »

PLAN 4 — 16,0 à 23,0 s
ERREUR 3 — Relancer tout le monde pareil.
Texte incrusté : « 3. Harceler ceux qui paient bien. »
Sous-titre : « Vous abîmez vos meilleurs locataires. »

PLAN 5 — 23,0 à 27,0 s
Écran : score de ponctualité 94/100 sur un locataire, aucune relance envoyée.
Texte incrusté : « 94/100. Zéro relance. »

PLAN 6 — 27,0 à 29,0 s
Carton final.
Texte incrusté : « Écrit, daté, prouvé. »

SON : beat afro-house sobre à 100 BPM, un "switch" sonore net à chaque changement d'erreur (1, 2, 3) — c'est ce rythme qui tient la rétention sur un listicle. Baisse du volume sous la voix.
```

**Texte à incruster dans le visuel :** `3 erreurs qui coûtent cher.`

**Appel à l'action :** Lien en bio — essai gratuit. Bail, état des lieux, quittances : tout est écrit dès le premier locataire.

**Prompt image — NanoBanana Pro**

```text
PLAN 1 : Tight vertical 9:16 portrait of a 40-year-old Senegalese man with a short beard wearing a crisp navy #1a2744 shirt, standing against a plain sunlit ochre wall in Dakar, looking straight into the lens with a direct confident expression and raising one index finger at chest height, hard bright dry-season daylight from the left with a clean shadow on the wall, shot on a 50mm lens at f/2.8 slightly below eye level, high-contrast punchy grade, bold French overlay text in orange #f97316 across the lower third reading "3 erreurs qui coûtent cher.", vertical 9:16 format.

PLAN 2 : Vertical 9:16 close-up of two dark-skinned hands shaking over a bare table with absolutely no document between them, one hand in a wax sleeve and the other in a plain shirt cuff, the empty wooden surface dominating the lower half of the frame, warm hard Dakar daylight from a window casting a strong diagonal shadow, shot on a 50mm lens at f/3.5, French overlay text stacked in the upper third, the first line large in white reading "1. Louer sans bail écrit." and a smaller orange #f97316 second line reading "Première source de litige.", vertical 9:16 format.

PLAN 3 : Vertical 9:16 interior shot of an empty freshly rented Dakar apartment room with bare tiled floor, a chipped painted wall, an old air-conditioning unit and a single closed window with a torn curtain, a small stain visible near the skirting board, no people in frame, flat bright natural daylight, shot on a 24mm lens at f/5.6 from doorway height, slightly cold and clinical palette against navy #1a2744 shadows, French overlay text stacked in the middle, the first line large in white reading "2. Aucun état des lieux." and a smaller orange #f97316 second line reading "Sans lui, vous ne pouvez rien retenir sur la caution.", vertical 9:16 format.

PLAN 4 : Vertical 9:16 shot of a phone screen showing a French call log with five identical outgoing calls to the same contact named "Locataire — Appt 2" all on the same day, each timestamped between "08 h 12" and "19 h 44", held in a Senegalese man's hand over a courtyard table, harsh midday light, shot on a 50mm lens at f/4, French overlay text stacked at the bottom, the first line large in white reading "3. Harceler ceux qui paient bien." and a smaller orange #f97316 second line reading "Vous abîmez vos meilleurs locataires.", vertical 9:16 format.

PLAN 5 : Clean vertical 9:16 screen shot of the Locawave French app on a navy #1a2744 background showing a tenant card headed "Mamadou D. — Appt 2", a large circular gauge filled in green reading "Score de ponctualité 94/100", a line below reading "Payé le 2 du mois, 11 mois de suite" and a grey status pill reading "Aucune relance envoyée", ultra-crisp UI rendering with orange #f97316 accents, straight-on device capture, French overlay text in white at the very bottom reading "94/100. Zéro relance.", vertical 9:16 format.

PLAN 6 : Vertical 9:16 graphic end card, a flat deep navy #1a2744 background with a subtle paper grain, centred bold French text in white reading "Écrit, daté, prouvé." and beneath it in orange #f97316 the line "Locawave", plus a small legible line in grey at the bottom reading "Essai gratuit · 10 000 FCFA/mois", clean modern sans-serif typography with generous spacing, no photograph, vertical 9:16 format.
```

**Animation image → vidéo**

PLAN 1 (1,5 s) : zoom rapide de 115 % à 100 % en 0,4 s (effet punch-in inversé) puis fixe — le hook doit claquer avant 1,5 s. Coupe sur le beat. PLAN 2 (7,5 s) : push-in lent sur la table vide entre les deux mains, 100 % à 112 % ; le titre « 1. » entre par la gauche en 0,3 s. Transition : glissement horizontal rapide (slide left) de 5 images. PLAN 3 (7 s) : pan latéral lent de droite à gauche dans la pièce vide, 12 % de la largeur, révélant la tache au ras du mur ; le titre « 2. » entre par la gauche. Transition : slide left de 5 images. PLAN 4 (7 s) : scroll vertical du journal d'appels, les 5 appels défilent en 1,5 s puis arrêt ; le titre « 3. » entre par la gauche. Transition : coupe sèche. PLAN 5 (4 s) : la jauge se remplit de 0 à 94 en 1,2 s avec un son de validation, puis la pastille « Aucune relance envoyée » apparaît en fondu. Transition : fondu au bleu marine de 6 images. PLAN 6 (2 s) : carton fixe, seules les trois mots apparaissent en cascade sur 0,6 s.

**Voix off / dialogue**

> (Voix masculine sénégalaise, rythme rapide, ton de conseil entre pairs — version wolof à enregistrer sur le même montage) : « Trois erreurs qui coûtent cher aux propriétaires ici. » (temps) « Un : louer sans bail écrit. Le contrat verbal, c'est la première source de litige. Le jour du désaccord, vous n'avez rien. » (temps) « Deux : pas d'état des lieux d'entrée. Sans état des lieux contradictoire, vous ne pouvez rien retenir sur la caution. Rien. » (temps) « Trois : relancer tout le monde de la même façon. Celui qui paie le 2 chaque mois, si vous le harcelez, vous le perdez. » (temps) « Score de ponctualité 94 sur 100 : zéro relance envoyée. Écrit, daté, prouvé. »

### `TT-08` — Chantier en time-lapse par phases — la maison qui se construit, mais rythmée par les validations : ce n'est pas le temps qui avance, c'est la preuve

**Cible :** Diaspora Europe et USA en cours de construction, 30-50 ans — et prescripteurs (frères, cousins) qui envoient la vidéo

**Accroche (les 1,5 première seconde) :** « Regardez-la monter. »

**Texte de l'annonce**

```
SCRIPT — 25 secondes, 6 plans, time-lapse séquencé

PLAN 1 — 0,0 à 1,5 s
Terrain nu, sable, piquets, cordeau. Rien encore.
Texte incrusté : « Jour 1. Il est à 5 000 km. »

PLAN 2 — 1,5 à 7,0 s
Fondations coulées, ferraillage. Bandeau de validation.
Texte incrusté : « Fondations — validée · 3 400 000 FCFA »

PLAN 3 — 7,0 à 12,0 s
Élévation, parpaings au premier niveau, ouvriers avec casques.
Texte incrusté : « Élévation — validée · 5 100 000 FCFA »

PLAN 4 — 12,0 à 16,0 s
Rupture : le chantier est là mais rien ne bouge. Alerte sur écran verrouillé.
Texte incrusté : « Aucune photo de votre chantier depuis 7 jours. »

PLAN 5 — 16,0 à 21,0 s
Les photos arrivent : la charpente puis la toiture posée. Le bouton s'allume.
Texte incrusté : « Toiture — vue, puis payée. »

PLAN 6 — 21,0 à 25,0 s
La maison terminée au coucher du soleil, lumière allumée à l'étage.
Texte incrusté : « Ne payez que ce que vous avez vu. »

SON : percussions sabar qui accélèrent phase après phase, coupées NET à 12,0 s (silence total de 1 s sur l'alerte — c'est le moment le plus mémorisé de la vidéo), reprise progressive au PLAN 5, apogée mélodique sur la maison finie.
```

**Texte à incruster dans le visuel :** `Aucune photo de votre chantier depuis 7 jours.`

**Appel à l'action :** Lien en bio — essai gratuit. Créez votre chantier, ajoutez vos phases, fixez le montant de chacune.

**Prompt image — NanoBanana Pro**

```text
PLAN 1 : Wide vertical 9:16 shot of an empty sandy building plot in Diamniadio Senegal at sunrise, wooden survey stakes and taut white string lines marking the future foundations, a single wheelbarrow and a stack of grey concrete blocks at the edge, flat scrubland and a distant half-built R+2 on the horizon, soft pink-orange early dry-season light and long shadows, shot on a 24mm lens at f/8 from a low tripod height with great depth of field, wide pale sky, bold French overlay text in white across the lower third reading "Jour 1. Il est à 5 000 km.", vertical 9:16 format.

PLAN 2 : Wide vertical 9:16 shot of the same Diamniadio plot from the identical camera position now showing completed poured concrete foundations with exposed steel reinforcement bars rising in a grid, damp grey concrete, two Senegalese workers in orange #f97316 hard hats and dusty work clothes walking across the slab, hard mid-morning sunlight and crisp shadows, shot on a 24mm lens at f/8, a clean semi-transparent navy #1a2744 banner across the top of the frame carrying French text in white and a green check reading "Fondations — validée · 3 400 000 FCFA", vertical 9:16 format.

PLAN 3 : Wide vertical 9:16 shot from the identical camera position on the same Diamniadio plot, now showing the ground-floor walls fully raised in grey concrete blocks with window openings framed and a wooden scaffold along one side, three Senegalese masons in orange #f97316 hard hats working on the top course, bright hard midday dry-season light with strong shadows and dust in the air, shot on a 24mm lens at f/8, a clean semi-transparent navy #1a2744 banner across the top carrying French text in white and a green check reading "Élévation — validée · 5 100 000 FCFA", vertical 9:16 format.

PLAN 4 : Vertical 9:16 close-up of a smartphone lock screen glowing in a dark room at night, deep navy #1a2744 wallpaper, a single notification card at the centre with a small orange #f97316 app icon and legible French text reading "Locawave · maintenant" on the first line and "Aucune photo de votre chantier depuis 7 jours." on the second, the time "23:41" and the date "14 mai" above, the phone resting on a bedside table with a blurred window and cold blue European night light behind, shot on a 60mm macro lens at f/2.8, French overlay text in white at the very bottom reading "Le silence déclenche une alerte.", vertical 9:16 format.

PLAN 5 : Wide vertical 9:16 shot from the identical Diamniadio camera position showing the house now topped with a completed red-brown corrugated metal roof over a visible timber frame, two workers on the roof edge in orange #f97316 hard hats, bright hard afternoon light and a deep blue dry-season sky, shot on a 24mm lens at f/8, with a phone-shaped inset in the lower right corner showing the Locawave French app where a glowing active orange #f97316 button reads "Valider cette phase — 1 200 000 FCFA", French overlay text in white across the top reading "Toiture — vue, puis payée.", vertical 9:16 format.

PLAN 6 : Wide vertical 9:16 shot from the identical camera position of the now finished two-storey house in Diamniadio at dusk, walls freshly rendered and painted cream with a navy #1a2744 gate, one warm light glowing in an upstairs window, a young boy's bicycle against the wall, deep orange and violet dry-season sunset sky behind, shot on a 24mm lens at f/5.6 with rich contrast between the warm interior light and the cooling sky, bold French overlay text in orange #f97316 across the lower third reading "Ne payez que ce que vous avez vu.", vertical 9:16 format.
```

**Animation image → vidéo**

PLAN 1 (1,5 s) : très léger push-in de 100 % à 106 %, ciel animé en time-lapse rapide (nuages qui filent) — le mouvement du ciel signale d'emblée le format time-lapse. Coupe sèche sur le premier temps de sabar. PLAN 2 (5,5 s) : morph/fondu enchaîné de 10 images depuis le PLAN 1 pour garder l'illusion du même cadre, ouvriers animés en boucle, le bandeau de validation glisse depuis le haut en 0,4 s. Enchaîné identique. PLAN 3 (5 s) : même fondu enchaîné de 10 images, léger parallax sur la poussière, bandeau qui glisse en 0,4 s. Transition : COUPE NOIRE de 8 images, son coupé — rupture volontaire. PLAN 4 (4 s) : plan fixe absolu sur l'écran verrouillé, la notification apparaît par le haut avec un rebond de 0,3 s, halo lumineux qui pulse deux fois, aucun autre mouvement ; laisser durer 3 s pleines. Transition : fondu au blanc de 4 images. PLAN 5 (5 s) : retour au cadre du chantier avec push-in de 100 % à 112 %, l'encart téléphone entre par la droite en 0,5 s, le bouton passe au orange à 19,0 s avec un flare. Transition : fondu enchaîné long de 16 images (le jour tombe). PLAN 6 (4 s) : time-lapse du ciel au coucher animé sur 3 s, la lumière de l'étage s'allume à 23,0 s, très léger zoom out de 105 % à 100 %, phrase finale en fondu sur 0,6 s.

**Voix off / dialogue**

> (Voix off masculine, sobre, rythmée sur les phases) : « Jour 1. Un terrain, des piquets, et un homme à cinq mille kilomètres. » (temps) « Fondations : vues, validées, payées. » (temps) « Élévation : vues, validées, payées. » (silence de 1 seconde) « Puis plus rien. Sept jours sans une photo. Ce n'est plus lui qui s'inquiète tout seul : c'est le chantier qui le prévient. » (temps) « La toiture arrive. Il la voit. Il valide. Elle est payée. » (temps) « Ne payez que ce que vous avez vu. »

---

## Recrutement des prestataires (maçons, plombiers, électriciens, chefs de chantier) — Facebook feed 1:1, Facebook Reels et TikTok 9:16

> **Note stratégique.** Ordre de diffusion recommandé : PRE-03 (« Je te paierai à la fin. ») et PRE-05 (« Il est à Bergame. ») en tête de test — ce sont les deux seules créas qui parlent d'argent réellement gagné, donc les deux qui feront lever la main. PRE-01 et PRE-04 servent à la conversion des indécis une fois qu'ils ont déjà croisé la marque : elles vendent le statut, pas le chantier. PRE-02 est la créa de démonstration à réserver au retargeting de ceux qui ont ouvert une conversation WhatsApp sans finaliser.\n\nTrois garde-fous de production. Un : ne jamais laisser entendre que Locawave garantit le paiement ou détient les fonds — la formulation exacte, à ne pas déformer dans les commentaires ni dans les réponses WhatsApp, est que le montant n'est dû qu'après validation et se règlue à la validation du propriétaire. Deux : ne montrer aucun mauvais payeur, aucun client de dos qui s'enfuit, aucun visage coupable — l'adversaire est la parole non écrite, jamais une personne, sinon la créa se retourne contre nos propres propriétaires. Trois : la commission de 5 % sur les travaux doit être annoncée honnêtement dès la première réponse WhatsApp, pas découverte après l'inscription ; auprès d'un artisan, une surprise tarifaire tue la recommandation, et cette cible ne recrute que par recommandation.\n\nDestination unique : click-to-WhatsApp. Un artisan ne remplit pas un formulaire web, et le KYC obligatoire se collecte bien plus vite en conversation (pièce d'identité photographiée, métier, zone, photos de deux chantiers livrés). Le KPI à suivre n'est ni le clic ni le like mais le nombre de profils réellement vérifiés par semaine, et le délai médian entre premier message et validation KYC. Objectif implicite de la séquence : constituer un annuaire assez fourni pour que la campagne diaspora tienne sa promesse — sans une offre vérifiée en place, PRE-05 devient un mensonge le jour où un propriétaire de Bergame ouvrira l'annuaire et n'y trouvera personne dans sa commune.

### `PRE-01` — La fierté du métier — l'annuaire vérifié transforme l'ouvrage en preuve publique. On ne parle pas de plateforme, on parle de ce qu'il a construit.

**Cible :** Maçon / chef de chantier expérimenté, 35-55 ans, Dakar et régions, réputation construite au bouche-à-oreille, présent sur WhatsApp et Facebook.

**Accroche (les 1,5 première seconde) :** « Votre ouvrage parle. »

**Texte de l'annonce**

```
Votre ouvrage parle. Mais il ne parle qu'à ceux qui passent devant.

Vous avez monté des murs qui tiennent depuis quinze ans. Vous avez livré des chantiers propres, dans les délais. Et pourtant, chaque nouveau client vous découvre comme si vous débutiez.

L'annuaire Locawave existe pour ça : un profil vérifié, vos chantiers en photos, vos avis clients, votre métier et votre zone d'intervention. Les propriétaires — à Dakar comme en France, en Italie ou en Espagne — cherchent dedans avant d'appeler.

Être vérifié, c'est être choisi.

La vérification d'identité (KYC) est obligatoire pour figurer dans l'annuaire. C'est exigeant, et c'est exactement ce qui fait sa valeur : le client sait qui il appelle.

Inscrivez votre profil. Laissez votre travail parler plus fort.
```

**Texte à incruster dans le visuel :** `VOTRE OUVRAGE PARLE.`

**Appel à l'action :** Écrivez-nous sur WhatsApp pour créer votre profil vérifié.

**Prompt image — NanoBanana Pro**

```text
Square 1:1 medium portrait of a proud 47-year-old West African Senegalese master mason with deep dark skin, close-cropped greying beard and calm confident eyes, arms crossed over his chest, wearing a dust-marked navy blue #1a2744 long-sleeve work shirt with rolled-up sleeves and an orange #f97316 hard hat tilted back on his head, standing in the foreground on the packed red sand of a Diamniadio plot in front of a freshly completed R+1 concrete-block house with clean grey rendered walls, new metal roof sheets and empty window frames, a wheelbarrow and neat stacks of hollow blocks softly out of focus behind him, bright dry-season late-morning sunlight raking across the facade and catching the cement dust in the air, shot on a 50mm lens at f/2.8 with shallow depth of field and natural skin texture, warm ochre and dusty grey palette punctuated by the orange #f97316 helmet and navy #1a2744 shirt, clean bold French sans-serif text overlaid across the lower third in white with the words "VOTRE OUVRAGE PARLE." and directly beneath it a small orange #f97316 rounded badge containing the white words "Profil vérifié", photorealistic documentary advertising photography, square 1:1 format.
```

**Animation image → vidéo**

Slow push-in de 4 secondes vers le visage du maçon (léger, 8 % de zoom), avec un très discret parallax de la maison en arrière-plan qui recule. À la seconde 3, le badge orange « Profil vérifié » apparaît en fondu-échelle rapide (0,3 s). Maintenir 1 seconde. Transition sortante : coupe franche sur noir de 2 images, puis plan suivant.

**Voix off / dialogue**

> Voix off masculine, française teintée de wolof, posée, sans emphase publicitaire : « Ton travail, tout le monde le voit. Mais personne ne sait que c'est toi. Sur Locawave, ton profil est vérifié, tes chantiers sont en photos, tes clients laissent leur avis. Être vérifié, c'est être choisi. »

### `PRE-02` — Le paiement par phase validée, raconté du côté de l'artisan : ce n'est pas un contrôle imposé, c'est une garantie d'être payé phase après phase au lieu d'attendre la fin.

**Cible :** Chef de chantier ou maçon qui travaille pour des propriétaires diaspora, habitué à courir après les tranches de paiement.

**Accroche (les 1,5 première seconde) :** « Phase validée. Phase payée. »

**Texte de l'annonce**

```
Phase validée. Phase payée.

Sur un chantier Locawave, le travail est découpé en phases : fondations, élévation, toiture, finitions. À la fin de chaque phase, vous soumettez vos photos et vos vidéos depuis votre téléphone. Le propriétaire regarde, valide — et c'est alors qu'il règle cette phase.

Pas à la fin du chantier. À la fin de la phase.

Locawave ne détient jamais votre argent. Le montant devient dû après validation, et il part vers vous dès la validation. Vous ne dépendez plus d'un appel, d'un rappel, d'une promesse.

Vous montrez. Vous êtes payé. Vous passez à la suite.
```

**Texte à incruster dans le visuel :** `PHASE VALIDÉE. PHASE PAYÉE.`

**Appel à l'action :** Rejoignez l'annuaire des prestataires vérifiés — écrivez-nous sur WhatsApp.

**Prompt image — NanoBanana Pro**

```text
Vertical 9:16 tight close-up of the strong cement-dusted hands of a 40-year-old West African Senegalese builder holding a smartphone at chest height, his dark skin scratched and calloused, a frayed orange #f97316 wristband on his left wrist and the sleeve of a navy blue #1a2744 work jacket visible at the edge of frame, the bright phone screen filling the centre of the image and clearly displaying a French mobile app interface on a navy #1a2744 background with the white header "Chantier — Villa Ngor" and a vertical list of phases each on its own row: "Fondations — payée" with a small grey check, "Élévation — validée par le propriétaire" with a bright orange #f97316 check, and beneath it an orange #f97316 rounded banner with white text "Phase validée · 1 250 000 FCFA à régler", behind the phone a softly blurred half-built concrete-block wall of a Diamniadio construction site with reinforcement bars against a pale dry-season sky, warm late-afternoon sunlight from the left rimming the fingers, shot on an 85mm macro lens at f/4 with the screen perfectly legible and the background melting away, bold white French sans-serif text across the top of the frame reading "PHASE VALIDÉE. PHASE PAYÉE.", photorealistic advertising photography, vertical 9:16 format.
```

**Animation image → vidéo**

Plan de 5 secondes. Départ sur un très léger travelling latéral droite-gauche (3 %) pour donner du poids aux mains, puis zoom progressif sur l'écran du téléphone (de 100 % à 135 %) entre la seconde 1 et la seconde 4, cadrant en fin de mouvement uniquement la bannière orange « Phase validée · 1 250 000 FCFA à régler ». Micro-shake de main volontaire pour l'authenticité. Transition sortante : flash blanc de 3 images.

**Voix off / dialogue**

> Voix off masculine calme : « Tu finis l'élévation. Tu prends tes photos. Le propriétaire valide. Et l'argent de cette phase part. Pas à la fin du chantier — à la fin de la phase. »

### `PRE-03` — La douleur nue du travail non payé, dite avec la phrase que tous ont entendue. Aucune accusation, aucun mauvais payeur montré : l'adversaire est la promesse orale.

**Cible :** Électricien, plombier, carreleur indépendant, 28-45 ans, qui a déjà perdu des semaines de travail sur une parole donnée.

**Accroche (les 1,5 première seconde) :** « « Je te paierai à la fin. » »

**Texte de l'annonce**

```
« Je te paierai à la fin. »

Vous connaissez la phrase. Vous connaissez aussi ce qui vient après : le chantier qui s'arrête, le client qu'on ne joint plus, les journées travaillées qui ne rentrent nulle part.

Ce n'est pas un problème d'honnêteté. C'est un problème d'écrit.

Sur Locawave, rien ne repose sur une parole. Le chantier est découpé en phases, chaque phase a un montant en FCFA fixé à l'avance, et cette phase vous est due dès que le propriétaire a validé vos preuves. Les échanges restent dans la messagerie de l'application — donc ils existent encore dans six mois. En cas de désaccord, il y a une médiation, et il y a des dates.

Vous n'aurez plus à faire confiance à une phrase.
```

**Texte à incruster dans le visuel :** `« Je te paierai à la fin. »`

**Appel à l'action :** Créez votre profil vérifié — écrivez-nous sur WhatsApp.

**Prompt image — NanoBanana Pro**

```text
Vertical 9:16 wide portrait of a tired 33-year-old West African Senegalese electrician sitting alone on a stack of grey hollow concrete blocks at the end of the day, dark skin, short hair, a navy blue #1a2744 polo shirt marked with plaster, coils of electrical cable and a pair of pliers resting beside him, an orange #f97316 helmet set down on the ground at his feet, looking down at a switched-off phone in his hand, surrounded by an unfinished ground-floor concrete structure in a Dakar suburb with bare block walls, exposed conduit and a bare bulb hanging from a wire, deep golden dry-season dusk light entering low from behind through the empty window openings and silhouetting his shoulders, dust suspended in the air, shot on a 35mm lens at f/2 with a slightly desaturated warm palette of concrete grey and amber and the orange #f97316 helmet as the only strong accent, large white French sans-serif text overlaid across the upper third reading "« Je te paierai à la fin. »", photorealistic cinematic documentary photography, vertical 9:16 format.
```

**Animation image → vidéo**

Plan lent de 6 secondes : push-in très progressif (5 %) accompagné d'un léger tilt vers le bas de l'électricien vers le casque orange posé au sol. La poussière et la lumière rasante doivent bouger légèrement (animation subtile de particules). Le texte reste fixe et immobile pendant tout le plan, puis disparaît en coupe sèche. Transition sortante : coupe directe sur le plan produit (frise des phases) pour créer le contraste douleur → solution.

**Voix off / dialogue**

> Voix off masculine, grave, sans musique sur les trois premières secondes : « Cette phrase-là, tu l'as déjà entendue. » Pause. « Sur Locawave, chaque phase a un montant écrit à l'avance, et le paiement part quand ton travail est validé. Plus rien ne repose sur une parole. »

### `PRE-04` — La réputation qui se prouve : seuls les clients qui ont réellement travaillé avec vous peuvent vous noter. Le bouche-à-oreille devient un actif qui vous suit.

**Cible :** Plombier ou carreleur installé, bonne réputation locale, qui repart de zéro à chaque nouveau quartier ou nouveau client.

**Accroche (les 1,5 première seconde) :** « 14 avis. 14 vrais clients. »

**Texte de l'annonce**

```
14 avis. 14 vrais clients.

Sur Locawave, personne ne peut vous noter sans avoir réellement travaillé avec vous. Pas de faux commentaires, pas de concurrent qui abîme votre nom, pas d'inconnu qui donne son opinion sur un chantier qu'il n'a jamais vu.

Chaque avis est rattaché à un chantier réel, avec ses phases, ses photos et ses dates.

Résultat : votre réputation arrête d'être une rumeur et devient une preuve. Elle vous suit d'un quartier à l'autre, d'un propriétaire à l'autre — y compris chez ceux qui vivent à l'étranger et qui ne peuvent juger que sur ce qu'ils voient.

Vous avez déjà la réputation. Prenez la preuve qui va avec.
```

**Texte à incruster dans le visuel :** `14 AVIS. 14 VRAIS CLIENTS.`

**Appel à l'action :** Faites vérifier votre profil — écrivez-nous sur WhatsApp.

**Prompt image — NanoBanana Pro**

```text
Square 1:1 medium shot of a smiling 38-year-old West African Senegalese plumber with dark skin and a short beard, crouching beside a newly installed chrome sink and copper pipework in a bright freshly tiled bathroom of a Dakar Point E apartment, wearing an orange #f97316 work polo shirt and navy blue #1a2744 trousers with a pipe wrench and a roll of thread tape on the floor next to him, holding up a smartphone toward the camera at arm's length so the screen is sharp and readable, the screen showing a French app profile card on a white background with a small circular photo of the same man, the name "Moustapha Ndiaye — Plomberie", an orange #f97316 verified badge labelled "Vérifié", a row of five orange stars, the large figure "4,8" and beneath it the grey line "14 avis vérifiés · Dakar", soft clean daylight through a frosted window bouncing off white tiles, shot on a 35mm lens at f/4 with everything crisp, palette of white tile, chrome, orange #f97316 and navy #1a2744, bold navy French sans-serif text overlaid along the bottom edge on a white band reading "14 AVIS. 14 VRAIS CLIENTS.", photorealistic bright commercial photography, square 1:1 format.
```

**Animation image → vidéo**

Plan de 4 secondes. Amorce par un léger dolly-in diagonal vers le téléphone (de 100 % à 120 %) pendant que le fond reste stable, puis, à la seconde 2,5, animation des cinq étoiles qui se remplissent en orange une par une (0,15 s chacune) et de la note « 4,8 » qui monte en compteur de 0,0 à 4,8. Le bandeau de texte du bas glisse depuis le bord inférieur à la seconde 3. Transition sortante : fondu au blanc de 0,4 s.

**Voix off / dialogue**

> Voix off féminine chaleureuse : « Sur Locawave, seul un client qui a vraiment travaillé avec toi peut te noter. Ta réputation arrête d'être une rumeur : elle devient une preuve. »

### `PRE-05` — Le renversement du regard : ce n'est plus l'artisan qui cherche du travail, c'est le propriétaire installé en Europe qui le cherche, lui, dans l'annuaire. Le budget diaspora est le vrai appât.

**Cible :** Chef de chantier, maçon ou entrepreneur du bâtiment qui vise les chantiers de construction financés depuis l'étranger, panier élevé, paiement en tranches.

**Accroche (les 1,5 première seconde) :** « Il est à Bergame. »

**Texte de l'annonce**

```
Il est à Bergame. Il construit à Diamniadio. Il cherche quelqu'un.

Des milliers de Sénégalais d'Italie, de France, d'Espagne et des États-Unis font construire au pays. Ils ont l'argent, ils ont le terrain — et ils n'ont personne en qui se repérer. Alors ils cherchent, et ils choisissent sur ce qu'ils peuvent vérifier.

Dans l'annuaire Locawave, ils voient votre identité vérifiée, votre métier, votre zone, vos chantiers déjà livrés en photos et vos avis clients. Ils vous écrivent directement dans l'application.

Et une fois le chantier lancé, tout joue pour vous : chaque phase que vous prouvez en photos est une phase qui se paie, et vos preuves datée vous protègent le jour où quelqu'un contestera votre travail.

Ce client-là ne vous rencontrera peut-être jamais. Il peut quand même vous choisir.
```

**Texte à incruster dans le visuel :** `IL EST À BERGAME. IL VOUS CHOISIT ICI.`

**Appel à l'action :** Inscrivez-vous à l'annuaire des prestataires vérifiés sur WhatsApp.

**Prompt image — NanoBanana Pro**

```text
Vertical 9:16 split-screen diptych with a thin orange #f97316 dividing line across the middle, the top half showing a 46-year-old West African Senegalese man in a grey fleece and knitted cap sitting on the edge of a bed in a small plain apartment in Bergame Italy at night, cold blue window light and a radiator behind him, leaning forward and scrolling attentively on his phone, the bottom half showing the same phone content matched in scale — a French app directory screen on a navy blue #1a2744 background listing provider cards, the top card highlighted with a photo of a Senegalese mason, the name "Ibrahima Fall — Maçonnerie, Diamniadio", an orange #f97316 badge reading "Vérifié", four small thumbnail photos of finished concrete-block houses and the grey line "9 chantiers livrés · 4,9", the card floating over a warm sunlit background photograph of a real R+2 concrete-block construction site in Diamniadio with a Senegalese foreman in an orange #f97316 helmet standing on the first-floor slab, the two halves deliberately contrasting cold European night against warm Senegalese daylight, shot on a 35mm lens, palette of cold blue-grey above and warm ochre below linked by orange #f97316 and navy #1a2744, bold white French sans-serif text across the very bottom reading "IL EST À BERGAME. IL VOUS CHOISIT ICI.", photorealistic advertising photography, vertical 9:16 format.
```

**Animation image → vidéo**

Plan de 6 secondes en deux temps. Secondes 0 à 2,5 : seule la moitié haute s'anime, léger push-in sur l'homme de Bergame et défilement lent de la liste sur son écran. Seconde 2,5 : le doigt s'arrête, la carte prestataire s'illumine — déclencher au même instant un balayage vertical de haut en bas qui « réveille » la moitié basse (luminosité qui monte de 70 % à 100 % en 0,5 s). Secondes 3 à 6 : slow push-in sur le chef de chantier au Sénégal pendant que le badge orange « Vérifié » pulse une fois. Transition sortante : fondu enchaîné de 0,5 s vers le carton final avec logo.

**Voix off / dialogue**

> Voix off masculine, rythme lent : « Il vit à Bergame. Il construit à Diamniadio. Il ne connaît personne sur place. » Pause d'une seconde. « Alors il cherche dans l'annuaire, et il choisit ce qu'il peut vérifier. Sois vérifié. Sois choisi. »

---

## 4 — Plan média et calendrier de lancement

### Les phases du lancement

#### Phase 1 — Pré-lancement : construire les actifs avant d'acheter de l'audience

**Période.** Semaines 1 à 3  
**Budget.** SERRÉ : 60 000 FCFA au total, dont 45 000 FCFA de média (recrutement prestataires, ~2 100 FCFA/jour sur 21 jours) et 15 000 FCFA de production (voix off wolof). CONFORTABLE : 350 000 FCFA, dont 170 000 FCFA de média prestataires (~8 000 FCFA/jour) et 180 000 FCFA de production (voix off française et wolof, montage, déclinaisons de formats).  
**Canaux.** Facebook Marketplace — prospection sortante manuelle (coût média zéro), Groupes Facebook bailleurs Dakar et diaspora Italie/France/Espagne (lecture et commentaires uniquement, aucun lien), WhatsApp Business — mise en place des 4 réponses types, Meta Ads — une seule campagne active : recrutement prestataires, budget minimal

Ne rien vendre. Trois livrables : (1) le pixel, l'API Conversions et les 5 événements de conversion sont branchés et vérifiés — sans eux tout budget dépensé ensuite est de l'argent aveugle ; (2) l'annuaire prestataires compte au moins 20 profils vérifiés KYC, faute de quoi la campagne diaspora promettra quelque chose qui n'existe pas ; (3) les images NanoBanana Pro du feuilleton HERO et des créas Sénégal sont générées, validées et animées. En parallèle, la prospection Marketplace sortante démarre à coût média zéro et doit produire les 10 à 20 premiers inscrits.

**Créations à diffuser :**

- PRE-03 (« Je te paierai à la fin. ») — tête de test recrutement prestataires
- PRE-05 (« Il est à Bergame. ») — tête de test recrutement prestataires
- FBM-04 (annonce Services, recrutement prestataires) — publication Marketplace gratuite
- FBM-02 (annonce Services, bailleurs, « Le carnet ne relance personne ») — publication Marketplace gratuite
- FBM-01 et FBM-05 (annonces de VRAIS biens de VRAIS clients, avec accord écrit) — vitrine et démonstration silencieuse

#### Phase 2 — Lancement : ouvrir le feuilleton chantier et tester le marché sénégalais

**Période.** Semaines 4 à 6  
**Budget.** SERRÉ : 240 000 FCFA sur 3 semaines, répartis en 100 000 FCFA Sénégal (≈ 4 700 FCFA/jour) et 140 000 FCFA diaspora (≈ 6 600 FCFA/jour, soit environ un tiers de la France, un tiers de l'Italie, un tiers de l'Espagne). CONFORTABLE : 950 000 FCFA, soit 350 000 FCFA Sénégal (≈ 16 600 FCFA/jour) et 600 000 FCFA diaspora (≈ 28 500 FCFA/jour).  
**Canaux.** Meta Ads — campagne Sénégal résident (Facebook fil + Reels), objectif Messages / click-to-WhatsApp, Meta Ads — campagne Diaspora Europe (France, Italie, Espagne), ensembles séparés par pays, TikTok organique (aucun budget), Facebook Page et Reels organiques — publication du feuilleton HERO, un épisode tous les deux jours, Marketplace — prospection sortante maintenue à 15-25 messages/jour

Produire VOTRE référence de coûts. Aucun benchmark public fiable n'existe pour le Sénégal : l'objectif de cette phase n'est pas le volume d'inscriptions mais l'obtention de trois chiffres réels — CPM Sénégal, CPM diaspora, coût par conversation WhatsApp ouverte. Deux campagnes strictement séparées (Sénégal résident / diaspora Europe), 4 à 6 créas en test simultané, un ensemble publicitaire par créa. Première coupe à la semaine 5 : toute créa sous 15 % de rétention à 3 secondes est arrêtée.

**Créations à diffuser :**

- HERO-01 (le flou — trois mois, la même photo) — diaspora, acquisition froide
- HERO-04 (aucune photo depuis 7 jours) — diaspora, acquisition froide, créa la moins chère à décliner
- FB-01 (le carnet manuscrit) — Sénégal, acquisition froide
- FB-02 (quittance manuscrite contre PDF) — Sénégal, acquisition froide
- FB-05 (« Où en est votre chantier aujourd'hui ? ») — Sénégal, acquisition froide
- HERO-02 et HERO-03 — publication organique uniquement (feuilleton)
- TT-01, TT-04, TT-06, TT-08 — TikTok organique pur

#### Phase 3 — Amplification : concentrer sur les gagnants et ouvrir le reciblage

**Période.** Semaines 7 à 10  
**Budget.** SERRÉ : 330 000 FCFA sur 4 semaines — 120 000 FCFA Sénégal froid, 130 000 FCFA diaspora froid, 80 000 FCFA reciblage. Aucun budget TikTok ni LinkedIn : les minimums de plateforme les rendent inaccessibles à ce niveau. CONFORTABLE : 1 800 000 FCFA — 500 000 FCFA Sénégal froid, 700 000 FCFA diaspora froid, 300 000 FCFA reciblage, 200 000 FCFA TikTok Spark Ads, 100 000 FCFA LinkedIn agences.  
**Canaux.** Meta Ads — acquisition froide sur les créas gagnantes uniquement, Meta Ads — reciblage (vues 75 %, visiteurs PWA, engagement Page, conversations WhatsApp non converties), Meta Ads — audiences similaires 1 % par pays, UNIQUEMENT si ≥ 100 profils source par pays, TikTok Spark Ads (scénario confortable uniquement — minimum plateforme de 50 USD/jour au niveau campagne), LinkedIn Ads agences (scénario confortable uniquement), YouTube — série longue en wolof, organique

Arrêter d'explorer, commencer à exploiter. 70 % du budget média sur les 2 créas gagnantes, montée par paliers de +30 % tous les 3 jours maximum pour ne pas casser la phase d'apprentissage. Activation du reciblage (créa de conversion HERO-05 servie directement aux vues à 75 % de HERO-01, en sautant la pédagogie). Élargissement géographique diaspora et test USA symbolique. À partir de la semaine 9, si le taux d'activation à 48 h est sous 20 %, arrêter d'optimiser le média : le problème est l'onboarding.

**Créations à diffuser :**

- HERO-05 (le pouce suspendu au-dessus du bouton) — créa de conversion, reciblage diaspora prioritaire
- HERO-06 (la maison existe) — clôture du feuilleton, format 16:9 pour YouTube et page d'accueil
- FB-04 (« Le prix ne dépend pas de votre loyer ») — reciblage Sénégal, arme de closing
- FB-06 (« Votre première quittance, ce soir ») — reciblage Sénégal
- FBD-03 (le retour au pays) et FBD-06 (la bailleuse à distance, Créteil) — élargissement diaspora
- FBD-02 (« Demander des photos, ce n'est accuser personne ») — désamorçage de l'objection familiale
- TT-03, TT-05, TT-07 — TikTok, versions wolof sur le même montage
- FBM-06 — support de la prospection agences
- PRE-01, PRE-02, PRE-04 — maintien du flux prestataires

#### Phase 4 — Fidélisation : transformer les premiers clients en canal d'acquisition

**Période.** Semaines 11 à 12  
**Budget.** SERRÉ : 120 000 FCFA — 70 000 FCFA de reciblage et amplification des témoignages, 50 000 FCFA de récompenses de parrainage. CONFORTABLE : 500 000 FCFA — 250 000 FCFA de reciblage et Spark Ads témoignages, 150 000 FCFA de récompenses de parrainage, 100 000 FCFA de production des témoignages (déplacements, tournage, montage).  
**Canaux.** Module de parrainage intégré (in-app + WhatsApp), Meta Ads — reciblage et créas de témoignage, TikTok et Reels — Spark Ads sur les témoignages ayant pris en organique, Rapport hebdomadaire propriétaire (fonctionnalité livrée) — meilleur argument de renouvellement, Avis vérifiés sur l'annuaire prestataires

Basculer du média payé vers la preuve sociale. Activation du module de parrainage déjà en production auprès de 100 % de la base, publication des 3 à 5 premiers témoignages clients RÉELS (jamais un script joué présenté comme un client), réinjection de ces témoignages en Spark Ads et en Reels. Réduction de 40 % du budget d'acquisition froide au profit du reciblage et des témoignages. Livrable final : le document de référence interne des coûts médias Locawave, qui remplace définitivement tous les chiffres de blogs utilisés en hypothèse au départ.

**Créations à diffuser :**

- TT-02 (storytime — la caution perdue faute d'écrit) — modèle de structure pour les témoignages réels
- TT-06 (témoignage face caméra diaspora) — modèle de structure, à retourner avec un vrai client
- HERO-06 — carte de fin de tous les montages de témoignage
- FB-04 — argument de conversion des essais non convertis
- Témoignages clients réels (à produire en semaine 11) — réinjectés en Spark Ads TikTok et Reels

### Répartition du budget

| Poste | Part | Pourquoi |
|---|---|---|
| **Meta — acquisition froide diaspora Europe (France, Italie, Espagne)** | 35 % | C'est le poste qui porte le panier élevé : le chantier et la commission de 5 %, seuls capables de rentabiliser un coût d'acquisition européen. Mais c'est aussi le poste le plus cher à l'impression : le CPM facturé est celui du pays de diffusion, estimé 3 300 à 9 800 FCFA les 1 000 impressions [ESTIMATION NON VERIFIEE — dérivé des benchmarks d'agence Junto 2025 et Lebesgue 2026], contre 200 à 1 200 FCFA au Sénégal [ESTIMATION NON VERIFIEE — blog d'agence Flashpub 2026]. Conséquence de production : peu de créas, très travaillées. On ne teste pas 10 visuels ici. |
| **Meta — acquisition froide Sénégal résident** | 22 % | Facebook est le plus gros réseau ciblable du pays avec 3,60 millions d'utilisateurs touchables par la publicité, dont 66,7 % d'hommes (source : DataReportal, Digital 2026: Senegal) — la démographie naturelle du bailleur de 35 à 60 ans. L'impression y coûte 5 à 15 fois moins cher qu'en Europe [estimation], donc les créas peuvent être nombreuses et jetables. C'est le terrain d'apprentissage : on y achète du signal, pas du volume. |
| **Meta — reciblage (Sénégal + diaspora)** | 13 % | Poste au meilleur rendement mécanique et pourtant le plus souvent sous-financé. Il sert HERO-05 (le pouce suspendu) aux personnes ayant vu 75 % de HERO-01 : quelqu'un qui a reconnu sa douleur n'a pas besoin de pédagogie. Ne peut fonctionner qu'à partir de la semaine 5, quand les audiences de vues vidéo sont assez fournies. |
| **TikTok — Spark Ads (scénario confortable uniquement)** | 8 % | Réservé au budget confortable pour une raison arithmétique : TikTok Ads impose 50 USD/jour au niveau campagne et 20 USD/jour au niveau groupe (≈ 30 000 FCFA/jour minimum), incompatible avec un budget serré. S'ajoutent deux risques assumés : aucune donnée d'audience publicitaire TikTok n'est publiée pour le Sénégal (absente de DataReportal 2025 et 2026), et la plateforme a été suspendue par l'État sénégalais le 2 août 2023 avec un rétablissement jamais officiellement daté. Format Spark Ads exclusivement — on n'amplifie que ce qui a déjà performé en organique. |
| **LinkedIn — offre Agence 45 000 FCFA/mois (scénario confortable uniquement)** | 4 % | LinkedIn Sénégal compte 1,50 million de membres et croît de +15,4 %/an, la plus forte progression du pays (source : DataReportal, Digital 2026: Senegal). C'est le seul endroit où l'offre Agence se vend sans avoir à expliquer ce qu'est un SaaS. Mais le CPC LinkedIn est structurellement élevé et aucun benchmark Sénégal n'existe : en budget serré, on approche les agences à la main via leurs propres annonces Marketplace, à coût zéro. |
| **Production créative (génération d'images, voix off wolof et française, montage, déclinaisons de formats)** | 10 % | Poste non compressible et systématiquement sous-estimé. Deux montages sont nécessaires, pas un : voix off wolof pour le Sénégal, français pour la diaspora, sur des timelines identiques. NanoBanana Pro dérape sur les longues chaînes de texte : prévoir 3 à 4 générations par prompt et ne garder que les versions où les montants sont écrits avec espace (220 000 FCFA, jamais 220,000) et les accents français exacts. |
| **Parrainage et récompenses clients** | 5 % | Le module de parrainage est déjà en production. Sur une cible aussi étroite que le bailleur sénégalais — dont personne ne connaît le nombre, aucune donnée publique n'existant sur ce point — le bouche-à-oreille vaut probablement plus que le budget média. Une récompense financée est presque toujours moins chère qu'une impression achetée en Europe. |
| **Réserve non allouée** | 3 % | Rachat de la créa qui explose de façon inattendue, ou absorption d'une hausse d'enchères saisonnière. Une réserve nulle oblige à couper un gagnant pour financer un test — c'est la pire décision média possible. |

### Calendrier semaine par semaine

**S1**

- Créer le Business Manager Meta, le compte publicitaire, la Page Facebook Locawave et le compte TikTok Business. Vérifier le domaine, installer le pixel Meta sur la PWA et l'événement API Conversions.
- Définir et brancher 5 événements de conversion serveur : Inscription_essai, Bien_cree, Locataire_ajoute, Quittance_emise, Chantier_phase_creee. Sans ces événements, aucune optimisation ni aucun apprentissage n'est possible — c'est prioritaire sur toute création.
- Instrumenter les 200 premiers inscrits : champs obligatoires nombre de biens, quartier, pays de résidence, chantier oui/non, canal d'origine. Aucune donnée publique n'existe sur le nombre de bailleurs au Sénégal : cette base sera l'unique source de vérité du plan.
- Ouvrir le numéro WhatsApp Business, écrire les 4 réponses types (ESSAI, CHANTIER, PRESTATAIRE, AGENCE) et le script de prospection Marketplace en 4 messages.
- Générer sous NanoBanana Pro les images de PRE-03 et PRE-05 (recrutement prestataires) en priorité — l'annuaire doit exister avant que la campagne diaspora ne le promette.

**S2 — Production créative et amorçage organique**

- Générer et valider les images du feuilleton HERO-01 à HERO-06, plus FB-05 (Sénégal, chantier) et FB-04 (diaspora, alerte 7 jours). Règle de production : 3 à 4 générations par prompt, ne garder que la version où les montants sont écrits avec espace (220 000 FCFA, jamais 220,000) et les accents français sont exacts.
- Enregistrer les voix off : version française (diaspora) et version wolof (Sénégal) sur exactement les mêmes montages. Faire relire chaque phrase wolof par un locuteur natif.
- Publier les 2 premières annonces Marketplace de service : FBM-02 (bailleurs, catégorie Services) et FBM-04 (prestataires, catégorie Services).
- Rejoindre 15 à 20 groupes Facebook : bailleurs et immobilier Dakar, Sénégalais d'Italie/France/Espagne, construire au Sénégal. Ne rien poster cette semaine : lire, commenter utilement, se faire connaître.
- Lancer la prospection Marketplace sortante : 15 à 25 messages par jour vers les propriétaires ayant publié une annonce de location depuis moins de 48 h.

**S3 — Remplissage de l'annuaire prestataires (premier budget)**

- Activer la campagne Meta Sénégal PRE (objectif Messages / click-to-WhatsApp) avec PRE-03 et PRE-05. Budget faible : 2 000 à 3 000 FCFA/jour en scénario serré, 8 000 FCFA/jour en confortable.
- Objectif de la semaine : 15 profils prestataires soumis, 8 validés KYC. Sans annuaire garni, la promesse de la campagne diaspora devient un mensonge.
- Annoncer la commission de 5 % sur les travaux dès la première réponse WhatsApp à un artisan. Une surprise tarifaire tue la recommandation, et cette cible ne recrute que par recommandation.
- Publier FBM-01 (annonce d'un vrai bien d'un vrai client, avec son accord écrit) et FBM-05. Jamais d'annonce immobilière inventée : cela fait bannir de Marketplace.
- Relever et noter le CPM réel et le coût par conversation observés au Sénégal. C'est le premier chiffre fiable du dossier — aucun benchmark public n'existe pour le Sénégal.

**S4 — Ouverture du feuilleton chantier (diaspora)**

- Lancer la campagne Diaspora Europe avec HERO-01 (le flou) et HERO-04 (alerte 7 jours) en parallèle, dans deux ensembles publicitaires distincts, objectif Messages WhatsApp.
- Lancer la campagne Sénégal résident acquisition froide avec FB-01 (Sénégal, carnet), FB-02 (quittance manuscrite vs PDF) et FB-05 (Sénégal, chantier), un ensemble par créa.
- Ne jamais mélanger diaspora et Sénégal dans un même ensemble publicitaire : ce sont deux marchés d'enchères et deux économies totalement différents.
- Diffusion en soirée : fenêtre 20 h-21 h UTC. Elle touche Dakar en soirée, Paris/Rome/Madrid au coucher et New York en fin d'après-midi. À valider sur 3 semaines avant de figer.
- Publier HERO-01 puis HERO-02 en organique sur la Page et TikTok, un épisode tous les deux jours, entre 20 h et 22 h heure de Paris.

**S5 — Densification et premières coupes**

- Première décision de coupe : toute créa sous 15 % de rétention à 3 secondes est arrêtée. Toute créa au-dessus de 25 % voit son budget doublé.
- Ajouter FB-03 (diaspora, retour au pays) et FB-06 (Sénégal, essai gratuit) dans les ensembles gagnants.
- Publier HERO-03 puis HERO-04 en organique. HERO-04 est la créa la moins chère à décliner : changer le nombre de jours, la ville, le prénom, et produire 3 variantes.
- Créer les audiences de reciblage : vues à 75 % de vidéo (180 jours), visiteurs de la PWA, ouvreurs de conversation WhatsApp non convertis.
- Lancer les 4 premiers scripts TikTok en organique pur : TT-01, TT-04, TT-06, TT-08. Aucun budget TikTok à ce stade.

**S6 — Bascule sur la conversion**

- Activer le retargeting Meta avec HERO-05 (le pouce suspendu) servi directement aux vues à 75 % de HERO-01. Quelqu'un qui a reconnu sa douleur n'a pas besoin de pédagogie, il a besoin de voir le pouce s'arrêter.
- Activer le retargeting Sénégal avec FB-04 (le prix ne dépend pas du loyer) et FB-06 (essai gratuit).
- Publier HERO-05 puis HERO-06 en organique, et monter la version longue 60-90 s en 16:9 pour YouTube et la page d'accueil.
- Premier bilan chiffré à 30 jours de diffusion : coût par conversation WhatsApp Sénégal, coût par conversation diaspora, taux d'activation à 48 h. Ces trois chiffres deviennent la référence interne — ils remplacent définitivement tout benchmark de blog.
- Contacter 3 à 5 micro-influenceurs sénégalais de la diaspora (Bergame, Milan, Créteil) pour des Spark Ads. Les micro-créateurs surperforment les célébrités sur ce marché.

**S7 — Amplification des gagnants**

- Concentrer 70 % du budget média sur les 2 créas gagnantes identifiées, en montant par paliers de +30 % tous les 3 jours maximum pour ne pas casser la phase d'apprentissage.
- Créer les audiences similaires (Lookalike) 1 % par pays — uniquement si la base source atteint 100 inscrits par pays. En dessous, Meta produit une audience de bruit : ne pas la lancer.
- Ouvrir le budget TikTok Spark Ads en boostant uniquement les posts organiques ayant déjà dépassé 25 % de rétention à 3 s. Réservé au scénario confortable : TikTok Ads impose 50 USD/jour minimum au niveau campagne (≈ 30 000 FCFA/jour), incompatible avec le budget serré.
- Lancer la campagne LinkedIn agences (scénario confortable uniquement) avec FBM-06 en visuel et l'argument 45 000 FCFA/mois pour toute l'agence.
- Publier la série YouTube longue en wolof : « Suivre un chantier depuis l'étranger », 3 épisodes de 6 à 10 minutes. Coût quasi nul, concurrence quasi nulle sur ce créneau.

**S8 — Élargissement géographique**

- Ajouter les villes secondaires diaspora : Turin, Gênes, Brescia, Séville, Murcie, Lleida, Rouen, Bordeaux. Un ensemble par pays, jamais un ensemble multi-pays.
- Ajouter le test USA à budget symbolique (New York, Cincinnati/Ohio). L'Amérique du Nord ne représente que 3 % de la diaspora sénégalaise (source : profil migratoire ANSD/OIM) : marché test, pas priorité.
- Décliner les créas gagnantes en 3 variantes de 3 premières secondes différentes, même corps de vidéo. C'est le levier de performance le moins cher qui existe.
- Produire les versions 4:5 de FB-01, FB-03 et FB-06 (Sénégal) : c'est le format qui occupe le plus de hauteur dans le fil mobile.
- Relancer les annonces Marketplace de service (republier plutôt que modifier : la republication remonte dans le fil).

**S9 — Optimisation du tunnel, pas du média**

- Arrêter d'optimiser le haut de tunnel. Si le taux d'activation à 48 h est sous 20 %, le problème n'est plus la publicité : c'est l'onboarding. Prioriser l'accompagnement WhatsApp humain sur les 48 premières heures.
- Mettre en place la séquence de relance des essais non activés : J+1 WhatsApp humain, J+3 in-app, J+7 dernier message avec la promesse concrète (première quittance ce soir / première série de photos ce soir).
- Rediffuser TT-03, TT-05 et TT-07 en version wolof sur le même montage, texte incrusté conservé en français.
- Lancer le test de format : image fixe animée contre vidéo montée sur la même accroche, pour savoir ce qui vaut la peine d'être produit.
- Recruter les 5 premiers témoignages clients réels pour la phase 4. Ne jamais publier un faux témoignage : un script à la première personne joué par un acteur présenté comme client réel est interdit.

**S10 — Consolidation et arbitrage budgétaire**

- Comparer honnêtement les deux économies : coût par abonné payant Sénégal contre coût par abonné payant diaspora, et revenu commission 5 % par chantier ouvert.
- Arbitrer : si le coût par lead diaspora dépasse 66 000 FCFA sans chantier ouvert, réduire de moitié et redéployer sur le Sénégal. Un abonné Solo rapporte 120 000 FCFA sur 12 mois — c'est le seul plafond crédible.
- Ne jamais mettre l'abonnement à 10 000 FCFA en avant sur les créas diaspora : c'est le chantier qui vend, l'abonnement suit.
- Figer les créneaux horaires sur la base de 3 semaines de données réelles et arrêter de tester les horaires.
- Préparer le module de parrainage : message pré-écrit, visuel partageable, récompense chiffrée.

**S11 — Bascule sur le parrainage et la preuve sociale**

- Activer la campagne de parrainage auprès de 100 % de la base. Sur une cible aussi étroite, le bouche-à-oreille entre bailleurs et entre familles diaspora vaut probablement plus que le budget média.
- Publier les 3 premiers témoignages clients réels, tournés sans décor publicitaire, face caméra, en français teinté de wolof. Le registre intime (la peur d'être traité de mbougoul mbook) n'est autorisé QUE dans un témoignage à la première personne, jamais dans une accroche de marque.
- Réinjecter ces témoignages en Spark Ads TikTok et en Reels — c'est le format le plus rentable car il amplifie un contenu ayant déjà prouvé son engagement organique.
- Solliciter les avis vérifiés (réservés à ceux qui ont réellement loué ou réservé) sur les prestataires de l'annuaire.
- Réduire de 40 % le budget d'acquisition froide et le basculer sur le retargeting et les créas de témoignage.

**S12 — Clôture, mesure et référence interne**

- Produire le bilan complet : impressions, rétention 3 s par créa, coût par conversation, taux d'activation 48 h, taux essai→payant J30, coût par abonné payant, chantiers ouverts et commission générée. Séparer strictement Sénégal et diaspora.
- Écrire le document de référence interne des coûts médias Locawave. Il remplace définitivement tous les chiffres de blogs utilisés en hypothèse au départ.
- Classer les créations en trois piles : à rediffuser en boucle, à retourner avec un nouveau hook, à abandonner.
- Documenter la répartition réelle de la base (biens, quartiers, résidence, chantier oui/non). C'est la première donnée fiable jamais produite sur le bailleur sénégalais — elle vaut plus que tout le budget média dépensé.
- Décider du plan trimestre 2 sur les chiffres relevés, pas sur les hypothèses de départ. Reprendre le feuilleton HERO en boucle sur TikTok en changeant uniquement les 3 premières secondes.

### Paramètres de ciblage à saisir

À reporter tels quels dans le gestionnaire de publicités.

#### Propriétaires bailleurs résidant au Sénégal — cœur de cible locatif · Meta Ads — Facebook fil d'actualité + Facebook Reels (placements manuels, désactiver Audience Network et Messenger)

```
Objectif : Messages (click-to-WhatsApp), pas Trafic ni Notoriété. Localisations : Sénégal, en ciblage par ville avec rayon — Dakar +25 km, Thiès +15 km, Mbour/Saly +15 km, Diamniadio +10 km. Option « Personnes résidant à cet endroit » (jamais « personnes récemment sur place »). Âge 35-60. Tous genres (l'audience publicitaire Facebook Sénégal est déjà à 66,7 % masculine — source DataReportal, Digital 2026: Senegal — inutile de forcer). Langue : Français. Ciblage détaillé : DÉMARRER SANS AUCUN INTÉRÊT (âge + géo seulement) et laisser l'algorithme travailler. Les catégories d'intérêt Meta sont peu granulaires en Afrique de l'Ouest et une audience trop étroite fait exploser le coût. Si le volume est trop large après 7 jours, restreindre avec : Immobilier, Investissement immobilier, Construction, Propriété locative. Exclusions obligatoires : audience personnalisée « Inscrits Locawave » (liste clients), visiteurs PWA 90 jours, ouvreurs de conversation WhatsApp 30 jours. Placement Marketplace : désactivé en publicité (Marketplace se travaille en organique).
```

#### Diaspora sénégalaise — Italie · Meta Ads — Facebook Reels + fil + Instagram Reels

```
Objectif : Messages (click-to-WhatsApp). Localisations en ciblage ville + rayon 25 km : Bergame, Milan, Turin, Brescia, Gênes, Rome. Option « Personnes résidant à cet endroit ». Âge 30-58. Langue : Français ET Wolof (cocher les deux dans Langues). Ciblage détaillé — couche 1 (intérêts d'appartenance) : Sénégal, Dakar, Wolof, Youssou N'Dour, Baye Fall, Touba, Mouridisme, Cheikh Ahmadou Bamba, Lutte sénégalaise, Seneweb, Thiéboudienne. Couche 2 en « restreindre l'audience » (ET DOIT AUSSI correspondre) : Construction de maison, Immobilier, Investissement immobilier, Transfert d'argent. AVERTISSEMENT : les ciblages comportementaux du type « Expatriés — Sénégal » ont été fortement réduits par Meta depuis 2022 ; vérifier leur disponibilité réelle dans le gestionnaire avant de bâtir dessus. Exclusions : inscrits, ouvreurs WhatsApp 30 jours, vues à 95 % de la même vidéo. Ensemble publicitaire SÉPARÉ par pays — jamais un ensemble multi-pays : les enchères italienne, française et espagnole ne se pilotent pas ensemble.
```

#### Diaspora sénégalaise — France · Meta Ads — Facebook Reels + fil + Instagram Reels

```
Mêmes réglages que l'Italie, avec les localisations : Île-de-France (Paris, Créteil, Saint-Denis, Montreuil, Mantes-la-Jolie), Lyon et Rhône-Alpes, Marseille, Bordeaux, Rouen, Le Havre — ciblage ville + rayon 25 km. Âge 30-58. La France concentre le plus gros contingent de la diaspora (~310 000 personnes, source au-senegal.com) et, avec l'Italie et l'Espagne, 60 % des transferts vers le Sénégal (source : profils migratoires ANSD/OIM, 2019). C'est donc l'ensemble à financer en premier. Attention budgétaire : le CPM facturé est celui du marché français, pas celui du Sénégal — estimé 5 à 15 € les 1 000 impressions [ESTIMATION NON VERIFIEE, benchmark d'agence Junto 2025], soit 3 300 à 9 800 FCFA. Prévoir 5 à 15 fois moins d'impressions qu'au Sénégal à budget égal.
```

#### Diaspora sénégalaise — Espagne · Meta Ads — Facebook Reels + fil

```
Localisations ville + rayon 25 km : Barcelone, Madrid, Séville, Murcie, Lleida, Almería (zones agricoles incluses, la communauté sénégalaise y est documentée). Âge 30-58. Mêmes couches d'intérêts que l'Italie. Volume plus faible (~57 000 personnes, source au-senegal.com) : ne pas allouer plus de 15 % du budget diaspora tant que la France et l'Italie n'ont pas atteint leur plafond de performance.
```

#### Diaspora sénégalaise — États-Unis (test à budget symbolique) · Meta Ads — Facebook Reels

```
Localisations : New York (Harlem, Bronx), Cincinnati et Columbus (Ohio), Washington DC. Âge 30-58. Langue : Français ET Anglais. L'Amérique du Nord ne pèse que 3 % de la diaspora sénégalaise (~32 000 personnes) : marché de test, jamais de priorité de phase 1. Plafonner à 5 % du budget diaspora et couper si le coût par conversation dépasse le double de celui de la France.
```

#### Reciblage — a vu la douleur mais n'a pas écrit · Meta Ads — tous placements

```
Audiences personnalisées à créer dès la semaine 5 : (1) Vues vidéo à 75 % de HERO-01 ou HERO-04, fenêtre 180 jours ; (2) Visiteurs de la PWA 90 jours ; (3) Personnes ayant engagé avec la Page 365 jours ; (4) Ouvreurs de conversation WhatsApp sans inscription, 30 jours. Créa servie : HERO-05 pour la diaspora (le pouce suspendu), FB-04 et FB-06 pour le Sénégal. Exclure impérativement les inscrits et les abonnés payants. Le reciblage est le poste au meilleur rendement : lui garder au minimum 13 % du budget.
```

#### Audiences similaires (Lookalike) — à n'activer qu'en phase 3 · Meta Ads

```
Source : liste des inscrits ayant activé leur essai (bien + locataire créés, ou chantier + phase). Créer une Lookalike 1 % PAR PAYS (Sénégal, France, Italie), jamais une audience multi-pays. RÈGLE DE SÉCURITÉ : ne rien lancer avant d'avoir au moins 100 profils source par pays. En dessous, Meta produit une audience de bruit qui consomme du budget sans signal. Si la base ne l'atteint pas en semaine 7, reporter — ce n'est pas un échec, c'est une contrainte de volume.
```

#### Prestataires du bâtiment au Sénégal (maçons, plombiers, électriciens, chefs de chantier) · Meta Ads — Facebook fil + Reels

```
Objectif : Messages (click-to-WhatsApp), le KYC se collecte en conversation, jamais par formulaire. Localisations : Dakar +30 km, Thiès, Mbour/Saly, Diamniadio. Âge 25-55. Genre : tous. Ciblage détaillé : Construction, Maçonnerie, Plomberie, Électricité, Travaux de rénovation, Bricolage, Matériaux de construction. Créas PRE-03 et PRE-05 en tête de test. Budget faible et continu (2 000 à 8 000 FCFA/jour) : l'objectif n'est pas le volume mais un flux régulier de profils vérifiables.
```

#### Agences immobilières sénégalaises (offre Agence 45 000 FCFA/mois) · LinkedIn Ads (scénario confortable uniquement) + prospection manuelle Marketplace/Messenger (scénario serré)

```
LinkedIn : localisation Sénégal, secteur « Immobilier », taille d'entreprise 1-10 et 11-50, intitulés « Agent immobilier », « Gérant », « Directeur d'agence », « Négociateur immobilier », « Syndic ». LinkedIn Sénégal compte 1,50 million de membres et croît de +15,4 %/an, la plus forte progression du pays (source : DataReportal, Digital 2026: Senegal). AVERTISSEMENT : le CPC LinkedIn est structurellement élevé et aucun benchmark Sénégal n'existe. Avec un budget serré, ne PAS acheter de LinkedIn — approcher les agences à la main via leurs annonces Marketplace, avec FBM-06 comme support.
```

#### TikTok — Sénégal et diaspora francophone · TikTok Ads Manager (Spark Ads uniquement)

```
CONTRAINTE BLOQUANTE : TikTok impose un budget minimum de 50 USD/jour au niveau campagne et 20 USD/jour au niveau groupe d'annonces (soit ≈ 30 000 FCFA/jour minimum). Le budget serré ne permet PAS d'acheter de la publicité TikTok — TikTok y reste 100 % organique. Scénario confortable : localisation Sénégal + France + Italie (campagnes séparées), âge 25-54, intérêts Maison et Jardin / Finance et Investissement / Voyage. Format : Spark Ads exclusivement, en boostant un post organique ayant déjà dépassé 25 % de rétention à 3 secondes. Prévoir un moyen de paiement international : les cartes bancaires sénégalaises échouent fréquemment sur TikTok Ads. RISQUE À ASSUMER : aucune donnée d'audience publicitaire TikTok n'est publiée pour le Sénégal (absente de DataReportal 2025 et 2026), et la plateforme a été suspendue par l'État sénégalais le 2 août 2023 avant un rétablissement jamais officiellement daté. TikTok ne doit jamais être un canal unique.
```

### Les indicateurs à surveiller

| Indicateur | Cible | Seuil d'alerte |
|---|---|---|
| **Taux de rétention à 3 secondes (vidéo)** | ≥ 25 % — c'est le seul indicateur fiable à J+3 sur une créa neuve, et il ne dépend d'aucun benchmark de marché | < 15 % à partir de 5 000 impressions : couper la créa immédiatement, ne jamais augmenter son budget en espérant que ça se corrige |
| **Coût par conversation WhatsApp réellement ouverte — Sénégal** | AUCUNE CIBLE CRÉDIBLE AVANT J30. Aucun coût par lead ou par message fiable n'existe publiquement pour le Sénégal — c'est le trou noir du dossier. La cible se fixe sur VOS 30 premiers jours de données, pas sur un chiffre de blog. | > 12 000 FCFA par conversation, soit 10 % du revenu 12 mois d'un abonné Solo (120 000 FCFA). Au-delà, le canal ne peut pas être rentable même avec un taux de conversion parfait. |
| **Coût par conversation WhatsApp réellement ouverte — diaspora Europe** | Repère externe à traiter comme une hypothèse : coût par lead immobilier Meta ≈ 29,50 USD en médiane (source : Superads, juillet 2025-juin 2026), soit ≈ 18 000 FCFA — mais cet échantillon est dominé par les marchés occidentaux et n'est pas représentatif d'une cible diaspora. | > 66 000 FCFA (haut de la fourchette CAC immobilier Junto 2025, 50-100 €) sans chantier ouvert : réduire de moitié et redéployer sur le Sénégal |
| **Taux d'activation à 48 heures (essai ayant créé au moins un bien + un locataire, ou un chantier + une phase)** | ≥ 40 %. C'est l'indicateur qui pilote tout le reste : un essai non activé ne se convertira pas, quel que soit le budget média investi en amont. | < 20 % : arrêter d'optimiser la publicité, le problème est dans l'onboarding. Basculer le budget sur l'accompagnement humain WhatsApp des 48 premières heures. |
| **Délai médian entre inscription et première quittance PDF émise (ou première phase de chantier créée)** | < 48 heures | > 7 jours : la promesse « votre première quittance ce soir » n'est pas tenue, ce qui invalide FB-06 et l'ensemble du discours d'essai |
| **Taux essai → abonné payant à J30** | ≥ 25 % sur la diaspora — c'est le SEUIL DE RENTABILITÉ CALCULÉ (un lead à 30 000 FCFA face à 120 000 FCFA de revenu Solo sur 12 mois), pas une performance observée. ≥ 15 % suffit au Sénégal où le coût d'acquisition est bien plus bas. | < 10 % : le produit ou l'onboarding ne tient pas la promesse de la publicité. Suspendre toute montée en budget. |
| **Profils prestataires vérifiés KYC par semaine** | 10 par semaine à partir de la semaine 3, soit ~100 profils à la semaine 12 | < 3 par semaine : la campagne diaspora devient un mensonge le jour où un propriétaire de Bergame ouvrira l'annuaire et n'y trouvera personne dans sa commune. Suspendre PRE-05 tant que l'annuaire n'est pas garni. |
| **Revenu commission 5 % par chantier ouvert (diaspora)** | À mesurer. C'est le seul indicateur capable de justifier un coût d'acquisition européen élevé — l'abonnement à 10 000 FCFA ne le peut pas. | Aucun chantier ouvert après 6 semaines de diffusion diaspora : le récit fonctionne mais ne convertit pas. Revoir l'étape 3 du tunnel, pas les créas. |
| **Part d'abonnés ayant parrainé au moins une personne à J90** | ≥ 20 %. Sur une cible aussi étroite, le parrainage doit devenir le premier canal d'acquisition au Sénégal. | < 5 % : le module de parrainage n'est pas visible ou la récompense n'est pas assez lisible. Problème produit, pas problème média. |
| **Complétude de l'instrumentation des 200 premiers inscrits (biens, quartier, pays de résidence, chantier oui/non, canal d'origine)** | 100 % des inscrits documentés | < 80 % : vous perdez la seule source de vérité qui existera jamais sur ce marché. Aucune donnée publique n'existe sur le nombre de bailleurs au Sénégal, le taux de gestion par agence ou le parc locatif de Dakar. |

### Plan de test A/B

1. ORDRE DE TEST — règle générale : on teste une seule variable à la fois, du plus grossier au plus fin. Angle, puis accroche, puis format, puis audience, puis placement, puis horaire. Tester l'audience avant d'avoir trouvé l'angle gagnant est le gaspillage le plus courant et le plus coûteux.
2. TEST 1 (semaines 4-5) — L'ANGLE, sur la diaspora. HERO-01 (reconnaissance de la douleur : trois mois, la même photo) contre HERO-04 (curiosité produit : écran noir, alerte 7 jours). Un ensemble publicitaire par créa, budget identique, même audience France+Italie. Critère de décision : rétention à 3 secondes après 5 000 impressions par créa. Le gagnant reçoit le double de budget, le perdant est arrêté si sous 15 %. Si les deux dépassent 25 %, on garde les deux — c'est un bon problème.
3. TEST 2 (semaines 4-5) — L'ANGLE, sur le Sénégal. FB-01 (le carnet manuscrit, angle identité) contre FB-02 (quittance manuscrite vs PDF, angle preuve) contre FB-05 (le chantier, angle argent). Critère : coût par conversation WhatsApp ouverte, pas coût par clic. Décision à 20 conversations minimum par créa — en dessous, la différence observée est du bruit statistique, pas un résultat.
4. TEST 3 (semaine 6) — L'ACCROCHE, sur la créa gagnante uniquement. Décliner la créa gagnante en 3 variantes ne changeant QUE les 3 premières secondes et le texte incrusté : « Trois mois. La même photo. » contre « Ce n'est pas de la méfiance. » contre « Vous ne payez pas la toiture avant de voir la toiture. » Corps de vidéo identique. Critère : rétention à 3 secondes. C'est le levier de performance le moins cher qui existe — un nouveau hook coûte une génération d'image, pas un tournage.
5. TEST 4 (semaine 7) — LA DESTINATION. Click-to-WhatsApp contre page d'inscription PWA, sur la même créa et la même audience. Critère : nombre d'essais réellement ACTIVÉS à 48 h (bien + locataire créés, ou chantier + phase), pas nombre de clics. Hypothèse forte à vérifier plutôt qu'à croire : WhatsApp est décrit comme l'outil quotidien de cette audience avant l'email, mais cela reste une source non chiffrée — mesurez-le.
6. TEST 5 (semaine 8) — LE FORMAT DE PRODUCTION. Image fixe légèrement animée (push-in seul) contre vidéo montée multi-plans, sur la même accroche gagnante. Critère : coût par conversation. Enjeu réel : savoir si le temps de montage vaut son coût. Si l'écart est inférieur à 20 %, arrêter de produire des montages complexes et multiplier les images animées.
7. TEST 6 (semaine 8) — LE CIBLAGE, sur la créa gagnante figée. Ciblage large (âge + géo seulement, Advantage+) contre ciblage par intérêts d'appartenance (Sénégal, Touba, Youssou N'Dour, Wolof). Critère : coût par conversation à volume égal. Sur les petits marchés, le ciblage large gagne souvent — mais c'est une hypothèse à vérifier, pas une règle. Ne pas lancer ce test avant que le TEST 3 n'ait figé l'accroche.
8. TEST 7 (semaine 9) — LE PAYS, en diaspora. France contre Italie contre Espagne, même créa, même budget par ensemble. Critère : coût par conversation ET taux d'ouverture de chantier. Attention : ce sont trois marchés d'enchères distincts, la comparaison ne sert pas à désigner un vainqueur mais à répartir le budget proportionnellement au rendement observé.
9. TEST 8 (semaine 9) — L'HORAIRE. Fenêtre 20 h-21 h UTC (Dakar en soirée, Europe au coucher, New York en fin d'après-midi) contre diffusion continue 24 h. Critère : coût par conversation sur 7 jours pleins. Les créneaux 12 h-15 h et 19 h-21 h qui circulent sont des recommandations génériques d'outils, sans aucune donnée sénégalaise derrière — à traiter comme une hypothèse, pas comme un fait. Mesurer 3 semaines avant de figer.
10. TEST 9 (semaine 10) — LA PROMESSE D'ENTRÉE, sur le Sénégal. « Essai gratuit » contre « Je vous prépare gratuitement le bail écrit et l'état des lieux d'entrée de ce logement ». Critère : taux d'activation à 48 h. Hypothèse : un livrable daté et concret bat une offre d'essai abstraite auprès d'un propriétaire qui vient de publier une annonce.
11. TEST 10 (semaine 11) — LE TÉMOIGNAGE. Créa de marque gagnante contre témoignage client réel filmé sans décor publicitaire, même audience. Critère : coût par abonné payant, pas par conversation. Le naturel vend davantage que la production sur ce format — mais si l'écart n'est pas mesuré, il ne sert à rien de le croire.
12. RÈGLES DE DÉCISION NON NÉGOCIABLES — (1) jamais deux variables modifiées dans le même test ; (2) jamais de décision avant 5 000 impressions par créa pour la rétention, ni avant 20 conversations par créa pour le coût ; (3) jamais de montée de budget supérieure à +30 % tous les 3 jours, sous peine de relancer la phase d'apprentissage Meta et de perdre l'historique ; (4) une créa arrêtée n'est jamais relancée telle quelle — elle revient avec un nouveau hook ou pas du tout ; (5) on n'optimise jamais sur les likes, les partages ou la portée.

### Ce que tu peux faire sans budget

- PROSPECTION MARKETPLACE SORTANTE — le moteur numéro un, coût zéro en média. Filtrer Facebook Marketplace sur Immobilier · Location, rayon Dakar puis Thiès, Mbour, Saly, tri par plus récent. Ne traiter que les annonces de moins de 48 heures : au-delà, le propriétaire est déjà noyé et démotivé. 15 à 25 messages personnalisés par jour maximum, depuis un vrai profil personnel renseigné. Un propriétaire qui vient de publier déclare simultanément qu'il possède un bien, que ce bien est vacant, qu'il cherche activement une solution et qu'il vient d'exposer son numéro à des centaines d'inconnus. C'est le prospect le plus qualifié du marché, et il ne coûte pas un franc.
- L'OFFRE D'ENTRÉE QUI CONVERTIT : ne pas proposer un essai gratuit, proposer un livrable. « Je vous prépare gratuitement le bail écrit et l'état des lieux d'entrée pour ce logement-là. » C'est daté, concret, et ça correspond exactement à ce qu'il est en train de faire. Ça crée le premier acte dans l'application, seul indicateur qui prédit l'abonnement.
- COMMENTAIRES UTILES PLUTÔT QUE LIENS — dans les groupes Facebook de bailleurs et sous les annonces, répondre par un conseil juridique vrai et gratuit : « pensez à l'état des lieux d'entrée contradictoire avec photos, sans lui vous ne pourrez rien retenir sur la caution ». Cette approche génère plus de messages entrants qu'un lien, et elle est vraie : c'est du droit sénégalais applicable, pas un argument marketing.
- ANNONCES MARKETPLACE EN CATÉGORIE SERVICES (FBM-02, FBM-03, FBM-04, FBM-06) — gratuites, hébergées par Facebook, elles donnent une page propre que le prospect consulte sans quitter l'application et sans avoir l'impression de cliquer sur une publicité. Republier tous les 7 jours plutôt que modifier : la republication remonte dans le fil.
- ANNONCES DE VRAIS BIENS (FBM-01, FBM-05) — publier de VRAIES annonces de VRAIS clients, avec leur accord écrit. Jamais une annonce inventée : cela fait bannir de Marketplace et détruit le seul actif qui compte ici. Ces annonces travaillent deux fois — elles trouvent un locataire pour le client (donc prouvent la valeur de l'abonnement) et servent de démonstration silencieuse aux autres propriétaires qui parcourent Grand Yoff ou les Almadies.
- GROUPES FACEBOOK DIASPORA — rejoindre 15 à 20 groupes : Sénégalais d'Italie, de France, d'Espagne, groupes « construire au Sénégal », groupes de ressortissants par région d'origine (Thiès, Louga, Matam). Règle absolue : lire et commenter pendant deux semaines avant de publier quoi que ce soit. Un lien posté par un compte inconnu est supprimé et le compte signalé.
- WHATSAPP EST LE CANAL DE CONVERSION, PAS FACEBOOK — WhatsApp est décrit comme d'usage quasi universel dans la diaspora sénégalaise d'Italie et d'Espagne, avant l'email. Toutes les publicités pointent vers un click-to-WhatsApp, jamais vers un formulaire web. Créer aussi un statut WhatsApp Business hebdomadaire montrant une phase validée réelle (avec accord du client).
- PARRAINAGE — le module existe déjà en production. L'activer auprès de 100 % de la base en semaine 11, avec un message pré-écrit et un visuel partageable. Sur une cible aussi étroite que le bailleur sénégalais, le bouche-à-oreille entre propriétaires et entre familles diaspora vaut probablement plus que le budget média. Suivre le coût d'acquisition d'un inscrit parrainé face à un inscrit payant : c'est l'arbitrage le plus important du trimestre 2.
- YOUTUBE — canal oublié à ouvrir. YouTube touche 5,42 millions de Sénégalais (source : DataReportal, Digital 2026: Senegal), autant que l'ensemble des réseaux sociaux, et l'immobilier locatif sénégalais y est quasi absent. Produire une série longue en wolof « Comment suivre un chantier depuis l'étranger », 6 à 10 minutes par épisode. Coût quasi nul, positionne Locawave comme autorité et non comme annonceur.
- TIKTOK 100 % ORGANIQUE EN BUDGET SERRÉ — publier les 8 scripts TT en organique, un tous les deux jours. Ne booster (Spark Ads) que ce qui a déjà pris. Format UGC : caméra à la main, lumière naturelle, visage visible, une seule idée par vidéo. Les créas « studio » sous-performent systématiquement sur ce format.
- MICRO-INFLUENCEURS PLUTÔT QUE CÉLÉBRITÉS — cibler 3 à 5 créateurs sénégalais installés à Bergame, Milan ou Créteil, avec 5 000 à 50 000 abonnés, qui parlent déjà de la vie de la diaspora. Les micro-créateurs et TikTokeurs de quartier surperforment les célébrités sur ce marché. Rémunération possible en abonnement Pro offert plutôt qu'en cash sur le budget serré.
- PARTENARIATS À COÛT ZÉRO — approcher les associations de ressortissants sénégalais en Italie, en France et en Espagne (dahiras, associations de village, coopératives de transfert), les agents de transfert d'argent de quartier, et les notaires/géomètres de Dakar et Diamniadio. Ces relais parlent déjà à la cible sur le sujet exact de l'argent envoyé au pays.
- PRESTATAIRES COMME CANAL — chaque prestataire vérifié inscrit à l'annuaire est un prescripteur gratuit auprès de ses propres clients propriétaires. Leur donner un message pré-écrit et un visuel « Profil vérifié Locawave » à publier sur leur statut WhatsApp.
- AVIS VÉRIFIÉS — réservés à ceux qui ont réellement loué ou réservé. Ils ne coûtent rien, ils sont impossibles à falsifier, et ils constituent l'actif défensif de l'annuaire face aux agences de suivi de chantier concurrentes qui vendent de la prestation humaine sans traçabilité.

---

## 5 — La critique adversariale

Un agent a été chargé de **démolir** ce dispositif avant que tu n'y mettes ton
argent. Ce qui suit n'est pas un compliment déguisé : lis-le avant de lancer.

### Les faiblesses relevées

#### Formulation du paiement : « vous ne réglez le prestataire qu'après avoir validé la phase », répétée à l'identique dans ~25 créations (HERO-05, FB-05, FBM-03, TT-01, TT-04, PRE-02…)

**Le problème.** C'est faux dans le produit livré. Dans src/app/dashboard/chantiers/[id]/page.tsx, « financer » exécute simplement .update({ escrow_status: 'held' }) et « valider » exécute .update({ escrow_status: 'released' }) : c'est une colonne texte, aucun argent ne bouge nulle part. src/lib/psp.ts a pour provider par défaut 'simulation', CinetPay lève « non configuré », et l'intégration PayDunya est un checkout-invoice classique sans aucune API de séquestre. Ni Wave ni Orange Money n'offrent de hold tiers. C'est la promesse centrale de toute la campagne et c'est la seule qui soit juridiquement dangereuse : elle porte sur de l'argent.

**La correction.** Interdire la diffusion de cette phrase tant qu'un circuit de blocage réel n'est pas contractualisé et testé. La remplacer par la mécanique honnête et déjà vraie : « Vous ne réglez une phase qu'après avoir vu et validé ses preuves. Locawave ne détient jamais les fonds. » Supprimer toute mention de blocage chez l'opérateur. En parallèle, faire relire la formulation retenue par un juriste UEMOA avant le premier franc dépensé.

#### « Les rappels partent tout seuls sur WhatsApp, le 3, le 7 et le 15 » (FB-01 SN, FB-03 SN, FB-06 DIA, FBM-02, TT-05, TT-07, HERO-06)

**Le problème.** La migration 051_retire_dead_http_jobs.sql documente que les crons appelant les Edge Functions WhatsApp renvoyaient 100 % de 401 sur 10 jours et ont été désactivés. Ils sont remplacés par run_escalating_reminders() (049) qui insère des notifications avec channel = 'inapp'. Les relances J+3/J+7/J+15 sont donc des notifications dans l'application, pas des messages WhatsApp — et côté locataire elles ne partent que s'il a un profile_id, donc s'il a accepté l'invitation et créé un compte. La promesse « votre locataire reçoit tout sur WhatsApp, là où il est déjà » est aujourd'hui fausse.

**La correction.** Deux options, pas trois. (a) Rebrancher l'envoi WhatsApp (templates approuvés + secret Vault) et le vérifier sur 5 locataires réels AVANT la semaine 4. (b) Reformuler partout : « relances automatiques dans l'application, et envoi WhatsApp en un clic ». Ne jamais diffuser (a) en promesse sans (a) en production.

#### TT-05, PLAN 5 : prompt d'image générant un fil WhatsApp avec trois relances automatiques et une pastille orange « envoyé automatiquement »

**Le problème.** C'est la fabrication d'une capture d'écran d'une fonctionnalité qui n'existe pas dans cet état. Une fausse preuve produit dans une publicité est une pratique commerciale trompeuse, et Meta la traite comme du contenu manipulé. Le même problème se pose pour toutes les captures IA de l'interface (frise de phases, bouton « Valider cette phase », bandeau « Vous validez, puis vous payez »).

**La correction.** Règle unique : aucune interface générée par IA dans une créa. On prend une capture réelle du dashboard, on la nettoie, on l'incruste au montage. Si l'écran réel n'est pas présentable, c'est un signal produit — on corrige l'écran, pas la publicité.

#### « Photos et vidéos datée, prises sur place » (HERO-02, FBM-03, TT-01, PRE-02, tout le pilier 1)

**Le problème.** Dans 044_construction_projects.sql, milestone_updates.taken_at est DEFAULT NOW() : c'est la date de dépôt, pas la date de prise de vue. Aucune lecture EXIF, aucune contrainte de capture in-app, aucun contrôle GPS. Un prestataire peut re-téléverser une photo de mars et le système la datera d'aujourd'hui — c'est exactement la fraude (« la même photo, sous le même angle, à trois mois d'écart ») que la campagne prétend éliminer. La créa promet une preuve technique que le produit ne produit pas.

**La correction.** Court terme : reformuler en « chaque dépôt est daté et rattaché à une phase » (vrai) au lieu de « photos datées et rattachées à une phase prises sur place » (faux). Moyen terme, avant la campagne diaspora : lire l'EXIF et afficher deux dates distinctes, « prise de vue » et « dépôt », et signaler visuellement tout écart supérieur à 48 h. C'est cette fonction-là, et elle seule, qui rend la promesse défendable.

#### Bucket de stockage 'chantier' créé public = true avec la policy chantier_storage_select_all (FOR SELECT USING bucket_id='chantier', sans restriction)

**Le problème.** Toutes les photos de chantier de tous les clients sont lisibles publiquement par quiconque possède ou devine l'URL. Une campagne dont la proposition centrale est la traçabilité et la confiance ne peut pas être lancée au-dessus d'une fuite de données. Le premier journaliste ou concurrent qui le remarque tue le positionnement en une publication.

**La correction.** Passer le bucket en privé et servir des URLs signées à durée limitée. C'est une migration d'une heure. À faire avant la première impression achetée, pas après.

#### FB-01 (Sénégal) écrit à la première personne avec un persona nommé et un visage photoréaliste généré ; idem TT-02 (« J'ai perdu, madame »), TT-06 (« Je n'osais pas demander »), HERO-01

**Le problème.** Ce sont des témoignages fabriqués joués par des humains de synthèse. La note stratégique le signale pour FB-01 puis livre quand même le texte, et ne le signale pas du tout pour TT-02, TT-06 et HERO-01, qui sont pourtant construits exactement pareil. Triple risque : pratique trompeuse, politiques Meta et TikTok sur les médias synthétiques réalistes, et surtout crédibilité — la communauté sénégalaise de Bergame ou de Créteil est petite, quelqu'un cherchera qui est cet homme et ne le trouvera pas.

**La correction.** Aucune créa à la première personne avec un visage généré. Trois voies propres : réécrire à la deuxième personne (« Vous avez perdu, faute d'un papier »), filmer un vrai client, ou ne montrer que des mains, des écrans et des lieux. Pour tout ce qui reste photoréaliste et synthétique, activer le label « contenu généré par IA » sur TikTok et Meta — le dispositif ne le mentionne nulle part.

#### Pilier « Le prix ne dépend pas de votre loyer » (FB-04 SN, FBM-02, FB-06 DIA) opposé à « une agence prend un pourcentage »

**Le problème.** Locawave prend 5 % sur les travaux, donc un pourcentage, sur des paniers de plusieurs millions — 72 500 FCFA rien que sur la phase d'élévation affichée à 1 450 000 FCFA dans FBD-02. Le prospect qui voit les deux annonces de la même marque lit un double discours. Pire : la cible Ndèye Fatou est une agence à qui l'on vend 45 000 FCFA/mois, pendant qu'ailleurs on explique que les agences coûtent cher.

**La correction.** Assumer la commission dans la créa chantier, en clair et dès la première ligne : « 5 % sur les travaux. 0 % sur votre loyer. » Et retirer la comparaison à l'agence du discours grand public : comparer au carnet et au temps perdu, pas à un partenaire commercial qu'on démarche par ailleurs.

#### Économie de la campagne diaspora : lead à 18 000-66 000 FCFA, rattrapé par la commission de 5 % sur les chantiers

**Le problème.** La commission n'est pas encaissable en l'état. 046_commissions.sql l'écrit noir sur blanc : « la commission est une ligne enregistrée (à prélever via PSP), affichée dans Finances », et elle ne se déclenche qu'au passage de escrow_status à 'released', c'est-à-dire à un clic manuel du propriétaire, sans flux monétaire. On achèterait donc des leads européens coûteux contre un revenu qui n'a aujourd'hui aucun circuit de perception.

**La correction.** Geler intégralement la campagne diaspora payante tant que le circuit d'encaissement de la commission n'a pas été exécuté de bout en bout sur au moins 3 chantiers réels. Jusque-là, la diaspora se travaille en organique (groupes, YouTube wolof, parrainage), à coût média nul.

#### Récit d'ouverture du feuilleton : HERO-01 « trois photos du même mur », TT-01 « on lui réclame l'argent de la toiture », FB-03 « elle n'est pas là où vous la croyiez »

**Le problème.** Le garde-fou « l'antagoniste est le flou » vit dans la note stratégique, pas dans la créa. À l'écran, un homme seul en Europe, des photos identiques, une demande d'argent : tout Sénégalais lit le sous-texte « ton frère te vole ». Le renversement salvateur (HERO-03, FBD-02) n'arrive qu'au troisième épisode, alors que 100 % de l'audience froide ne verra que le premier. On paie pour diffuser l'accusation et on garde le démenti pour les rares qui restent.

**La correction.** Inverser l'ordre du feuilleton. Ouvrir par HERO-03, du point de vue du chef de chantier : c'est lui qui veut que son travail soit vu et payé sans discussion. La preuve devient une demande venue du terrain, pas une surveillance venue de l'étranger. Le même produit, un récit qui ne peut pas se retourner contre la famille.

#### Score de ponctualité du locataire, affiché à 96/100 sur une fiche nominative dans FB-03 SN, TT-07, FB-06 DIA — et envoyé au locataire lui-même dans son résumé mensuel (050_chantier_alerts_and_tenant_digest.sql : « Votre score de ponctualité : 94/100 »)

**Le problème.** Deux problèmes. Culturellement, le scoring individuel visible est un import direct du credit scoring occidental plaqué sur une relation de voisinage et de famille étendue : le jour où un locataire découvre qu'il est noté 62/100, la relation est abîmée, et il en parlera. Publicitairement, exhiber une fiche nominative de notation dans une annonce grand public dit au futur locataire qu'il sera fiché — et c'est lui qu'on doit convaincre d'accepter l'invitation.

**La correction.** Côté produit : retirer le score du résumé envoyé au locataire (migration 050) et le remplacer par un fait neutre (« 11 mois payés à l'heure »). Côté créa : sortir le score de toutes les publicités grand public et ne le garder que dans les démonstrations produit destinées au propriétaire, formulé en historique, jamais en note.

#### « Le propriétaire a été vérifié — pièce d'identité et titre de propriété contrôlés avant publication » (FBM-01, FBM-05)

**Le problème.** Claim juridique fort et intenable. Le produit dispose d'une table kyc_documents relue manuellement par un admin ; rien n'atteste d'un contrôle cadastral. Au Sénégal, une large part du parc est détenue sous bail, permis d'occuper ou acte notarié non transcrit, et non sous titre foncier. Promettre le contrôle du titre expose à un litige dès le premier locataire lésé.

**La correction.** Reformuler strictement : « identité du propriétaire vérifiée, document de propriété fourni et conservé dans le dossier ». Ni plus, ni autre chose.

#### Marketplace érigé en « moteur numéro un » avec 15 à 25 messages privés par jour depuis un profil personnel

**Le problème.** Le DM à froid en volume est le chemin le plus court vers la restriction Messenger, et le plan en a conscience tout en le plaçant au centre. Par ailleurs, au Sénégal l'immobilier locatif se joue davantage dans les groupes Facebook dédiés et sur Expat-Dakar que sur Marketplace, qui reste dominé par l'occasion et l'électronique. On mise le moteur principal sur le canal le plus fragile.

**La correction.** Plafonner à 10 messages par jour et par profil, sur deux profils réels distincts. Rééquilibrer explicitement vers les groupes Facebook immobiliers de Dakar et Expat-Dakar, avec la même mécanique (commentaire utile de droit locatif d'abord, message ensuite).

#### Volume de production : 42 créations, 8 scripts TikTok, 6 épisodes de feuilleton, voix off en deux langues, versions 4:5 et 16:9, sur 12 semaines, par une personne qui génère aussi les images et fait le montage

**Le problème.** Ce n'est pas réalisable. Le résultat prévisible est un dispositif à moitié produit, diffusé sans test, avec des créas générées à la va-vite dont les montants en FCFA et les accents français sortiront faux — la note de production admet elle-même qu'il faut 3 à 4 générations par prompt. Le calendrier s'effondre en semaine 3.

**La correction.** Geler 36 créations. En produire 6 maîtresses, une par intention : HERO-03 (ouverture diaspora, angle prestataire), HERO-05 (conversion), FB-02 SN (avant/après quittance), FBM-02 (annonce service bailleurs), PRE-03 (recrutement prestataires), TT-04 (démo écran, réutilisable partout). Les décliner en 3 hooks chacune. C'est le levier de performance le moins cher et le seul tenable.

#### Nomenclature : deux jeux distincts de créations portent les identifiants FB-01 à FB-06 (campagne Sénégal et campagne diaspora)

**Le problème.** La règle la plus répétée du plan est de ne jamais mélanger Sénégal et diaspora dans un même ensemble publicitaire. Nommer les deux jeux à l'identique garantit la confusion dans le gestionnaire de publicités, dans les rapports et dans le plan de test. C'est une erreur d'exécution qui coûtera un budget mal attribué et des conclusions fausses.

**La correction.** Renommer immédiatement en SN-01…SN-06 et DIA-01…DIA-06, et reporter le renommage dans le plan média, le plan de test et le calendrier.

#### Annonces Marketplace de service affichées à « Prix : 0 FCFA (essai gratuit) » (FBM-03) et « Prix : 0 FCFA » (FBM-04)

**Le problème.** Marketplace n'est pas fait pour l'abonnement récurrent, et un prix à zéro attire massivement des curieux non qualifiés qui consomment le temps humain de réponse — la ressource la plus rare du dispositif. Cela dégrade aussi le taux de réponse mesuré, donc le pilotage.

**La correction.** Afficher le prix mensuel réel dans le prix et dans le titre (10 000 FCFA pour les bailleurs, gratuit uniquement pour l'inscription prestataire), et qualifier dès la première réponse type par une question filtrante (nombre de biens, quartier, chantier oui/non).

#### Rapports automatiques : « rapport hebdomadaire au propriétaire, résumé mensuel au locataire » présentés comme livrés (pilier 3, FB-01, FBM-06, tunnel étape 4)

**Le problème.** 051_retire_dead_http_jobs.sql indique que lw_monthly_report et lw_annual_report sont conservés mais « restent inopérants tant que le secret Vault n'est pas renseigné ». Le résumé mensuel au locataire, argument explicite de la réponse à l'objection d'Aminata Sow, n'est donc pas envoyé aujourd'hui.

**La correction.** Renseigner le secret Vault et vérifier un envoi réel avant la semaine 4, ou retirer le résumé mensuel de tous les argumentaires. Le rapport hebdomadaire, lui, est natif et peut rester au discours.

#### Fenêtre de diffusion unique « 20 h-21 h UTC » pour toutes les audiences

**Le problème.** Le plan la justifie en disant qu'elle touche Dakar en soirée, l'Europe au coucher et New York en fin d'après-midi. En pratique, une heure par jour sur une audience minuscule (bailleurs sénégalais d'une ville européenne) étrangle la sortie de phase d'apprentissage de Meta : l'algorithme n'a pas assez d'occasions de diffusion pour optimiser. On sabote l'apprentissage pour économiser un budget déjà faible.

**La correction.** Diffuser en continu pendant les 30 premiers jours pour laisser l'apprentissage se faire, relever ensuite la répartition horaire réelle des conversations ouvertes, et ne restreindre les créneaux qu'après cette mesure.

### Les risques

| Risque | Gravité | Comment le désamorcer |
|---|---|---|
| Publicité trompeuse sur le séquestre : « vous ne payez qu'après avoir validé » alors qu'aucun blocage n'existe (escrow_status est une colonne texte basculée à la main, PSP en mode simulation). Le premier client qui envoie 1 200 000 FCFA en croyant l'argent protégé et se fait rembourser dans le vide déclenche un litige que la publicité elle-même documente. | **Critique — bloquant absolu, aucune diffusion possible en l'état** | Chercher-remplacer la formulation dans les 25 créas concernées avant toute diffusion. Message de repli défendable : « Vous ne réglez une phase qu'après avoir validé ses preuves. Locawave ne détient jamais les fonds. » Faire valider par un juriste UEMOA. Ne rétablir la formulation d'origine que si un vrai mécanisme de blocage est contractualisé avec un PSP agréé et testé en production. |
| Fuite de données pendant la campagne : le bucket 'chantier' est public avec une policy SELECT sans restriction. Photos de chantiers, de maisons et de parcelles de tous les clients accessibles par URL, alors que la campagne vend la traçabilité et la protection. | **Critique** | Bucket privé + URLs signées à durée limitée. Une migration, une heure de travail, à faire avant la première impression achetée. |
| Suspension du compte publicitaire Meta ou TikTok : cumul de faux témoignages joués par des humains de synthèse (FB-01 SN, TT-02, TT-06, HERO-01), de captures d'interface fabriquées (TT-05 PLAN 5), de contenu financier promettant une sécurisation de fonds, et d'absence totale de label « contenu généré par IA ». | **Élevée — la perte du compte publicitaire arrête le plan entier, et la réouverture prend des semaines** | Passer les créas à la deuxième personne ou les tourner avec de vrais clients. Interdire toute UI générée. Activer le label IA sur les deux plateformes. Créer un second Business Manager de secours dès la semaine 1, avec un moyen de paiement distinct. |
| Blocage du canal WhatsApp : envoi de messages freeform hors fenêtre de 24 h via Twilio sans templates approuvés, absence d'opt-in documenté, et prospection sortante à 15-25 DM/jour depuis un profil personnel. Or WhatsApp est à la fois le canal de conversion et le canal de délivrance produit. | **Élevée** | Faire approuver 4 templates utilitaires avant la semaine 1 (rappel de loyer, quittance émise, invitation locataire, phase soumise). Documenter l'opt-in à l'ajout du locataire. Plafonner les DM à 10/jour sur deux profils. Prévoir le repli SMS pour les relances critiques. |
| CAC diaspora non récupérable : on achèterait des leads à 18 000-66 000 FCFA sur la promesse d'une commission de 5 % qui, dans le code, n'est qu'une ligne enregistrée dans la table commissions « à prélever via PSP », déclenchée par un clic manuel sans flux monétaire. | **Élevée — c'est le poste de 35 % du budget média** | Geler la campagne diaspora payante. Exécuter le circuit de perception de la commission sur 3 chantiers réels d'abord. En attendant, travailler la diaspora en organique : groupes Facebook, série YouTube en wolof, parrainage, associations de ressortissants. |
| Backlash culturel : le récit d'ouverture (photos identiques, demande d'argent, homme seul en Europe) est lu par l'audience comme une accusation contre la famille restée au pays. Le garde-fou existe dans la note stratégique, pas dans la créa vue par l'audience froide. Un commentaire viral du type « cette application dit que nos frères sont des voleurs » est un scénario réaliste et durable. | **Élevée — le dommage de marque est irréversible sur une communauté de cette taille** | Ouvrir le feuilleton par le point de vue du prestataire (HERO-03), qui réclame lui-même que son travail soit vu et payé. Faire pré-lire les 6 créas maîtresses par 5 personnes de la cible (2 en Europe, 3 au Sénégal, dont un chef de chantier) avant diffusion. Écrire les réponses types de modération à l'avance. |
| Annuaire prestataires vide au moment où la campagne diaspora promet des artisans vérifiés dans la commune du prospect. Le KYC est manuel, l'objectif de 10 vérifications/semaine repose sur du temps admin non budgété. | **Élevée** | Le plan le prévoit déjà en phase 1 : le tenir strictement. Ne pas diffuser PRE-05 ni aucune créa diaspora mentionnant l'annuaire tant que 20 profils vérifiés ne sont pas en ligne, répartis sur au moins 3 zones. |
| Utilisation des marques Wave et Orange Money, nommées dans plus de 25 créas, sans accord d'usage — et associées à une affirmation de blocage de fonds que ces opérateurs ne proposent pas. Un opérateur peut exiger le retrait, publiquement. | **Moyenne à élevée** | Obtenir un accord écrit d'usage de marque, ou basculer sur une formulation générique (« votre opérateur de mobile money »). Ne jamais faire dire à un opérateur ce qu'il ne fait pas. |
| Sur-promesse d'onboarding : « votre première quittance ce soir » alors que l'utilisateur doit créer une organisation, un bien, une unité, un locataire, un bail et une échéance avant d'y arriver. Le KPI d'activation à 48 h vise 40 % sans que le nombre d'étapes ait été mesuré. | **Moyenne — mais elle détermine tout le reste du tunnel** | Chronométrer le parcours réel sur 5 utilisateurs non entraînés avant l'achat média. Si le délai dépasse 15 minutes, corriger le produit avant la publicité. Prévoir un mode de démarrage minimal : un bien, un locataire, un montant, une quittance. |
| Saturation humaine : au-delà de 30 conversations WhatsApp ouvertes par semaine, le délai de réponse s'effondre, le taux de conversion chute et les prospects racontent publiquement qu'on ne répond pas. La qualité de réponse est le vrai produit à ce stade. | **Moyenne** | Fixer un plafond de conversations ouvertes par semaine et baisser les budgets quand il est atteint, plutôt que de laisser filer. Écrire les 4 réponses types et les 3 relances avant l'ouverture des campagnes. |
| Dépendance TikTok : minimum de dépense de 50 USD/jour au niveau campagne, aucune donnée d'audience publicitaire publiée pour le Sénégal, et un antécédent de suspension nationale de la plateforme. | **Faible à moyenne** | Le plan a raison de le garder 100 % organique en budget serré. Le maintenir ainsi, et ne jamais faire de TikTok un canal unique pour un segment. |

### Ce qui manque encore au dispositif

- PAGE D'ATTERRISSAGE : il n'existe aucune LP par campagne. Le seul point d'arrivée hors WhatsApp est src/app/page.tsx, une home SaaS générique avec grille tarifaire. Aucune LP chantier diaspora, aucune page « comment marche la validation par phase », aucune FAQ paiement à la validation, aucun élément de réassurance juridique. Le plan achète du trafic européen à 18 000-66 000 FCFA le lead vers une page qui ne parle pas de chantier.
- PREUVE SOCIALE : zéro témoignage, zéro chiffre de traction, zéro logo, zéro avis affiché au moment où l'on demande à un homme de Bergame de faire transiter 20 millions FCFA par un outil inconnu. Les témoignages n'arrivent qu'en semaine 11 : c'est 8 semaines de média payé sans aucune preuve tierce.
- CONFORMITÉ WHATSAPP : 100 % du tunnel pointe vers click-to-WhatsApp, mais le dispositif ne prévoit ni compte WABA vérifié, ni templates utilitaires approuvés, ni politique d'opt-in, ni mention de collecte. supabase/functions/send-whatsapp/index.ts envoie un Body freeform : hors fenêtre de 24 h, Meta le refuse.
- CAPACITÉ HUMAINE : 15-25 messages Marketplace/jour + accompagnement WhatsApp humain 48 h + revue KYC manuelle (kyc_documents est validé à la main par un admin) + prospection agences = 1 à 2 ETP. Le scénario « serré » à 60 000 FCFA de budget total en phase 1 n'en tient aucun compte. C'est le poste le plus cher du plan et il est à zéro.
- LE LOCATAIRE N'EXISTE PAS DANS LE DISPOSITIF : il reçoit les relances, il est noté (score de ponctualité), il est invité de force — et aucune créa, aucune notice, aucun argument ne lui est destiné. C'est pourtant lui qui peut faire échouer l'usage en refusant l'invitation.
- MOMENTS CLÉS CALENDAIRES ABSENTS : le calendrier 12 semaines est neutre. Il ignore Ramadan/Korité et Tabaski (pics de transferts diaspora ET de tension de trésorerie), la rentrée scolaire d'octobre (pic de retards de loyer), le Magal de Touba, et les retours au pays de juillet-août et décembre — qui sont exactement le déclencheur émotionnel de FBD-03.
- SUIVI DE PIPELINE : le plan mesure des coûts média mais aucun CRM, aucun tag de conversation, aucune traçabilité lead → essai → payant. Sans cela, les KPI « coût par abonné payant » sont incalculables et tout le plan de test devient décoratif.
- PUSH NOTIFICATIONS : la créa signature de toute la campagne (HERO-04, FB-05, TT-08, TT-04) montre une notification sur écran verrouillé. Le code ne contient aucune implémentation Web Push (seul src/components/app/PWARegister.tsx existe). L'alerte « aucune photo depuis 7 jours » est une notification in-app, visible uniquement si l'utilisateur ouvre l'application.
- CAPTURES D'ÉCRAN RÉELLES : aucune créa ne montre l'interface réelle. Toutes les UI sont reconstituées par IA. Rupture de promesse garantie à la première ouverture de l'app par l'inscrit.
- PLAN DE MODÉRATION ET DE CRISE : rien n'est prévu pour le premier commentaire « c'est une arnaque », ni pour le premier litige chantier réel exposé publiquement sous une annonce.
- CADRE JURIDIQUE : aucune revue juridique UEMOA/BCEAO d'un discours public sur du blocage de fonds, ni accord d'usage des marques Wave et Orange Money, citées nommément dans plus de 25 créas.
- MESURE DE LA FRICTION D'ONBOARDING : le KPI vise 40 % d'activation à 48 h sans jamais compter le nombre d'écrans entre l'inscription et la première quittance (org → bien → unité → locataire → bail → échéance → paiement → quittance). Le nombre d'étapes n'est ni mesuré ni budgété en réduction.

### À corriger tout de suite, c'est rapide

- Chercher-remplacer la phrase de blocage de fonds dans les 25 créas concernées : « Vous ne réglez une phase qu'après avoir validé ses preuves. Locawave ne détient jamais les fonds. » Une heure de travail, elle retire le seul risque juridique critique du dispositif.
- Passer le bucket de stockage 'chantier' en privé avec URLs signées. Une migration, avant la première impression achetée.
- Retirer le score de ponctualité du résumé mensuel envoyé au locataire (migration 050) et de toutes les créas grand public. Le remplacer côté propriétaire par un fait neutre : « 11 mois payés à l'heure ».
- Renommer les identifiants en SN-01…SN-06 et DIA-01…DIA-06 dans les créas, le plan média et le plan de test, pour rendre impossible le mélange des deux économies dans le gestionnaire.
- Faire approuver 4 templates WhatsApp Business (rappel de loyer, quittance émise, invitation locataire, phase soumise) dès la semaine 1 : sans eux, aucune relance ne partira hors fenêtre de 24 h.
- Remplacer « photos datées et rattachées à une phase prises sur place » par « chaque dépôt est daté et rattaché à une phase » partout. Gratuit, et cela transforme une promesse fausse en promesse tenue.
- Prendre 8 vraies captures d'écran de l'application (dashboard, frise de phases, quittance PDF, notification, fiche locataire, annuaire) et interdire toute UI générée par IA dans les créas.
- Inverser l'ordre du feuilleton : ouvrir par HERO-03 (le point de vue du chef de chantier). Aucun coût de production, cela désamorce le risque culturel dès l'audience froide.
- Réécrire FB-01 SN, TT-02 et TT-06 à la deuxième personne en attendant de vrais témoignages filmés, et activer le label « contenu généré par IA » sur Meta et TikTok.
- Geler 36 créations et n'en produire que 6 maîtresses, déclinées en 3 hooks chacune. Le calendrier redevient tenable par une personne seule.
- Construire deux pages d'atterrissage avant le premier franc de média : une chantier (frise de phases, mécanique de validation, FAQ paiement à la validation) et une locative (quittance, relances, tableau de bord).
- Corriger « titre de propriété contrôlé » en « identité vérifiée et document de propriété fourni » dans FBM-01 et FBM-05.
- Diffuser en continu pendant les 30 premiers jours au lieu de la fenêtre unique 20 h-21 h UTC, puis mesurer la répartition horaire réelle des conversations avant de restreindre.
- Chronométrer sur 5 utilisateurs non entraînés le parcours inscription → première quittance. Si c'est au-dessus de 15 minutes, corriger le produit avant d'acheter du média.
- Renseigner le secret Vault des rapports mensuels, ou retirer le résumé mensuel au locataire de tous les argumentaires — c'est un argument central de la réponse à l'objection d'Aminata Sow.

---

## 6 — Comment utiliser les prompts

### Chaîne de production

1. **Génère l'image** dans NanoBanana Pro en copiant le bloc `Prompt image` tel quel.
   Ne traduis pas le prompt en français : le modèle est plus précis en anglais. Le texte
   entre guillemets à l'intérieur du prompt, lui, doit rester en français — c'est ce qui
   sera incrusté dans le visuel.
2. **Vérifie le rendu du texte incrusté.** NanoBanana Pro rend bien le texte, mais les
   accents français (é, è, à, ç) peuvent se dégrader. Relis chaque visuel avant de le
   diffuser : une faute d'orthographe dans une pub détruit la crédibilité d'un produit
   qui vend la rigueur.
3. **Anime l'image** en suivant le bloc `Animation image → vidéo` : il précise le type de
   mouvement, la durée et la transition vers le plan suivant.
4. **Monte** en respectant l'ordre des plans pour les scripts TikTok et le feuilleton
   chantier — la narration est construite, l'ordre n'est pas décoratif.
5. **Colle le texte de l'annonce** dans Meta Ads Manager ou TikTok Ads.

### Trois règles à ne pas casser

- **Les montants sont en FCFA avec une espace comme séparateur** : `350 000 FCFA`, jamais
  `350,000 FCFA`. C'est la convention du produit et du pays.
- **Ne promets rien qui ne soit pas dans le produit.** Chaque pilier du message est adossé
  à une fonctionnalité réellement livrée. Si tu improvises une accroche, vérifie qu'elle
  correspond à quelque chose que l'utilisateur trouvera vraiment en s'inscrivant.
- **Sur la campagne diaspora, garde le ton digne.** Le sujet du détournement de fonds au
  pays touche à la confiance familiale. Accuser implicitement le frère ou le cousin resté
  au pays est un terrain miné qui peut retourner l'audience contre la marque. L'angle
  juste est « la preuve rassure tout le monde, y compris celui qui gère sur place ».
