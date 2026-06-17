ALTER TABLE "public"."merchants"
ADD COLUMN "theme_pattern" TEXT DEFAULT 'none'::TEXT NOT NULL;
