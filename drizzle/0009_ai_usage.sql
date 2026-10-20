CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"model" text NOT NULL,
	"fingerprint" text NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"cache_write_tokens" integer NOT NULL,
	"cache_read_tokens" integer NOT NULL,
	"cost_micros" bigint NOT NULL,
	"proposal" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_project_id_created_at_index" ON "ai_usage" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_fingerprint_index" ON "ai_usage" USING btree ("fingerprint");