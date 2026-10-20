# Crystal — guide de travail

App de gestion de projet pour petites équipes de dev (SvelteKit 2 + Svelte 5 runes, TS strict, Drizzle/Postgres,
Tailwind 4, `ws`). `PLAN.md` = ce qu'on construit et pourquoi. Ce fichier = comment travailler sans rien casser.
L'ancienne version vit sur la branche `legacy`.

## Commandes

```bash
npm run db:start            # Postgres (docker, port 55432)
npm run db:generate         # après une modif de schéma → nouvelle migration dans drizzle/
npm run db:migrate          # applique les migrations
npm run dev                 # http://localhost:5173 (WebSocket sur /ws via plugin Vite)
npm test                    # vitest (domaine + cas d'usage)
npm run check               # svelte-check (types)
npm run lint                # prettier + eslint   ·   npm run format pour corriger
npm run build && npm start  # prod : server.js = handler SvelteKit + WebSocket
npm run seed                # dev lancé → démo, une fois (bastien@crystal.test / crystal-demo)
```

Reset de la base : `docker compose down -v && npm run db:start && npm run db:migrate`.

## Architecture (Clean Architecture par module)

`src/lib/modules/<module>/` : `domain/` (pur, isomorphe, testé) → `application/` (cas d'usage + `ports.ts`)
→ `infrastructure/` (Drizzle, disque, chiffrement) → `presentation/commands.ts` (schémas zod → cas d'usage) → `index.ts` (fabrique).

Modules : `identity` (comptes, sessions, statut), `projects` (projets, membres, invitations, **accès**, type, note de
cadrage `brief` en QQOQCCP, cahier des charges technique `techSpec`), `tasks`
(tâches, types, modules du produit = `components` sur deux niveaux, story / epic d'une tâche),
`framing` (initiatives, epics, user stories et critères, parties prenantes et personas, parcours, glossaire, SWOT,
stratégies TOWS), `assistant` (chef de projet IA : liste blanche d'ops, contexte, quota, cache, adaptateurs Gemini et Anthropic),
`chat` (canaux, messages, fils de commentaires des tâches), `files` (documents, dossiers), `vault`, `planning`
(dispos, blocs de travail, calculs de l'agenda), `roadmap` (étapes, décisions, hypothèses, chiffres `metrics`, versions `releases`, modèles),
`activity` (activité, notifications), `kernel` (erreurs, dates, ports).

- Les dépendances pointent vers l'intérieur. `domain` n'importe que `kernel/domain` (ou le domaine d'un autre module).
- Un module n'importe jamais l'infrastructure d'un autre (sauf les schémas Drizzle pour les FK).
- **Tout cas d'usage vérifie l'appartenance au projet** via le port `Access` (kernel), implémenté par `projects`.
  Une commande qui reçoit un id (tâche, fichier…) charge l'élément puis vérifie son `projectId`.
- Injection : **uniquement** dans `src/lib/server/container.ts`. Commandes exposées : `src/lib/server/commands/registry.ts`.
- Temps réel : chaque cas d'usage publie via un `ChangeFeed<T>` (`saved(item)` / `removed(item)`). `server/realtime/feeds.ts`
  route vers le projet (`byProject`), une personne, ou ses coéquipiers.

Écritures : client `send('module.action', input)` → `POST /api/commands/[name]` → zod → cas d'usage (qui contrôle l'accès).
Lectures : `src/lib/server/snapshot.ts` charge tous les projets de la personne ; le client garde tout à jour.
Fichiers : `PUT /api/files` (corps brut, en flux vers le disque), `GET /api/files/[id]` (plages pour les vidéos).

### Ajouter une fonctionnalité

1. Domaine + cas d'usage (+ tests du domaine et des règles d'accès), table dans `infrastructure/schema.ts`,
   ré-exportée dans `src/lib/server/db/schema.ts`, puis `npm run db:generate && npm run db:migrate`.
2. Câbler dans `container.ts`, commandes dans `registry.ts`, données dans `snapshot.ts`.
3. Collection dans `shared/realtime.ts` (`Collections`) et dans `client/state/app.svelte.ts`.
4. Actions client dans `src/lib/client/actions/<m>.ts` (+ `index.ts`).

## Front

- `src/lib/ui/` = composants **purs** (atoms / molecules / organisms) : props in, callbacks out, aucun accès au store.
  Types partagés UI dans `ui/types.ts` (jamais d'export de type depuis un `.svelte`).
- `src/lib/connected/` = composants branchés (lisent `useApp()`, appellent `actions`). Les pages (`src/routes`) aussi.
- `useApp()` → `{ app, actions, realtime, overlays }`. `app.<collection>.all` est réactif ; filtrer par `projectId`.
- Projet courant : `currentProject(app)` (slug de l'URL). Équipe : `teamOrder(app, projectId)`.
- Toute action passe par `actions.*` : optimiste (`settle()` puis la réponse serveur fait foi). Suppressions :
  `deleteWithUndo` (retrait immédiat, « Annuler » 6 s, envoi à l'expiration).
- Comptes : `/login`, `/inscription` (libre : on ne voit que les projets créés ou rejoints), `/invite/[token]`.
- Routes : `/` (Ma journée, tous projets), `/p/[slug]` (accueil), `/demarrer` (après la création), `/cadrage`
  (« Comprendre le projet » : note de cadrage, `/fonctionnel`, `/technique`), `/feuille-de-route`, `/tableau`, `/priorites`,
  `/indicateurs`, `/versions` (mises en prod), `/discussion/[channel]`, `/planning`, `/documents`, `/acces`, `/equipe` ;
  `/projets`, `/compte`. Fiche tâche : `?tache=<id>` sur n'importe quelle page du projet.
- Mise en page : `PageHeader` (titre, phrase qui dit à quoi sert la page, boutons) puis le contenu.
- Tailles (lisibilité d'abord) : texte de base 15 px (`text-base`), plancher 13 px (`text-xs`) ; champs `h-11`,
  boutons `h-10` (`sm` = `h-9`), cibles cliquables ≥ 40 px.
- Couleurs : uniquement les tokens de `ui/tokens/theme.css` (clair + `[data-theme='dark']`) mappés dans `app.css`.
  Cases de la matrice : `labels.ts` (`BOXES`). Teintes de projets et de personnes : `tint(i)`.
- États vides : une phrase qui dit quoi faire + un bouton vers l'action.
- Glisser-déposer : `client/dnd.svelte.ts`, souris et tactile. Liste triable : `dnd.dropzone(zone, ondrop)` sur la
  liste (`relative`), `{#each dnd.rows(zone, items) as row (row.key)}` avec `animate:reflow` et
  `dnd.draggable(id, zone)` sur chaque enfant, `DropSlot` quand `row.item` est nul. `data-drop-area` = toute la zone
  qui compte (une colonne), `data-drop-gaps` = le conteneur dont les espaces ne renvoient pas la carte chez elle.
  Règle : **rien n'apparaît, ne disparaît ni ne change de taille pendant un glisser** (pas de `{#if dnd.active}`).
- Agenda : `ui/organisms/agenda/*` (grille, gestes) + `connected/planning/*` (données, commandes).
- Texte : un champ d'une ligne valide à Entrée ; un texte long (cap, notes, « fini quand », pourquoi) va à la ligne à
  Entrée et s'enregistre à Ctrl+Entrée ou en sortant. Édition sur place : `EditableText` (une ligne, `allowEmpty` pour
  un texte facultatif) et `ProseField` (éditeur visuel Tiptap, `client/text-editor.ts` : on ne voit jamais `**` ;
  stocké en Markdown, affiché par `RichText` qui lit aussi l'italique, `[texte](lien)` et les échappements `\*`).
  Pas de menu « … → Modifier ».
- Types de tâches : `KINDS` (`client/labels.ts`) ; saisie rapide `quick-entry.ts` (préfixes `bug!:`, `+module`, `@`,
  `^epic` ou `^us-7`, date) ; filtre type / module `connected/tasks/kind-filter.svelte.ts`. Rythme et prévisions : `isPlanned` (feature + tech).
- Lectures qui croisent plusieurs modules (rattrapage, questions, prévisions, prochain point, compte rendu, prévision
  par étape, bilan d'étape, chiffres et rythme `metrics.ts`, semaine du planning `week-plan.ts`, Ma journée `today.ts`) : fonctions pures dans `client/views/*`, testées là.
- Feuille de route : rien ne s'y saisit qui pourrait se calculer (avancement, date prévue, retard, étape en cours).
  Tout nouvel élément doit remonter ailleurs (accueil, fiche, compte rendu, prochain point), sinon il est mort.
  Filtre d'étape du tableau et de la matrice : `connected/tasks/step-filter.svelte.ts` (ne cache jamais en cours / revue).
- Cadrage : une **référence**, jamais un passage obligé. Une tâche vit sans epic ni story ; les fonctionnalités non
  rattachées vont dans « À ranger » (`toSort`). Les documents (note de cadrage, cahiers des charges) sont des vues
  calculées depuis les objets (`client/views/framing.ts`, export Markdown). Au plus 5 trous signalés (`framingGaps`).
- Chef de projet IA : bouton `connected/assistant/AskPm.svelte` (action de `assistant/domain/actions.ts`), panneau
  pur `ProposalPanel`. Il propose des ops de la liste blanche (`assistant/domain/ops.ts`) ; elles s'appliquent côté
  client par les `actions.*` (`client/actions/assistant.ts`). Aucun appel sans clic, jamais dans un `$effect`.

## Conventions

- **Petites modifs (UI, libellés, styles) : ne pas tester** (pas de captures ni de navigateur) — Bastien teste lui-même.
  Lancer `check` + `test` pour la logique, le domaine, le schéma ou les règles d'accès.
- SOLID/KISS/DRY, fonctions courtes, noms explicites. Commentaires seulement pour le _pourquoi_. Pas de `any`.
- Dates : ISO string dans les DTO, `YYYY-MM-DD` pour les échéances.
- UI en français (tutoiement, phrases courtes), code en anglais. Commits Conventional Commits, uniquement si `check` + `test` passent.

## Pièges connus

- `npm test` plante au démarrage (« Tsconfig not found ») quand le dépôt est sous un dossier `.claude/` (worktree) :
  lancer vitest depuis une copie hors de ce chemin.
- `tasks.milestone_id` et `tasks.release_id` n'ont pas de clé étrangère (le module `roadmap` détache les tâches avant de
  supprimer une étape ou une version) : passer par `roadmap.deleteMilestone` / `roadmap.deleteRelease`.
- Les étapes se trient par `position` seulement (`orderMilestones`) : la date ne change jamais l'ordre.

- Commandes de mise à jour : pas de `.default()` zod dans un schéma `.partial()` (un update réinitialiserait des champs).
- `Collection.reset()` réinitialise **en place** : ne remplace jamais une collection.
- Hub temps réel et pool SQL vivent sur `globalThis` (survivent au HMR). **Modif du hub → redémarrer `npm run dev`.**
- Un snippet nommé `actions` dans un `PageHeader` masque `actions` de `useApp()` : renommer (`actions: act`).
- `$effect` qui appelle une action lisant le store : l'envelopper dans `untrack` (sinon boucle).
- Messages : `asks` / `answeredAt` font les questions suivies, et `app.questions` garde celles encore ouvertes de tous
  mes projets. Côté client, passer par `app.putMessage` / `app.dropMessage`, jamais `app.messages.upsert` seul.
- Derrière Nginx Proxy Manager : `hooks.server.ts` retire l'en-tête `Link` des pages (≈ 4 Ko → 502 sinon), et
  l'hôte proxy doit avoir « Websockets Support » activé (sinon bandeau « Connexion perdue » permanent).
- Ajouter une op à l'assistant : schéma dans `ops.ts`, champs dans `prompt.ts` (`OP_FIELDS`), application dans
  `client/actions/assistant.ts`, libellé dans `client/views/proposal.ts`, puis l'autoriser dans l'action voulue.
  Fournisseur : Gemini (`GEMINI_API_KEY`, offre gratuite, coûts comptés à 0) ou Claude (`ANTHROPIC_API_KEY`), choisi
  par `AI_PROVIDER` ; adaptateurs dans `assistant/infrastructure/`. Sans clé, les boutons n'apparaissent pas.
- Liens du cadrage (tâche → story / epic, epic → initiative…) sans clé étrangère : le module `framing` détache avant
  de supprimer, comme `roadmap`.
- Postgres écoute sur 55432. Prod : `ORIGIN` = URL publique, `APP_SECRET` obligatoire (ne plus la changer ensuite).
- Prod Docker (`docker-compose.prod.yml`) : les migrations passent par `migrate.js` (pas de `drizzle-kit` dans l'image),
  d'où `drizzle-orm` et `postgres` en `dependencies`. Tout paquet requis à l'exécution hors `build/` va aussi là.
  `.env.example` sert de modèle à Forge : garder `POSTGRES_PASSWORD` **avant** `DATABASE_URL`.
