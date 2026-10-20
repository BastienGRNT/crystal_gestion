# Crystal — ce qu'on construit et pourquoi

Outil de gestion pour petites équipes de dev (2 à 5 personnes). Objectif : passer **moins de 2 % du temps à
s'organiser**. En arrivant, on sait en 10 secondes : ce que je fais, ce qu'on attend de moi, si l'autre est là et sur
quoi, ce qui presse. `CLAUDE.md` décrit comment travailler dans le code.

## 1. Tout se passe dans un projet

Un projet = **son équipe** (on invite par projet), son **accueil**, son **tableau**, ses **priorités**, sa
**discussion**, son **planning**, ses **documents** et ses **accès**. Un compte peut être dans plusieurs projets ; le
sélecteur en haut de la barre latérale passe de l'un à l'autre. On ne voit que les projets dont on est membre.

## 2. La méthode : Cap · Étapes · Flux

Pas de sprints ni de cérémonies : trop de temps d'organisation pour deux personnes qui font tout (conception, dev,
mise en ligne, vente). On ne **saisit** que des intentions (ce qu'on vise, ce qu'on a décidé) ; l'avancement, le retard,
le bilan, le compte rendu et l'ordre du jour **se calculent** depuis les tâches. Le même outil tient deux semaines ou un an.

- **Le Cap** (pourquoi) : une note mise en forme, écrite une fois en dix minutes (§ 2 bis).
- **Les Étapes** (où on va) : une suite de livrables datés (§ 2 bis). La date d'une étape est un **budget** : si ça
  déborde, on coupe le périmètre ou on décide de décaler, jamais en silence.
- **Le Flux** (comment on avance) : le Kanban priorisé ci-dessous.

1. **Kanban (le flux)** : `Idées → À faire → En cours → En revue → Terminé`.
   - **Idées** : le backlog, repliée à gauche du tableau. On y jette ce qui n'est pas pour maintenant, et on n'y pense plus.
   - **En cours** : limite d'encours, **2 tâches par personne**. L'en-tête passe en orange au-delà : on finit avant de commencer.
   - **En revue** : l'autre vérifie (relecture de code, test sur son téléphone). À deux, la relecture part
     automatiquement chez l'autre et lui arrive en notification.
   - **Bloqué** : un drapeau avec la raison (« en attente du client »), visible en rouge partout.
   - Une carte qui ne bouge plus depuis 4 jours affiche son ancienneté : c'est une carte dont il faut parler.
2. **Eisenhower (la priorité)** : chaque tâche a sa case (Maintenant, À planifier, À déléguer, Plus tard, ou à trier).
   La page **Priorités** sert à décider ; la colonne **À faire** du tableau est rangée dans cet ordre, et y glisser une
   carte d'un groupe à l'autre change sa priorité. Les deux vues montrent les mêmes tâches.
3. **Un objectif de la semaine** en une phrase, en haut de l'accueil du projet.

Sur l'accueil, « **Ta prochaine tâche** » propose la première tâche à prendre (à moi d'abord, puis sans personne,
dans l'ordre de la matrice puis de l'échéance) avec un bouton « Je m'y mets ».

## 2 bis. La feuille de route

Une page, `/feuille-de-route`, réunit tout ce qui n'est pas l'exécution du jour ; chaque élément remonte là où on
travaille déjà (accueil, tableau, fiche tâche, discussion, compte rendu, rattrapage, recherche).

| Outil     | Remplace                                                                                    | Ce qui se fait tout seul                                                       |
| --------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Modèles   | Phases types, checklists de mise en ligne et de lancement                                   | Étapes datées au prorata jusqu'à la livraison (vendredis), tâches types, canal |
| Étapes    | WBS, PBS, jalons, phases, Now/Next/Later, Gantt, burn-up                                    | Avancement, date prévue au rythme réel, retard, étape en cours, bilan          |
| Le Cap    | Note de cadrage (QQOQCCP), brief client ; détail dans « Comprendre le projet » (§ 2 quater) | Quand et Comment : depuis les étapes et le cahier technique                    |
| Décisions | Registre de décisions, D du RAID, demandes de changement, ADR                               | Décision écrite à chaque report de date et à chaque tâche sortie d'une étape   |

