# Crystal

Gestion de projet tout-en-un pour side projects, en petite équipe (sur invitation).
Tâches (Kanban / liste Eisenhower), discussion avec mentions et questions, journal des décisions,
idées, planning interactif, ressources partagées — le tout en temps réel.

## Démarrer

```bash
npm install
cp .env.example .env
npm run db:start && npm run db:migrate
npm run dev            # http://localhost:5173 → /setup crée le premier compte
```

Données de démo (base vide, serveur lancé) : `npx tsx scripts/seed-demo.ts`
puis connexion `bastien@crystal.test` / `crystal-demo`.

Production : `npm run build && npm start` (port `PORT`, 3000 par défaut).

- `PLAN.md` : modèle de données, architecture, direction visuelle, arbitrages.
- `CLAUDE.md` : conventions et guide pour travailler dans le code.
