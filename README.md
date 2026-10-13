# Crystal

Gestion de projet minimaliste pour petites équipes de dev : un **tableau Kanban priorisé** (avec matrice
d'Eisenhower), une **discussion** par projet avec canaux libres, un **planning** des dispos et du travail prévu,
des **documents** en dossiers et un **coffre d'accès** partagé. Le tout en temps réel, par projet, sur invitation.

## Démarrer

```bash
npm install
cp .env.example .env        # puis mettre une valeur dans APP_SECRET (openssl rand -base64 32)
npm run db:start && npm run db:migrate
npm run dev                 # http://localhost:5173 → /setup crée le premier compte
```

Données de démo (base vide, serveur lancé) : `npm run seed`, puis connexion `bastien@crystal.test` / `crystal-demo`.

Production : `npm run build && npm start` (port `PORT`, 3000 par défaut ; définir `ORIGIN` et `APP_SECRET`).

- `PLAN.md` : la méthode, les pages, les arbitrages.
- `CLAUDE.md` : architecture et conventions pour travailler dans le code.
- La première version de l'app est sur la branche `legacy`.