- **Modèles** (à la création du projet, ou depuis la feuille de route vide) : Express (2 étapes), Produit (Preuve →
  Conception → Le cœur → Bêta privée → Mise en ligne → Lancement → Vie du produit), Projet client, Vide. Suggéré selon
  la date de livraison (≤ 31 jours : Express). Ensuite, plus aucun lien : tout se modifie.
- **Étapes** : titre, « C'est fini quand… », date cible (facultative). Datées par date, puis les autres dans leur
  ordre (Monter / Descendre). L'étape en cours = la première non close. Trois niveaux suffisent : étape → tâche →
  checklist. Les **pistes** (tâches `idea` d'une étape) ne comptent ni dans l'avancement ni dans la prévision.
  - Prévision d'une étape N : tâches ouvertes des étapes 1 à N + tâches sans étape, au rythme des 4 dernières semaines
    (rien sous 3 tâches finies). La livraison ne compte que les étapes datées avant elle.
  - **Clore** : face au « C'est fini quand… ». Une étape close ne garde que du travail terminé : le reste passe à
    l'étape suivante ou retourne aux idées sans étape (décision écrite). Le bilan (prévu / réel, tâches ajoutées en
    route, décisions, une ligne « à changer ») part dans `#général`.
  - Tableau et priorités montrent par défaut l'étape en cours (+ les tâches sans étape) ; en cours, en revue et terminé
    restent toujours visibles. Une carte d'une autre étape porte sa pastille. Une tâche créée va dans l'étape affichée.
- **Le Cap** : la note de cadrage en QQOQCCP (pourquoi, qui, quoi, ce qu'on ne fait pas, où, combien ; quand et
  comment se calculent). « Notre réponse en une phrase » est la description du projet, sous son nom. Les trous du
  cadrage (au plus 5) s'affichent sur l'accueil.
  - **À vérifier** (au plus 3) : ce sur quoi le projet parie. « Vérifier » crée la tâche dans l'étape en cours ; sa
    fin demande « vrai ou faux ? », et la réponse devient une décision.
- **Modules** : les parties d'un produit qui grandit (site, rendez-vous, ordonnances…). Un nouveau module est une
  ligne, jamais un nouveau projet ; c'est l'axe « où », indépendant des étapes (« quand »). Santé par module (ouvertes,
  bugs, bloquants, finies en 4 semaines), pastille sur les cartes, filtre du tableau, `+rdv` dans une saisie.
