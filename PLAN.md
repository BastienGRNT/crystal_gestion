# Crystal — plan de référence

Outil de gestion de projet privé (≈5 personnes, sur invitation). Ce fichier décrit **ce qu'on construit** et les
arbitrages. `CLAUDE.md` décrit **comment travailler dans le code**.

## 1. Modèle de données

### Registre d'éléments (cœur du système de références)

Tout objet référençable possède une ligne dans `elements` :

| colonne                                  | rôle                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `id` (uuid)                              | clé primaire, **partagée** avec la table du module (ex. `tasks.id = elements.id`, FK `on delete cascade`) |
| `project_id`, `kind`, `number`           | `kind` → préfixe (`task` → `T`), `number` séquentiel par (projet, préfixe) → `T-12`                       |
| `title`, `status`                        | titre et statut court dénormalisés : recherche Cmd+K, `#` autocomplete, aperçu au survol                  |
| `created_by`, `created_at`, `updated_at` |                                                                                                           |

Préfixes : `F` feature · `T` tâche · `D` décision · `X` fix · `S` changement de périmètre · `I` idée · `M` message ·
`R` ressource (compte, lien, contact, fichier). Numérotation atomique via `element_counters` (`update … returning`).

`element_references(source_id, target_id)` : références libres extraites du texte (`#T-12`). Resynchronisées à chaque
sauvegarde d'un texte. Backlinks « Mentionné dans » = `where target_id = X`.
Les **liens structurels** (tâche → feature, idée → feature, entrée du journal → feature, fichier → feature…) restent des
FK dans les tables métier (source de vérité unique). Affichage : la page d'une feature liste ses tâches, entrées, fichiers,
idées. IA : le futur `ProjectContextBuilder` agrège FK + références + journal + activité.

### Tables métier

- `users` (email, nom, hash scrypt, couleur, préférences jsonb : vue tâches par défaut) · `sessions` · `invitations`
- `projects` (slug, nom, objectif, cible, date limite, hors périmètre, définition de fini) · `project_members` (rôle, `last_seen_at`, `recap_since`)
- `features` (titre, description, priorité MoSCoW, responsable, critères de fini, position)
- `tasks` (titre, description, feature?, statut, date limite?, importance forcée?, position, `completed_at`) · `task_assignees`
- `time_entries` (user, tâche?, début, fin? — `null` = chrono en cours, source `timer|manual`) : chrono **et** blocs de travail du planning = même objet
- `availabilities` (user, début, fin, statut `available|maybe`) — globales à l'utilisateur, visibles dans tous ses projets
- `messages` (feature? — `null` = `#général`, auteur, corps, `reply_to_id`, `is_question`) · `message_mentions` · `question_targets` (message, user, `resolved_at`)
- `journal_entries` (type `decision|fix|scope`, titre, feature?, `details` jsonb typé par type, message source?)
- `ideas` (titre, note, feature?, `archived_at`, `triaged_at`)
- `accounts` (service, identifiant, secret, url, notes, feature?) · `resource_links` (titre, url, tag, feature?) · `contacts`
- `files` (feature? — `null` = dossier général, nom, mime, taille, clé de stockage)
- `activities` (acteur, verbe, élément, détails jsonb) · `notifications` (user, type `mention|question|assigned`, élément, lu?)
- `ai_notes` (contenu, auteur `ai|user`) — page « Ce que l'IA sait du projet »

« Créé automatiquement » = **par construction** : le canal `#général` = messages sans feature, le fil d'une feature =
messages de cette feature, le dossier d'une feature = fichiers de cette feature. Aucune table « canal » ni « dossier »
à synchroniser, donc rien ne peut se désynchroniser.

## 2. Architecture

