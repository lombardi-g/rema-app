-- Add optional title to Activity
ALTER TABLE "Activity" ADD COLUMN "title" TEXT;

-- Convert User.id (int autoincrement) and Activity.userId (int) to UUID,
-- preserving the existing user <-> activity relationship.

-- 1. New UUID columns (User.new_id gets a generated uuid per row)
ALTER TABLE "User" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Activity" ADD COLUMN "new_userId" UUID;

-- 2. Remap the FK via the old integer relationship
UPDATE "Activity" a SET "new_userId" = u."new_id" FROM "User" u WHERE a."userId" = u."id";

-- 3. Drop old FK + PK constraints
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";

-- 4. Replace int columns with the new UUID columns
ALTER TABLE "User" DROP COLUMN "id";
ALTER TABLE "User" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Activity" DROP COLUMN "userId";
ALTER TABLE "Activity" RENAME COLUMN "new_userId" TO "userId";

-- 5. Re-establish PK, NOT NULL, and FK
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
ALTER TABLE "Activity" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
