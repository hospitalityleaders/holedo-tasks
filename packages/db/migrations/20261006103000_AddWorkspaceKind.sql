CREATE TYPE "public"."workspace_kind" AS ENUM('personal', 'company');--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "kind" "workspace_kind" DEFAULT 'company' NOT NULL;--> statement-breakpoint
UPDATE "workspace"
SET "kind" = 'personal'
WHERE EXISTS (
  SELECT 1
  FROM "board"
  WHERE "board"."workspaceId" = "workspace"."id"
    AND "board"."slug" = 'my-tasks'
    AND "board"."name" = 'My Tasks'
    AND "board"."createdBy" = "workspace"."createdBy"
    AND "board"."deletedAt" IS NULL
);--> statement-breakpoint
CREATE OR REPLACE FUNCTION "enforce_single_company_workspace"()
RETURNS trigger AS $$
BEGIN
  IF NEW."userId" IS NOT NULL
    AND NEW."status" = 'active'
    AND NEW."deletedAt" IS NULL
    AND EXISTS (
      SELECT 1 FROM "workspace"
      WHERE "workspace"."id" = NEW."workspaceId"
        AND "workspace"."kind" = 'company'
        AND "workspace"."deletedAt" IS NULL
    )
    AND EXISTS (
      SELECT 1
      FROM "workspace_members" AS existing_member
      JOIN "workspace" AS existing_workspace
        ON existing_workspace."id" = existing_member."workspaceId"
      WHERE existing_member."userId" = NEW."userId"
        AND existing_member."workspaceId" <> NEW."workspaceId"
        AND existing_member."status" = 'active'
        AND existing_member."deletedAt" IS NULL
        AND existing_workspace."kind" = 'company'
        AND existing_workspace."deletedAt" IS NULL
    )
  THEN
    RAISE EXCEPTION 'A Holedo member can belong to only one company Tasks workspace';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "workspace_members_single_company"
BEFORE INSERT OR UPDATE OF "userId", "workspaceId", "status", "deletedAt"
ON "workspace_members"
FOR EACH ROW
EXECUTE FUNCTION "enforce_single_company_workspace"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "enforce_single_company_workspace_creator"()
RETURNS trigger AS $$
BEGIN
  IF NEW."kind" = 'company'
    AND NEW."createdBy" IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM "workspace_members" AS existing_member
      JOIN "workspace" AS existing_workspace
        ON existing_workspace."id" = existing_member."workspaceId"
      WHERE existing_member."userId" = NEW."createdBy"
        AND existing_member."status" = 'active'
        AND existing_member."deletedAt" IS NULL
        AND existing_workspace."kind" = 'company'
        AND existing_workspace."deletedAt" IS NULL
    )
  THEN
    RAISE EXCEPTION 'A Holedo member can belong to only one company Tasks workspace';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "workspace_single_company_creator"
BEFORE INSERT ON "workspace"
FOR EACH ROW
EXECUTE FUNCTION "enforce_single_company_workspace_creator"();
