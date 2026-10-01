# Crystal — guide de travail

App de gestion de projet privée (SvelteKit 2 + Svelte 5 runes, TS strict, Drizzle/Postgres, Tailwind 4, `ws`).
`PLAN.md` = ce qu'on construit et pourquoi. Ce fichier = comment travailler sans rien casser.

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
npx tsx scripts/seed-demo.ts                        # base vide + dev lancé → démo complète (bastien@crystal.test / crystal-demo), contenu dans scripts/seed/
npx tsx scripts/screenshots.ts <dir> /p/atelier-pixel/tasks   # captures clair/sombre, desktop/mobile
```

Reset de la base : `docker compose down -v && npm run db:start && npm run db:migrate`.

## Architecture (Clean Architecture par module)

`src/lib/modules/<module>/` : `domain/` (pur, isomorphe, testé) → `application/` (1 fichier = 1 cas d'usage, `ports.ts`)
→ `infrastructure/` (Drizzle, disque…) → `presentation/commands.ts` (schémas zod → cas d'usage) → `index.ts` (fabrique).

- Les dépendances pointent vers l'intérieur. `domain` n'importe rien d'autre que `kernel/domain` ou le domaine d'un autre module.
- Un module n'importe jamais l'infrastructure d'un autre (sauf schémas Drizzle pour les FK et `elements/infrastructure`).
- Injection : **uniquement** dans `src/lib/server/container.ts` et `src/lib/server/wiring/*` (un fichier par groupe de modules). Commandes exposées : `src/lib/server/commands/registry.ts`.
- Ports transverses dans `kernel/application/ports.ts` : `Clock`, `ChangeFeed` (temps réel), `ActivityLog`, `Notifier`, `ReferenceSync`.
- Élément simple (CRUD + temps réel + activité + références) : `makeElementCrud` + `drizzleElementStore`. Ne réécris pas ce flux.

Écritures : client `send('module.action', input)` → `POST /api/commands/[name]` → zod → contrôle d'appartenance si `projectId`
→ cas d'usage. Lectures : `src/lib/server/snapshot.ts` charge tout le projet une fois ; le client le garde à jour.

### Ajouter un module

1. `modules/<m>/{domain,application,infrastructure,presentation}` + tests du domaine et des cas d'usage.
2. Table dans `infrastructure/schema.ts`, ré-exportée dans `src/lib/server/db/schema.ts`, puis `npm run db:generate && npm run db:migrate`.
3. Câbler dans `container.ts`, commandes dans `registry.ts`, données dans `snapshot.ts`.
4. Client : collection dans `ProjectStore` (+ entrée `collection()`), actions dans `src/lib/client/actions/<m>.ts` (+ `index.ts`).

### Brancher un nouveau type d'élément (références, activité, temps réel)

- Ajoute le `kind` et son préfixe dans `kernel/domain/element.ts`, et son entrée dans `client/refs/kinds.ts`.
- Table dont l'`id` est `elementPrimaryKey()` ; DTO qui étend `ElementBase` (`id, ref, kind, title`).
- Le reste est générique : l'index client, `#` autocomplete, Cmd+K, backlinks, fil d'activité et diffusion se branchent seuls.
- Vue détaillée dans le tiroir : ajoute un composant dans `src/lib/connected/peek/registry.ts`.

## Front

- `src/lib/ui/` = Atomic Design **pur** (atoms / molecules / organisms / templates) : props in, callbacks out, aucune
  logique métier, aucun accès au store. Types partagés UI dans `ui/types.ts`.
- `src/lib/connected/` = composants branchés (lisent `useProject()`, appellent `actions`). Les pages (`src/routes`) aussi.
- `useProject()` → `{ store, actions, refs, me, realtime, peek }`. `store.<collection>.items` est réactif.
- Toute action utilisateur passe par `actions.*` (optimiste : `optimistic()` / `createOptimistically()` puis commande).
- Suppressions : **toujours** `deleteWithUndo(message, retraitLocal, commande)` (`client/live/undoable.ts`) — retrait
  immédiat, toast « Annuler » 6 s, commande envoyée à l'expiration (ou au `pagehide`). Pas de `confirm()` ni de double clic :
  bouton `ui/atoms/DeleteButton`.
- Typo (Plus Jakarta Sans) : `text-2xs` (12 px, plancher) · `xs` (13) · `ui` (14) · `sm` (14,5) · `base` (15, corps) ·
  `lg` · `xl` · `2xl` · `3xl` (32, titres de page, `font-extrabold`). Jamais de `text-[13px]` hors titres de cartes.
  Vocabulaire : **Feat**, **Task**, **Fix**, Icebox, Idée (glossaire de `PLAN.md` §5).
- Mise en page : `PageHeader` (titre 32 px, phrase d'explication en `meta`, boutons nommés en `actions`, grands onglets
  `PageTabs` en `tabs`) puis `Page`. Cartes `rounded-[18px] border-[1.5px] border-line bg-surface`, lignes ≥ 52 px.
- Tokens : `src/lib/ui/tokens/theme.css` (clair + `[data-theme='dark']`), mappés dans `src/app.css` (`bg-surface`, `text-ink-2`,
  `border-line`, `bg-accent-soft`, `text-must`…). Jamais de couleur en dur dans un composant. `font-display` = Geist semibold serré.
- Le dégradé `prism` est réservé : logo, chrono en cours, 100 % d'avancement.
- Textes : `RefTextArea` (saisie avec `#` et `@`) et `RichText` (rendu refs/mentions/liens). Mentions stockées `<@userId>`,
  affichées `@Nom` (`client/refs/mentions.ts`).
- Coque : barre latérale encre (`bg-sidebar`, textes `text-side-ink*`), pages sur papier (`#page` = conteneur qui défile).
  Jamais de petites pilules d'onglets dans un coin : `PageTabs`. `Segmented` seulement pour régler une vue (Semaine/Jour).
- Créer : **là où la chose vit**, jamais via un bouton global. Boutons nommés avec leur touche (`HeaderButton shortcut`)
  et lignes `AddLine` (« Ajouter une Task à … »). Formulaires : `connected/create/{TaskForm,FeatForm,IdeaForm}` via
  `overlays.openCreate(kind, seed)`, touches T X F I. Le titre est lu par `client/views/quick-entry.ts` (`@Ana demain`).
- Formulaires : `ui/organisms/FormDialog` + `ui/molecules/form/*` (`FormField` = une question, `ChoiceCards`,
  `FeatChoice`, `PeopleChoice`, `WhenChoice`, `LineList`, `SelectField`, `TextField`). Le panneau d'un élément utilise
  les mêmes champs. Dans les listes : statut = `StatusIcon`, Feat = `FeatureMark`, date en texte, pas de `Badge`.
- Parler d'un élément : `connected/peek/ElementTalk` (messages qui citent l'élément, postés dans le fil de sa feature).
- Navigation : `client/navigation.ts` (6 entrées, touches 1–6 ; `SUB_PAGES` = pages du menu projet, trouvées par Cmd+K).
  Features en cours listées dans la barre latérale (`client/views/sidebar-features.ts`). Infos clés de Cmd+K :
  `client/destinations.ts`. Couleurs de features du planning : `--feature-0…7` via `client/views/feature-colors.ts`.
- États vides : toujours une phrase qui dit quoi faire + un bouton/lien vers l'action (`EmptyState`, `compact` en colonne).
- Ouvrir un élément : `peek(ref)` (tiroir `?peek=T-12`) ; features → `/p/[slug]/features/F-3` ; messages → `/p/[slug]/go/M-4`.

## Conventions

- **Petites modifs (UI, libellés, styles) : ne pas tester** (pas de `check`/`test`/captures/navigateur) — Bastien teste lui-même.
  Ne lancer les vérifications que pour les changements de logique, de domaine ou de schéma.
- SOLID/KISS/DRY, fonctions courtes, noms explicites. ~50 lignes max par fichier (exceptions : schémas, config, container).
- Commentaires seulement pour le _pourquoi_. Pas de `any`. Dates : ISO string dans les DTO, `YYYY-MM-DD` pour les échéances.
- UI en français, code en anglais. Commits Conventional Commits, un par étape logique, uniquement si `check` + `test` passent.

## Pièges connus

- Commandes de mise à jour : pas de `.default()` zod dans un schéma `.partial()` (un update réinitialiserait des champs).
- `ProjectStore.reset()` réinitialise **en place** (les composants gardent la même référence) — ne remplace jamais une collection.
- Svelte : lire `data` dans le `<script>` ne suit pas les changements ; utilise `$derived` ou `untrack` volontairement.
- Hub temps réel et pool SQL vivent sur `globalThis` (survivent au HMR). Modif du hub → redémarrer `npm run dev`.
- Postgres écoute sur 55432 (5432–5434 déjà pris sur la machine de dev).
- `tsc` ne comprend pas les exports de `.svelte` : types partagés dans des `.ts`.
- Prod : `ORIGIN` doit être l'URL publique (défaut `http://localhost:$PORT` dans `server.js`), sinon formulaires en 403.
- Inscription libre seulement si `REGISTRATION_CODE` est défini ; sinon `/register` n'accepte qu'un lien d'invitation.
- Les smoke tests (`scripts/smoke-*.ts`) écrivent dans la base : relancer le seed après pour une démo propre.