```
src/lib/
  shared/              isomorphe, sans dépendance : types d'éléments, parsing des refs, événements temps réel
  modules/<module>/
    domain/            entités + règles pures (isomorphe : utilisé aussi côté client pour l'optimiste)
    application/       cas d'usage (1 fichier = 1 action) + ports.ts
    infrastructure/    adapters (schema Drizzle, repositories…)
    presentation/      commandes exposées (schéma zod → cas d'usage)
    index.ts           fabrique du module (câble les cas d'usage à partir des ports)
  server/              db, temps réel (hub ws), stockage, auth http, container.ts (composition root)
  client/              socket, store projet live, envoi de commandes, contrôleurs (optimiste)
  ui/                  atoms / molecules / organisms / templates + tokens
routes/                pages SvelteKit (appellent loaders + contrôleurs)
```

Modules : `identity`, `projects`, `elements` (registre + références + recherche), `features`, `tasks`, `time`,
`planning` (dispos), `discussion`, `journal`, `ideas`, `resources`, `files`, `activity`, `notifications`, `ai`.

**Écritures** : `POST /api/commands/<nom>` (ex. `tasks.create`). Registre de commandes = union des `presentation/commands.ts`
des modules ; validation zod, contrôle d'appartenance au projet, puis cas d'usage. Types inférés côté client (`import type`).
**Lectures** : le layout projet charge un _snapshot_ (features, tâches, idées, journal, ressources, fichiers, registre,
références, temps, dispos, activité récente, notifications) → `ProjectStore` client fait de `LiveCollection`s. Messages
chargés par fil. Navigation instantanée, UI calculée côté client (Eisenhower, avancement…).

**Temps réel** : `ws` attaché au serveur HTTP (plugin Vite en dev, `server.js` en prod) + pont `globalThis` vers le
handler SvelteKit (auth par cookie de session). _Pourquoi_ : pas de dépendance lourde (socket.io), protocole standard,
fonctionne avec adapter-node, un seul process. Port serveur `Broadcaster` (toProject / toUser) ; port client
`RealtimeClient`. Événements génériques `upsert|delete` par entité + `presence` + `notification`. Reconnexion avec
backoff puis `invalidateAll()` (resynchronisation complète via le snapshot).

**Effets de bord génériques** : chaque cas d'usage appelle `feed.upserted(entity, projectId, dto)` /
`feed.deleted(...)` (diffusion temps réel) et `activity.record(...)`. Tout DTO d'élément étend
`ElementBase { id, ref, kind, title }` : le client met à jour son index de références sans code spécifique.

Ports transverses : `Clock`, `Broadcaster`, `FileStorage` (disque local), `SecretCipher` (identité en V1),
`PasswordHasher`, `AiProvider` (null en V1).

## 3. Direction visuelle — « Crystal »

Éditorial + technique. Contraste entre une serif italique expressive et une UI très nette.

- **Typo** : _Instrument Serif_ (titres de pages, salutations, grands chiffres), _Geist_ (UI), _Geist Mono_ (refs `T-12`, durées).
- **Clair** : papier chaud `#F4F1EA`, surfaces blanches, encre `#16151B`, accent outremer électrique `#3D2BFF`.
- **Sombre** : encre profonde `#0D0D12`, surfaces `#16161D`, texte ivoire `#ECE8DF`, accent lavande lumineuse `#9D8CFF`.
- **Signature** : le prisme — dégradé conique (outremer → magenta → ambre → turquoise) réservé à 3 endroits : logo,
  chrono en cours (anneau animé), feature terminée. Partout ailleurs, sobriété.
- MoSCoW : Must vermillon, Should ambre, Could turquoise, Won't ardoise. Refs en chips mono.
- Layout : sidebar étroite (projet, navigation, raccourcis), grand titre serif, contenu dense façon Linear.
  Mobile : barre d'onglets en bas. Micro-animations 120–180 ms.

## 4. Arbitrages

