# Crystal

Gestion de projet minimaliste pour petites équipes de dev : un **tableau Kanban priorisé** (avec matrice
d'Eisenhower), une **discussion** par projet avec canaux libres, un **planning** des dispos et du travail prévu,
des **documents** en dossiers et un **coffre d'accès** partagé. Le tout en temps réel, par projet, sur invitation.

## Démarrer

```bash
npm install
cp .env.example .env        # puis DATABASE_URL=postgres://crystal:crystal@localhost:55432/crystal
                            # et une valeur dans APP_SECRET (openssl rand -base64 32)
npm run db:start && npm run db:migrate
npm run dev                 # http://localhost:5173 → créer un compte ou se connecter
```

Données de démo (serveur lancé, une seule fois) : `npm run seed`, puis connexion `bastien@crystal.test` / `crystal-demo`.

Production : `npm run build && npm start` (port `PORT`, 3000 par défaut ; définir `ORIGIN` et `APP_SECRET`).

## Déploiement (Docker / Forge)

`docker-compose.prod.yml` : `db` (PostgreSQL 16, volume `db-data`, port non publié), `migrate` (applique
`drizzle/` puis s'arrête) et `app` (port `PORT`, fichiers envoyés dans le volume `storage`, healthcheck sur `/health`).
Variables : `.env.example` (les `changeme` sont à remplacer ; Forge les génère).

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Derrière le reverse proxy HTTPS : `ORIGIN=https://<domaine>` et les websockets activés sur le proxy (`/ws`).

- `PLAN.md` : la méthode, les pages, les arbitrages.
- `CLAUDE.md` : architecture et conventions pour travailler dans le code.
- La première version de l'app est sur la branche `legacy`.
