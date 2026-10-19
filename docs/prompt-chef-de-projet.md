# Prompt — Chef de projet IA dans Crystal

À coller tel quel dans une nouvelle session Claude Code, sur `main`.

---

Lis `CLAUDE.md` et `PLAN.md`. On ajoute à Crystal un **chef de projet IA** qui ne s'active **que sur un clic**
(« Demander au chef de projet de… »). Il ne fait que **proposer** : l'humain valide case par case avant toute écriture.
Travaille par lots, dans l'ordre ci-dessous. Lance `check` + `test` à la fin de chaque lot, commite, et arrête-toi
pour que je valide avant de passer au lot suivant.

## Lot 1 — Cadrage guidé (sans IA)

But : que le projet contienne assez d'informations pour être piloté, par un humain comme par l'IA.

1. **Cap guidé** : `BRIEF_HEADINGS` devient : Pour qui · Leur problème · Notre réponse · Qui paie, combien ·
   Contraintes · Ce qu'on ne fait pas.
   - Chaque section affiche sa question, un exemple court et une ligne « à quoi ça sert ».
   - Questions :
     - Pour qui : qui utilise, qui signe, qui prescrit ?
     - Leur problème : ce qu'ils font aujourd'hui, ce que ça leur coûte.
     - Notre réponse : en une phrase en quoi c'est différent, et les 3 choses que la v1 doit faire.
     - Qui paie, combien : prix exact (HT, par mois, engagement), remises, d'où viennent les 10 premiers clients.
     - Contraintes : date imposée, jours vendus, temps dispo par personne, règles du secteur.
     - Ce qu'on ne fait pas : et jusqu'à quand.
   - « Réussite » = les **chiffres** (`metrics`) avec cible et date. « Paris » = les **hypothèses**. Pas de section en
     double.
   - Les anciens Caps restent lisibles : `briefSections` remet le texte d'une section inconnue dans la première.
2. **Parties prenantes** : une nouvelle entité dans `projects`, légère.
   - Champs : nom ou rôle, organisation, rôle (décide, paie, prescrit, utilise, valide, contribue), influence et
     intérêt (faible ou fort), ce qu'il attend, à quelle fréquence l'informer, membre lié éventuel.
   - Affichage : une petite matrice influence × intérêt, avec les libellés français classiques (gérer de près,
     satisfaire, tenir informé, surveiller).
   - Section dans la page Équipe ou Feuille de route, saisie en ligne (`EditableText`).
   - Elle doit remonter ailleurs : le prochain point et le compte rendu disent qui informer cette semaine.
3. **Risques** : réutiliser les **hypothèses** (une hypothèse non vérifiée est un risque). On n'ajoute une table
   « risques » que si ça ne suffit vraiment pas : propose-le-moi avant.
4. **Santé du cadrage, calculée sans IA** : étendre `isFramed` en `framingGaps(project, …)`.
   - Elle signale : section du Cap vide ou trop courte, chiffre sans cible ni date, étape sans « fini quand »,
     aucune partie prenante qui décide ou paie, hypothèse jamais vérifiée depuis plus de 30 jours, pas de
     `deadline` ni de `soldDays`.
   - Affichage : accueil du projet, avec un bouton par trou vers l'endroit où le combler.
   - Tests dans `client/views` ou dans le domaine.

## Lot 2 — Module `assistant` (le socle)

Module en Clean Architecture comme les autres.