| Sujet                               | Décision                                                                                                                                                           | Pourquoi                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Portée de « Aujourd'hui »           | Par projet ; `/` redirige vers le dernier projet                                                                                                                   | Side projects = un projet à la fois ; requêtes et temps réel simples                  |
| Inscription                         | `/register` : coller un lien d'invitation, ou code d'accès `REGISTRATION_CODE` (vide = fermé) ; `/setup` pour le tout premier compte                               | Pas d'inscription publique                                                            |
| Invitation                          | Lien à usage unique (7 j) copié par un membre ; un utilisateur existant peut être ajouté directement                                                               | Pas de SMTP à configurer                                                              |
| Droits                              | Tous les membres égaux                                                                                                                                             | Petite équipe de confiance, zéro configuration                                        |
| Urgent                              | Échéance ≤ 3 jours (ou dépassée)                                                                                                                                   | Valeur par défaut demandée                                                            |
| Important                           | Feature Must/Should, surchargeable par tâche                                                                                                                       | Spéc                                                                                  |
| Avancement feature                  | tâches faites / tâches totales                                                                                                                                     | Lisible, sans pondération arbitraire                                                  |
| Chrono                              | 1 chrono en cours max par personne ; en démarrer un arrête le précédent ; « Fait » arrête le chrono                                                                | Évite les temps fantômes                                                              |
| Tâche bloquée                       | Pas de statut en plus : « en retard » (échéance passée) + « au point mort » (En cours/À valider sans modification depuis 7 j)                                      | Colonnes fixes, détection automatique                                                 |
| Questions                           | Résolues par une réponse (`reply_to`) de la personne ou « marquer comme traité »                                                                                   | Explicite et fiable                                                                   |
| Journal auto                        | Changement de priorité MoSCoW, suppression de feature, ajout de feature après les 24 h de cadrage                                                                  | Évite de polluer le journal au démarrage                                              |
| Won't                               | Restent des features, affichées dans « Idées / Plus tard » (dérivé, pas de copie)                                                                                  | Pas de synchronisation                                                                |
| « Dispo aujourd'hui ? »             | Puces Matin (9–12) / Aprèm (14–18) / Soir (19–23) / Pas dispo                                                                                                      | Un clic, créneaux ajustables ensuite dans le planning                                 |
| Récap « depuis ta dernière visite » | Nouvelle visite si inactivité > 1 h ; `recap_since` = dernière activité avant ce trou ; première visite = tout l'historique                                        | Un rafraîchissement ne vide pas le récap ; un nouvel arrivant voit ce qui s'est passé |
| Conflits                            | Dernière écriture gagne ; exceptions : numérotation atomique, positions fractionnaires (kanban), brouillon d'édition en ligne protégé tant que le champ a le focus | Seuls cas où LWW casse vraiment                                                       |
| Mots de passe partagés              | En clair via `SecretCipher` identité                                                                                                                               | Chiffrement V2 sans toucher aux cas d'usage                                           |
| Dates                               | ISO string dans les DTO ; échéances `YYYY-MM-DD`                                                                                                                   | Même format SSR / commandes / WebSocket                                               |
| Données client                      | Snapshot projet chargé une fois + live                                                                                                                             | Volume faible ; navigation instantanée                                                |
| Fil d'activité                      | Modifications successives d'un même élément par la même personne en < 30 min = une ligne                                                                           | Montrer ce qui a bougé, pas chaque frappe                                             |
| Transformer un message              | Crée l'élément avec « Depuis #M-x » dans son texte                                                                                                                 | Le lien apparaît dans les backlinks du message, sans champ dédié                      |
| Contexte IA                         | `ai.context(projectId)` agrège cadrage, features, tâches, journal, références (refs lisibles) et notes ; exposé sur `/api/projects/:id/ai/context`                 | Prêt pour brancher un fournisseur sans toucher aux modules                            |

## 5. Glossaire (libellés de l'interface)

Un mot = un concept, partout (menus, titres, boutons, états vides, Cmd+K). Tutoiement, phrases courtes, verbes d'action.

