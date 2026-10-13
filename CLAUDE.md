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
npm run seed                # base vide + dev lancé → démo (bastien@crystal.test / crystal-demo)
```

Reset de la base : `docker compose down -v && npm run db:start && npm run db:migrate`.

## Architecture (Clean Architecture par module)

`src/lib/modules/<module>/` : `domain/` (pur, isomorphe, testé) → `application/` (cas d'usage + `ports.ts`)
→ `infrastructure/` (Drizzle, disque, chiffrement) → `presentation/commands.ts` (schémas zod → cas d'usage) → `index.ts` (fabrique).

Modules : `identity` (comptes, sessions, statut), `projects` (projets, membres, invitations, **accès**), `tasks`,
`chat` (canaux, messages, fils de commentaires des tâches), `files` (documents, dossiers), `vault`, `planning`
(dispos, blocs de travail, calculs de l'agenda), `activity` (activité, notifications), `kernel` (erreurs, dates, ports).

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
- Routes : `/p/[slug]` (accueil), `/tableau`, `/priorites`, `/discussion/[channel]`, `/planning`, `/documents`,
  `/acces`, `/equipe` ; `/projets`, `/compte`. Fiche tâche : `?tache=<id>` sur n'importe quelle page du projet.
- Mise en page : `PageHeader` (titre, phrase qui dit à quoi sert la page, boutons) puis le contenu.
- Tailles (lisibilité d'abord) : texte de base 15 px (`text-base`), plancher 13 px (`text-xs`) ; champs `h-11`,
  boutons `h-10` (`sm` = `h-9`), cibles cliquables ≥ 40 px.
- Couleurs : uniquement les tokens de `ui/tokens/theme.css` (clair + `[data-theme='dark']`) mappés dans `app.css`.
  Cases de la matrice : `labels.ts` (`BOXES`). Teintes de projets et de personnes : `tint(i)`.
- États vides : une phrase qui dit quoi faire + un bouton vers l'action.
- Glisser-déposer : `client/dnd.svelte.ts` (`dnd.draggable(id, zone)`, `dnd.dropzone(zone, ondrop)`), souris et tactile.
- Agenda : `ui/organisms/agenda/*` (grille, gestes) + `connected/planning/*` (données, commandes).

## Conventions

- **Petites modifs (UI, libellés, styles) : ne pas tester** (pas de captures ni de navigateur) — Bastien teste lui-même.
  Lancer `check` + `test` pour la logique, le domaine, le schéma ou les règles d'accès.
- SOLID/KISS/DRY, fonctions courtes, noms explicites. Commentaires seulement pour le _pourquoi_. Pas de `any`.
- Dates : ISO string dans les DTO, `YYYY-MM-DD` pour les échéances.
- UI en français (tutoiement, phrases courtes), code en anglais. Commits Conventional Commits, uniquement si `check` + `test` passent.

## Pièges connus

- Commandes de mise à jour : pas de `.default()` zod dans un schéma `.partial()` (un update réinitialiserait des champs).
- `Collection.reset()` réinitialise **en place** : ne remplace jamais une collection.
- Hub temps réel et pool SQL vivent sur `globalThis` (survivent au HMR). **Modif du hub → redémarrer `npm run dev`.**
- Un snippet nommé `actions` dans un `PageHeader` masque `actions` de `useApp()` : renommer (`actions: act`).
- `$effect` qui appelle une action lisant le store : l'envelopper dans `untrack` (sinon boucle).
- Postgres écoute sur 55432. Prod : `ORIGIN` = URL publique, `APP_SECRET` obligatoire (ne plus la changer ensuite).