- **Édition** : tout se change sur place (clic sur le texte) ; les étapes se rangent en les glissant (l'ordre est celui
  de l'équipe, la date un budget : une date avant celle de l'étape d'avant est signalée) ; une étape s'ajoute en bas
  en une ligne (« Bêta privée 15/12 ») ; une date déplacée demande « pourquoi ? » et devient une décision.
- **Décisions** : écrites en tête du journal, ou « C'est décidé » (le marteau) sur n'importe quel message, depuis la
  fiche tâche ou une étape. Jamais modifiées : on les **remplace** (l'ancienne reste barrée) ; seul l'auteur peut en retirer une.

Écartés : RACI (à deux, `assignee` + `reviewer` disent tout ; l'OBS se lit dans les parties prenantes), estimations,
tailles et burn-down (le rythme réel suffit), dépendances et Gantt complet (personne ne les tient à jour ; « bloqué »
couvre le reste), plan de référence figé et contrôle des changements (les décisions suffisent), registre des risques
manuel (les hypothèses et le TOWS en tiennent lieu), PESTEL, BMC complet, rétrospectives (le bilan est calculé),
time tracking.

## 2 quater. Comprendre le projet (le cadrage)

Le cadrage est une **référence** : on l'écrit au démarrage, on le relit pour ne pas perdre le cap, un nouvel arrivant
le lit pour tout comprendre. Le travail de chaque jour reste dans le tableau : une fonctionnalité s'y ajoute en
quelques secondes, rattachée (`^epic`, `^us-7`) ou non. Rien du cadrage ne bloque une tâche.

- **Création** (`/demarrer`) : type (Express, Produit, Projet client), pourquoi / qui / quoi, les modules, les étapes
  avec leur « fini quand ». Dix minutes, puis le tableau. Le reste se propose sur l'accueil, une chose à la fois.
- **Note de cadrage** : QQOQCCP, parties prenantes (matrice influence × intérêt, rythme d'information), indicateurs
  de succès (les chiffres), paris à vérifier (les hypothèses), SWOT et TOWS (une stratégie devient une epic ou un pari).
- **Cahier des charges fonctionnel** (plan d'expression de besoins) : contexte et objectifs (pourquoi + initiatives +
  chiffres), périmètre (calculé : epics prévues ; exclu = « ce qu'on ne fait pas » + epics « plus tard »), personas,
  cartographie (les modules, deux niveaux = le PBS), initiative → epic → user story avec ses critères d'acceptation,
  parcours et règles de gestion, jeu de données de test (rassemblé depuis les critères), glossaire.
- **Cahier des charges technique**, séparé : performance, sécurité et RGPD, plateformes et accessibilité, services
  externes, hébergement, stack, environnements, définition de « fini » (affichée sur la fiche tâche), conventions,
  après la mise en ligne.
- **Ce qui se calcule** : état d'une story (à faire, en cours, livrée, en prod) depuis ses tâches et ses critères,
  avancement d'une epic, epics que fait avancer chaque étape (le WBS = étapes × modules), « À ranger » (fonctionnalités
  non rattachées), note client d'une mise en prod (« Ce que vous pouvez faire maintenant »), compte rendu (stories
  livrées, qui informer). Chaque document s'exporte en Markdown.
- Sur la fiche tâche : d'où elle vient (initiative › epic › story), les critères que le relecteur coche, « Rattacher »
  ou « En faire une story ». Passer une epic « à plus tard » renvoie son travail ouvert aux idées, avec une décision.

## 2 quinquies. Le chef de projet IA

Il ne s'active que sur un clic (« Découper cette étape », « Écrire les stories de cette epic »…) et ne fait que
**proposer** : on coche, on réécrit, on applique (au plus une demande de modification). Ses ops sont une liste blanche
de commandes existantes : jamais de suppression, de coffre, d'assignation, de tâche démarrée ou finie, ni de date
d'étape sans son pourquoi. Contexte compact (titres, jamais les notes ni le coffre), petit modèle pour les demandes
courantes, plus grand pour ce qui demande du jugement, cache (même question, même réponse, gratuite), quota par projet
et par mois, consommation sur la page Compte. Boutons : découper une étape, reformuler une tâche ou les idées, trier,
proposer les étapes, compléter la note de cadrage ou le cahier technique, proposer le SWOT / TOWS, proposer les epics
et stories, écrire les stories d'une epic, ranger les tâches, quoi couper, tirer décisions et tâches d'une discussion,
bilan de santé.

## 2 ter. La couche dev : types, bugs, mises en prod, indicateurs

- **Quatre types de tâche** : fonctionnalité, bug, technique, action (hors code : appeler, vendre, facturer). Le type se
  devine des premiers mots ou se dit en préfixe (`feat:`, `fix:`, `bug!:`, `tech:`, `action:`), se change en un clic.
  Rythme et prévisions ne comptent que fonctionnalités et technique : bugs et actions sont une taxe qui ralentit le
  rythme au lieu de le gonfler. Un bug n'a pas d'étape par défaut (c'est du flux).
- **Bug en 5 secondes** : touche `B` partout, palette « Signaler un bug », bouton « Bug ». « Signalé par » (avec les noms
  déjà saisis) et notes guidées. **Bloquant** : case Maintenant, toute l'équipe prévenue, bandeau rouge sur Ma journée et
  l'accueil, ordre du jour du prochain point s'il dure plus d'un jour.
- **Mises en prod** (page) : ce qui est terminé et pas en prod, groupé Nouveautés / Corrections / Technique, avec ce qui
  n'est pas fini en avertissement ; nom proposé (v1.3 → v1.4, ou v1.3.1 pour des corrections) ; note client générée et
  modifiable ; « À prévenir » (ceux qui ont signalé les bugs corrigés) ; « C'est en prod » fige le changelog et le poste
  dans #général. Une version est un fait, pas un plan (ça, ce sont les étapes). Une tâche rouverte repart.
- **Indicateurs** (page) : jusqu'à 5 chiffres du projet (unité, cible, sens), notés chaque semaine en ligne (l'accueil
  les demande quand il en manque), avec leur courbe ; et le rythme de l'équipe, calculé : terminé par semaine et par type,
  temps du début à la fin, bugs ouverts (signalés / corrigés), relectures qui attendent, échéances tenues, bug bloquant
  corrigé en, où part le temps.
- **Code** : nom de branche (`fix/12-horaires-samedi`) et message de commit à copier depuis la fiche.
- **Ma journée** (`/`) : tous projets confondus, bugs bloquants, pour toi maintenant, prochaine tâche par projet,
  échéances à 7 jours, l'équipe (dispo, en cours, heures prévues), mes projets.

## 3. Les pages d'un projet

| Page             | Rôle                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accueil          | À rattraper (voir plus bas), pour toi maintenant (en cours, à relire, prochaine tâche, tes questions en attente), échéances et ce qui les menace, le prochain point, l'équipe, ce qui a bougé ; « Compte rendu » copie la semaine |
| Feuille de route | Le cap, la frise et les étapes (avancement, prévision, clore, glisser), les modules, « À vérifier », les décisions                                                                                                                |
| Tableau          | Le Kanban : filtres (texte, étape, personne), colonnes fixes qui défilent seules, bouton « étape suivante » ; en glissant, un emplacement de la taille de la carte et rien d'autre ne bouge                                       |
| Priorités        | La matrice 2×2 + « À trier », classement en un clic ou en glissant                                                                                                                                                                |
| Discussion       | Canal `général` + canaux libres (créer, renommer, supprimer), réponses citées, `@` mentions, `#12` pour une tâche, pièces jointes                                                                                                 |
| Planning         | La semaine : dispo / prévu / libre par personne (tous projets), moments ensemble, « Poser » une tâche en 1 clic ou « Proposer la semaine », semaine type en 1 clic, échéances, fins d'étape et mises en prod sur les jours        |
| Indicateurs      | Les chiffres du projet (saisis chaque semaine) et le rythme de l'équipe (calculé)                                                                                                                                                 |
| Mises en prod    | Ce qui part, la note client, qui prévenir, l'historique des versions                                                                                                                                                              |
| Documents        | Dossiers et sous-dossiers, glisser un fichier sur un dossier, « Déplacer vers… », recherche dans tout le projet ; les pièces jointes du chat vont dans « Partagés dans la discussion »                                            |
| Accès            | Comptes partagés (identifiant, mot de passe chiffré, lien, note), copiés en un clic                                                                                                                                               |
| Équipe           | Membres, inviter par lien, retirer / quitter, réglages et archivage du projet                                                                                                                                                     |

**À rattraper** (en haut de l'accueil) répond à « qu'est-ce que j'ai raté ? » sans ouvrir une autre page :

- les messages manqués, canal par canal (fils de tâches compris) : les derniers messages eux-mêmes, les mentions
  surlignées, et un champ pour **répondre directement** (le canal passe alors en lu) ;
- ce qu'on te demande (tâche confiée, relecture, mention ailleurs) ;
- **pendant ce temps** : un compte rendu automatique par coéquipier (terminé, en revue, commencé, bloqué, fichiers…),
  chaque tâche une seule fois dans son dernier état. C'est le point du matin, sans réunion.
- « Tout est vu » remet le compteur à zéro (messages lus, notifications lues, nouveau point de départ).

## 4. Ce que Crystal fait à ta place

L'organisation qu'on ne fait plus soi-même, parce que l'app sait déjà tout ce qu'il faut :

- **Les questions ne se perdent plus.** Un message qui mentionne quelqu'un et contient un « ? » devient une question
  suivie, sans rien cocher (le champ le dit avant l'envoi). Elle reste en haut de l'accueil de la personne
  (« On attend ta réponse », avec le temps d'attente et un champ pour répondre), dans « Tu attends une réponse » chez
  celui qui demande, en bandeau au-dessus du champ de message du canal, et sur la carte de la tâche (« Attend la
  réponse de… »). Elle se ferme toute seule à la réponse, et celui qui demandait le sait.
- **« Ça tient ? »** Chaque échéance est croisée avec ce que l'app sait : bloquée, en attente d'une réponse, personne
  dessus, pas de dispo dans le planning de qui doit agir d'ici là, pas encore commencée à deux jours. C'est dit sur
  l'accueil et dans la fiche, juste sous la date. La livraison du projet est comparée au rythme réel des quatre
  dernières semaines (« 4 tâches de trop ») : aucune estimation à faire.
- **Le prochain point se prépare tout seul.** Le prochain moment où vous êtes dispo ensemble (d'après le planning) et
  l'ordre du jour : questions ouvertes, relectures, blocages, échéances en danger, tâches à trier, cartes qui ne
  bougent plus. Un clic l'envoie dans `#général`. S'il n'y a rien, l'app dit que le point peut attendre.
- **Le compte rendu en un clic**, pour le client (sans le technique, avec « Ce qu'on attend de vous ») ou pour
  l'équipe (avec le rythme). L'étape en cours, terminé, en cours, bloqué, mis en prod, décidé cette semaine, ensuite, les
  chiffre du projet et si la livraison tient : en texte, prêt à coller dans un mail au client.
- **Les étapes se suivent toutes seules.** Une étape en retard ouvre le prochain point (« décider quoi couper »), une
  étape finie propose de la clore, et le bilan s'écrit tout seul.

Chaque tâche a sa fiche (tiroir `?tache=<id>`) : statut, priorité, qui s'en occupe, qui relit, échéance, blocage,
étapes (checklist), notes et commentaires.

## 5. Arbitrages

| Sujet           | Décision                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comptes         | Inscription libre (`/inscription`) : on ne voit que ses projets. Un lien d'invitation (7 jours, usage unique) fait entrer dans un projet, avec ou sans compte |
| Droits          | Tous les membres d'un projet sont égaux ; seul un responsable retire quelqu'un ; un projet garde un responsable                                               |
| Dispos          | Personnelles (vues dans tous mes projets), à l'heure près ; le pré-remplissage = « Copier la semaine d'avant » et les boutons Matin / Après-midi / Soir       |
| Fuseaux         | La copie de semaine est calculée sur l'appareil (il connaît le fuseau), le serveur ne fait que stocker                                                        |
| Qui a fait quoi | Commencer ou finir une tâche sans personne la donne à celui qui le fait                                                                                       |
| Suppressions    | Retrait immédiat + « Annuler » 6 s ; la commande part à l'expiration                                                                                          |
| Secrets         | AES-256-GCM avec `APP_SECRET` ; le mot de passe n'est envoyé qu'au clic sur « Afficher » ou « Copier »                                                        |
| Fichiers servis | `nosniff`, CSP `sandbox` (sauf PDF), HTML/JS toujours téléchargés : un fichier envoyé ne peut pas exécuter de code                                            |
| Temps réel      | Chaque connexion n'entend que ses projets et ses coéquipiers ; à l'arrivée ou au départ d'un membre, le client recharge                                       |
| Dernier passage | Par personne et par projet, posé par « Tout est vu » ; sans passage, depuis l'arrivée dans le projet, et jamais plus de 7 jours en arrière                    |
| Questions       | Mention + « ? » (hors code et liens). Fermée par la réponse citée d'une personne interrogée (dans un fil de tâche, n'importe quel commentaire) ou « Clore »   |
| Prévisions      | Aucune estimation demandée : dispos sûres du planning et rythme des 4 dernières semaines (à partir de 3 tâches finies)                                        |
| Données client  | Un snapshot de tous mes projets au chargement, puis le flux WebSocket ; navigation instantanée                                                                |
| Conflits        | Dernière écriture gagne ; numérotation `#12` atomique ; positions fractionnaires (tableau et matrice)                                                         |

## 6. Plus tard

- Fiche client (qui a demandé quoi), temps passé et budget vendu d'un projet client.
- Chiffres relevés automatiquement (API), lien Git (une PR qui cite `#12`), tâches récurrentes.