| Terme                                           | Sens                                                                                                                 | À ne plus écrire                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Projet                                          | Objectif, public, date limite, hors périmètre, « c'est fini quand », équipe                                          | Cadrage (seul)                        |
| Feature                                         | Un morceau du produit (ex. « Paiement Stripe »), porte des tâches                                                    | Epic, module                          |
| Priorité (d'une feature)                        | Choisie : **Indispensable** (Must), **Si possible** (Should), **Bonus** (Could), **Pas maintenant** (Won't)          | Must/Should/Could/Won't seuls         |
| Tâche                                           | Une action concrète, assignée, avec échéance facultative                                                             | Ticket, issue                         |
| Urgence (d'une tâche)                           | Calculée (matrice) : **Faire maintenant**, **Planifier**, **Si j'ai le temps**, **Plus tard** ; déplaçable à la main | Priorité (pour une tâche), Eisenhower |
| Important / Urgent                              | Important = feature Indispensable ou Si possible (ou forcé) ; urgent = échéance ≤ 3 j                                |                                       |
| Statut                                          | À faire · En cours · À valider · Fait                                                                                | Todo, done                            |
| Chrono                                          | Mesure le temps sur une tâche ; **Démarrer** / **Arrêter** ; crée un bloc de temps                                   | Timer, pause                          |
| Bloc de temps                                   | Temps passé sur une tâche, visible dans le Planning                                                                  | Time entry, travail                   |
| Dispo                                           | Créneau où tu peux travailler (« Dispo » ou « Peut-être »)                                                           | Disponibilité (long)                  |
| Discussion / Général                            | Fil commun `Général` + un fil par feature                                                                            | Canal, #général                       |
| Question                                        | Message qui attend la réponse d'une personne citée avec @                                                            |                                       |
| Journal                                         | Décisions, bugs résolus, changements de périmètre : pourquoi le projet est comme il est                              | Fix (seul)                            |
| Décision · Bug résolu · Changement de périmètre | Les trois types d'entrée du journal                                                                                  | Fix                                   |
| Idée                                            | Pour plus tard ; se trie à la revue (→ tâche, → feature, archiver)                                                   | Backlog                               |
| Ressources                                      | Comptes partagés, liens, contacts, fichiers                                                                          | Boîte à outils                        |
| Revue de la semaine                             | 4 étapes : avancement, bloqué, questions, idées à trier                                                              | Revue (seul)                          |
| Aperçu                                          | Panneau latéral qui ouvre n'importe quel élément (`T-12`, `D-3`…)                                                    | Peek                                  |
| Cité dans                                       | Éléments qui mentionnent celui-ci avec `#`                                                                           | Mentionné dans, backlinks             |
| Mémoire IA                                      | Ce que l'IA sait du projet                                                                                           |                                       |

Navigation (8 entrées) : **Au quotidien** Aujourd'hui · Tâches · Discussion · Planning — **Le projet** Projet (onglets
Vue d'ensemble · Journal · Mémoire IA) · Ressources — **Chaque semaine** Idées · Revue de la semaine.

## 6. Avancement — itération 2

Reprendre au premier point non coché. Décisions prises en route : voir « Décisions itération 2 » ci-dessous.

- [x] 1. Chrono : bug corrigé, un seul actif, survit au refresh, visible partout, temps réel, bloc de planning, tests
- [x] 2. Chasse aux bugs (parcours Playwright de toutes les pages ; les suivants sont corrigés au fil des refontes)
- [x] 3. Page d'inscription (lien d'invitation ou code d'accès en config)
- [x] 4. Parcours utilisateur : navigation, libellés, glossaire, premier usage, Cmd+K
- [x] 5. UI : typographie, espace, hiérarchie (tokens + atoms d'abord)
- [x] 6. Matrice de priorité 2×2 + libellés MoSCoW en français
- [x] 7. Planning lisible : couleur par feature, légende, récap temps, infobulles
- [x] 8. Build de production testé
- [x] 9. Lint
- [x] 10. Découpage des gros fichiers (container, project-store, composants UI)
- [x] 11. Confirmation in-app pour supprimer un message (plus de `confirm()` natif)
- [x] 12. Undo (toast) pour suppression d'idée / entrée du journal, même mécanisme partout
- [x] 13. Créneau qui traverse minuit dans le planning
- [x] 14. Aperçus PDF et vidéo vérifiés
- [x] 15. Seed de démo : fichiers de test supprimés, toutes les fonctionnalités couvertes

### Décisions itération 2

- Chrono : cause = le client supprimait son brouillon dès la réponse HTTP en comptant sur l'écho WebSocket ; sans écho
  (socket en reconnexion, HMR…) le chrono disparaissait. `tasks.start` renvoie maintenant le `RunningTimer`, source de vérité.
- Chrono visible dans tous les projets (événement `timer` envoyé à l'utilisateur, `snapshot.timer`). Un chrono arrêté en
  moins d'une minute n'est pas enregistré (clic par erreur, sinon le planning se remplit de miettes).
- Inscription : `/register` accepte un lien d'invitation collé (redirige vers `/invite/…`, qui crée le compte et rejoint
  le projet) ou le code d'accès `REGISTRATION_CODE` (comparaison à temps constant). Sans code configuré, seul le lien marche.
- Matrice : nouvelle colonne `tasks.urgent` (surcharge, comme `important`). Glisser dans un quadrant fixe les deux ;
  « Automatique » dans l'aperçu les remet à `null`. Vue Tâches = « Par urgence » (matrice, par défaut) ou « Par statut »
  (kanban) ; l'ancienne « Ma liste » vit sur Aujourd'hui.
- Navigation : Journal et Mémoire IA sont rattachés à Projet (onglets) pour passer de 10 à 8 entrées.
- Suppression : un seul mécanisme, « supprimer puis Annuler » (toast 6 s), pour toutes les entités ; la commande de
  suppression n'est envoyée qu'à l'expiration, donc pas besoin de restauration côté serveur. Les doubles clics de
  confirmation (ressources, feature) sont retirés.
- Planning : couleur = feature (palette `--feature-0…7` des tokens, attribuée par ancienneté de la feature, teinte
  - liseré lisibles en clair comme en sombre) ; panneau « Temps passé » (total, par feature, par personne en vue équipe)
    qui sert aussi de légende ; infobulle au survol (tâche, feature, personne, horaires, durée, dispo ou non).
- Minuit : les gestes se calculent en minutes depuis le premier jour affiché ; glisser sous 24 h ou dans la colonne
  suivante prolonge au lendemain (24 h max). L'élément est dessiné en deux morceaux, « … » marque la coupure.
- Prod : `server.js` fixe `ORIGIN` à `http://localhost:$PORT` si absent (sinon SvelteKit refuse les formulaires en 403) ;
  à définir dans `.env` derrière un vrai domaine.
- Aperçus : PDF (iframe, lecteur du navigateur) et vidéo vérifiés ; le téléchargement gère `Range` (206) pour que la
  vidéo puisse avancer et se lire sur Safari.
- Seed : réécrit dans `scripts/seed/` (un fichier par domaine). Les 3 fichiers de test (`moodboard.png`,
  `notes-reunion.txt`, `depose.txt`, envoyés à la main lors de tests) sont remplacés par de vrais fichiers générés
  (image, PDF, vidéo, texte) ; ajout d'un second projet « Carnet de recettes » (guide de démarrage, changement de projet).
- Parcours : chaque page a un sous-titre « ce que tu fais ici » (`hint` de `client/navigation.ts`, repris dans Cmd+K) ;
  guide « Pour bien démarrer » sur Aujourd'hui, calculé depuis les données (rien à cocher à la main), masquable.
- Cmd+K : groupe « Infos clés » (`client/destinations.ts`) — objectif, équipe, inviter, mots de passe, dispos, temps
  passé… trouvables avec des mots courants, accents ignorés.
- UI : pas de changement de police (Geist lisible) ; le problème venait des tailles (30 valeurs, jusqu'à 9 px), du
  contraste d'`ink-3` et des pages étroites. Titres de section en sans, serif réservée aux titres de page et aux grands
  chiffres (tuiles d'Aujourd'hui).

Reste éventuel (non bloquant) : vue « Bilan des semaines » non retravaillée visuellement ; libellés des e-mails de
notification inexistants (pas de SMTP).
