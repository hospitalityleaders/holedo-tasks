CREATE TABLE IF NOT EXISTS "task_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"config" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_settings" ENABLE ROW LEVEL SECURITY;