- **`domain/`**
  - `Proposal = { summary, questions?: Question[], ops: Op[] }`.
  - `Question` = QCM **pré-rempli** (options, et une réponse proposée par l'IA). Chaque question a **toujours** un
    champ libre « autre chose à ajouter ? ».
  - `Op` = `{ command, input, reason, sources }`. `command` est pris dans une **liste blanche** de commandes
    existantes de `registry.ts` : créer ou modifier une tâche (champs limités : titre, notes, checklist, type,
    module, étape, échéance, case de la matrice, statut idées ↔ à faire uniquement), créer ou modifier une étape,
    ajouter une décision, modifier le Cap, ajouter une hypothèse, un chiffre ou une partie prenante.
  - `input` est validé par le **schéma zod de la commande** elle-même.
  - Interdit : supprimer, toucher au coffre (`vault`), assigner des gens, passer une tâche en cours ou terminée,
    changer une date sans la décision « pourquoi » qui va avec.
- **Déroulé d'une demande, au plus 3 appels, toujours sur un clic humain :**
  1. Les questions, en QCM pré-rempli + champ libre. On saute cette étape si le contexte suffit.
  2. La proposition : des ops sous forme de diff, avec une case à cocher par op et chaque op modifiable avant
     d'accepter.
  3. Une **seule** reprise : un champ « demander une modification » renvoie la proposition et la remarque, et
     l'IA rend une proposition corrigée. Ensuite on accepte ou on abandonne.
- **`application/ask.ts`**, dans l'ordre :
  1. vérifier l'accès (`Access`), comme tout cas d'usage ;
  2. vérifier le quota du projet et du mois, refus net s'il est dépassé ;
  3. construire le contexte (fonction pure, texte compact, budget de tokens par action, titres seulement et jamais
     les notes longues ni les documents) ;
  4. vérifier qu'une réponse n'existe pas déjà en cache (même empreinte de contexte → même réponse) ;
  5. appeler le port `LlmClient` ;
  6. valider la sortie avec zod ;
  7. enregistrer la proposition et la consommation dans une table `ai_usage` (projet, personne, action, tokens,
     coût).
- **Port `LlmClient`** : un seul appel, sortie structurée forcée (un outil `propose` avec son schéma JSON),
  `max_tokens` fixé par action.
  - Adaptateur Anthropic : modèle Haiku par défaut, Sonnet pour « compléter le Cap », « proposer les étapes » et
    « découper l'étape ».
  - Cache de prompt sur le pré-prompt et sur le contexte du projet.
  - Clé dans l'environnement (`ANTHROPIC_API_KEY`), et prévoir plus tard une clé par équipe.
  - Vérifie les modèles et les prix actuels avec la doc avant de coder.
- **Application des ops** : **côté client**, les ops acceptées passent par les `actions.*` existantes (mode
  optimiste, contrôle d'accès et temps réel sans rien recoder). Les décisions créées ont la source `ai` (à
  ajouter à `DECISION_SOURCES`).
- **UI**
  - Un organisme pur `ProposalPanel`, avec les écrans questions → diff → reprise.
  - Un bouton `AskPm` réutilisable : il affiche une estimation du coût, et il est grisé tant que rien n'a changé
    depuis la dernière proposition.
  - La consommation du mois s'affiche dans Compte.

**Pré-prompt système**, stable et mis en cache (à affiner) :

> Tu es le chef de projet d'une petite équipe de développement, dans l'outil Crystal. Tu proposes, l'équipe décide.
> Règles : (1) Chaque affirmation cite sa source (#tâche, décision datée, section du Cap, message). S'il manque une
> information, pose une question QCM pré-remplie au lieu de supposer. (2) Tu raisonnes avec le rythme réel des
> 4 dernières semaines, jamais en heures ni en points. (3) Des tâches que des devs reconnaissent : découpage
> vertical, critères testables, la checklist de mise en prod en fin d'étape. (4) Au plus 15 tâches par proposition,
> aucun doublon avec l'existant, ni blabla ni flatterie. « Rien à proposer » est une réponse valable. (5) Tu
> respectes « Ce qu'on ne fait pas », et tu peux refuser en le citant. (6) Tu ne tranches jamais le juridique ni
> le réglementaire : tu en fais une hypothèse ou une tâche « vérifier avec… ». (7) Au plus 3 hypothèses et
> 5 chiffres. Une décision ne se modifie pas, elle se remplace. Toute date changée a sa décision « pourquoi ».
> (8) Les dates que tu proposes doivent tenir au rythme réel, et tu montres le calcul. Tu réponds uniquement avec
> l'outil `propose`, en français, en tutoyant, avec des phrases courtes.

Le **contexte du projet** forme une 2ᵉ couche, mise en cache : Cap, parties prenantes, étapes (ordre, « fini
quand », dates, prévision), hypothèses, chiffres, 10 dernières décisions, modules, rythme, titres des tâches
ouvertes avec type, case, étape et échéance. La **demande** forme la 3ᵉ couche : l'instruction du bouton et l'objet
visé.

## Lot 3 — Les boutons, un par un (dans cet ordre)

1. **…découper cette étape** (carte d'une étape) : 5 à 15 tâches typées, avec module et checklist.
2. **…préciser cette tâche** (fiche tâche) : critères d'acceptation, et découpage si la tâche est trop grosse.
3. **…trier les tâches** (Priorités et Tableau) :
   - une case de la matrice pour chaque tâche « à trier », avec son pourquoi ;
   - les tâches à passer d'« idées » à « à faire » et l'inverse ;
   - des **échéances réalisables** au rythme réel.
4. **…proposer les étapes** (feuille de route vide) : 4 à 7 étapes, chacune avec un « fini quand » vérifiable et
   une date réaliste.
5. **…compléter le Cap** (bloc Cap, et accueil tant que le projet n'est pas cadré) : il part de `framingGaps`, pose
   ses questions en QCM, puis propose un texte par section, des hypothèses, des chiffres et des parties prenantes.
6. **…proposer quoi couper** (étape en retard) : 2 ou 3 scénarios chiffrés, chacun avec la décision qui va avec.
7. **…tirer décisions et tâches de ce fil** (messages sélectionnés) : décisions avec le message en lien, tâches,
   questions encore ouvertes.
8. **…faire le bilan de santé du projet** (accueil du projet) :
   - il part des signaux **déjà calculés** : `framingGaps`, « ça tient ? », prévision par étape, bugs bloquants,
     hypothèses non vérifiées, parties prenantes jamais informées ;
   - il rend un verdict (réalisable, à risque ou irréaliste), 3 à 5 constats sourcés et les ops pour corriger ;
   - il passe par le cache : relancer sans changement ne coûte rien.

Garde-fous valables pour tout le chantier :
- Aucun appel sans clic.
- Aucun appel en boucle.
- Aucun appel dans un `$effect`.
- Quota par projet et par mois.
- Tests du domaine, des règles d'accès, de la liste blanche des ops et de la construction du contexte (budget
  respecté, pas de `vault`).
