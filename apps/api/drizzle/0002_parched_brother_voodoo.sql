
CREATE TYPE "public"."website_role" AS ENUM(
    'administrator',
    'editor',
    'author',
    'contributor',
    'viewer'
);
--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM(
    'owner',
    'admin',
    'member'
);
--> statement-breakpoint
CREATE TABLE "website_memberships" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "website_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" "website_role" DEFAULT 'viewer' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memberships"
ALTER COLUMN "role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "memberships"
ALTER COLUMN "role"
SET DATA TYPE "public"."workspace_role"
USING (
    CASE "role"::text
        WHEN 'owner' THEN 'owner'
        WHEN 'admin' THEN 'admin'
        ELSE 'member'
    END
)::"public"."workspace_role";
--> statement-breakpoint
ALTER TABLE "memberships"
ALTER COLUMN "role" SET DEFAULT 'member';
--> statement-breakpoint
ALTER TABLE "website_memberships"
ADD CONSTRAINT "website_memberships_website_id_websites_id_fk"
FOREIGN KEY ("website_id")
REFERENCES "public"."websites"("id")
ON DELETE cascade
ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "website_memberships"
ADD CONSTRAINT "website_memberships_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE cascade
ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "website_memberships_website_user_unique"
ON "website_memberships" USING btree ("website_id", "user_id");
--> statement-breakpoint
CREATE INDEX "website_memberships_user_id_idx"
ON "website_memberships" USING btree ("user_id");
--> statement-breakpoint
DROP TYPE "public"."membership_role";
