# Crystal — ce qu'on construit et pourquoi

Outil de gestion pour petites équipes de dev (2 à 5 personnes). Objectif : passer **moins de 2 % du temps à
s'organiser**. En arrivant, on sait en 10 secondes : ce que je fais, ce qu'on attend de moi, si l'autre est là et sur
quoi, ce qui presse. `CLAUDE.md` décrit comment travailler dans le code.

## 1. Tout se passe dans un projet

Un projet = **son équipe** (on invite par projet), son **accueil**, son **tableau**, ses **priorités**, sa
**discussion**, son **planning**, ses **documents** et ses **accès**. Un compte peut être dans plusieurs projets ; le
sélecteur en haut de la barre latérale passe de l'un à l'autre. On ne voit que les projets dont on est membre.

## 2. La méthode : un Kanban priorisé

Pas de sprints ni de cérémonies : trop de temps d'organisation pour deux personnes. On fusionne trois idées éprouvées.

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

## 3. Les pages d'un projet

| Page       | Rôle                                                                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accueil    | À rattraper (voir plus bas), pour toi maintenant (en cours, à relire, prochaine tâche, tes questions en attente), échéances et ce qui les menace, le prochain point, l'équipe, ce qui a bougé ; « Compte rendu » copie la semaine |
| Tableau    | Le Kanban : filtres (texte, personne), colonnes fixes qui défilent seules, bouton « étape suivante » ; en glissant, un emplacement de la taille de la carte et rien d'autre ne bouge                                              |
| Priorités  | La matrice 2×2 + « À trier », classement en un clic ou en glissant                                                                                                                                                                |
| Discussion | Canal `général` + canaux libres (créer, renommer, supprimer), réponses citées, `@` mentions, `#12` pour une tâche, pièces jointes                                                                                                 |
| Planning   | Agenda à l'heure près : on dessine ses dispos (ou « peut-être ») et le travail prévu, moments dispos ensemble, échéances et tâches finies sur les jours, « Copier la semaine d'avant »                                            |
| Documents  | Dossiers et sous-dossiers, glisser un fichier sur un dossier, « Déplacer vers… », recherche dans tout le projet ; les pièces jointes du chat vont dans « Partagés dans la discussion »                                            |
| Accès      | Comptes partagés (identifiant, mot de passe chiffré, lien, note), copiés en un clic                                                                                                                                               |
| Équipe     | Membres, inviter par lien, retirer / quitter, réglages et archivage du projet                                                                                                                                                     |

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
- **Le compte rendu en un clic.** Terminé, en cours, bloqué, ensuite, et si la livraison tient : en texte, prêt à
  coller dans un mail au client.

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

- Matrice personnelle, tous projets confondus (« mes urgences »).
- Notifications du navigateur.
