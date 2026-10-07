-- AlterTable: add login identifier (Student ID for students, shared username for admin)
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill: existing users keep signing in with their current identifier as username
UPDATE "User" SET "username" = "email" WHERE "username" IS NULL AND "email" IS NOT NULL;

-- Move the existing admin account to the shared admin username (single ADMIN record, password untouched)
UPDATE "User" SET "username" = 'Shahjahan@123'
WHERE "id" = (
    SELECT u."id"
    FROM "User" u
    INNER JOIN "Role" r ON u."roleId" = r."id"
    WHERE r."name" = 'ADMIN'
    LIMIT 1
);

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AlterTable: email is no longer part of authentication
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
