ALTER TABLE "messages" ADD COLUMN "asks" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "answered_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "messages_open_questions" ON "messages" USING btree ("project_id") WHERE "messages"."answered_at" is null and cardinality("messages"."asks") > 0;