-- The Cap's short answers become one formatted note.
UPDATE "projects" SET "brief" = concat_ws(E'\n\n',
	CASE WHEN "audience" <> '' THEN E'## Pour qui\n' || "audience" END,
	CASE WHEN "problem" <> '' THEN E'## Leur problème\n' || "problem" END,
	CASE WHEN "payer" <> '' THEN E'## Qui paie\n' || "payer" END,
	CASE WHEN "out_of_scope" <> '' THEN E'## Ce qu''on ne fait pas\n' || "out_of_scope" END)
WHERE "brief" = '';--> statement-breakpoint
-- The project's one number becomes its first metric, with its readings.
INSERT INTO "metrics" ("id", "project_id", "name", "target", "position")
	SELECT gen_random_uuid(), "id", "metric_name", "metric_target", 1 FROM "projects" WHERE "metric_name" <> '';--> statement-breakpoint
UPDATE "metric_readings" r SET "metric_id" = m."id", "id" = m."id"::text || ':' || r."week_of"::text
	FROM "metrics" m WHERE m."project_id" = r."project_id";--> statement-breakpoint
DELETE FROM "metric_readings" WHERE "metric_id" IS NULL;--> statement-breakpoint
-- Steps keep the order they were shown in (dated by date, then the others); dragging takes over.
UPDATE "milestones" m SET "position" = o."rank" FROM (
	SELECT "id", row_number() OVER (PARTITION BY "project_id" ORDER BY "target_date" ASC NULLS LAST, "position") AS "rank"
	FROM "milestones") o WHERE m."id" = o."id";--> statement-breakpoint
-- When work started, from the history, so cycle times have a past.
UPDATE "tasks" t SET "started_at" = a."at" FROM (
	SELECT "subject"->>'id' AS "task_id", min("created_at") AS "at" FROM "activities"
	WHERE "verb" = 'task.started' GROUP BY 1) a WHERE t."id"::text = a."task_id";--> statement-breakpoint
UPDATE "tasks" SET "started_at" = "status_changed_at" WHERE "started_at" IS NULL AND "status" IN ('doing', 'review');--> statement-breakpoint
-- A first guess of each task's kind from its first words.
UPDATE "tasks" SET "kind" = 'bug' WHERE "title" ~* '^\s*(fix|bug|hotfix|corrig|plante|crash|erreur)';--> statement-breakpoint
UPDATE "tasks" SET "kind" = 'tech' WHERE "title" ~* '^\s*(refacto|migr|mettre à jour|maj |tests?\M|ci\M|sauvegarde|monitoring|optimis|chore)';--> statement-breakpoint
UPDATE "tasks" SET "kind" = 'action' WHERE "title" ~* '^\s*(appeler|relancer|envoyer|facturer|devis|réunion|rédiger|montrer|demander|contacter|répondre|payer|signer)';--> statement-breakpoint
ALTER TABLE "metric_readings" ALTER COLUMN "metric_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "audience";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "problem";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "payer";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "out_of_scope";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "metric_name";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "metric_target";