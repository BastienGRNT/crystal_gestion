CREATE TABLE "epics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"initiative_id" uuid,
	"component_id" uuid,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"later" boolean DEFAULT false NOT NULL,
	"position" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "glossary_terms" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"term" text NOT NULL,
	"definition" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiatives" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"why" text DEFAULT '' NOT NULL,
	"metric_id" uuid,
	"position" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"position" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stakeholders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"role" text NOT NULL,
	"influence" text NOT NULL,
	"interest" text NOT NULL,
	"expects" text DEFAULT '' NOT NULL,
	"tech_level" text,
	"interactions" text DEFAULT '' NOT NULL,
	"inform_every" text,
	"user_id" uuid,
	"position" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"epic_id" uuid,
	"persona_id" uuid,
	"want" text NOT NULL,
	"so_that" text DEFAULT '' NOT NULL,
	"criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"position" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stories_projectId_number_unique" UNIQUE("project_id","number")
);
--> statement-breakpoint
CREATE TABLE "story_counters" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"last" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"text" text NOT NULL,
	"item_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"epic_id" uuid,
	"hypothesis_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swot_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"quadrant" text NOT NULL,
	"text" text NOT NULL,
	"position" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "kind" text DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tech_spec" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "components" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "story_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "epic_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "outside_product" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "epics" ADD CONSTRAINT "epics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glossary_terms" ADD CONSTRAINT "glossary_terms_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_counters" ADD CONSTRAINT "story_counters_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swot_items" ADD CONSTRAINT "swot_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "epics_project_id_index" ON "epics" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "glossary_terms_project_id_index" ON "glossary_terms" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "initiatives_project_id_index" ON "initiatives" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "journeys_project_id_index" ON "journeys" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "stakeholders_project_id_index" ON "stakeholders" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "stories_project_id_index" ON "stories" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "strategies_project_id_index" ON "strategies" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "swot_items_project_id_index" ON "swot_items" USING btree ("project_id");