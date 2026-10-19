ALTER TABLE "projects" ADD COLUMN "sold_days" double precision;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "ship_checklist" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "projects" SET "ship_checklist" = '["Sauvegarde de la base faite","Migrations testées sur une copie","Testé sur un téléphone","Le suivi des erreurs est ouvert"]'::jsonb;
