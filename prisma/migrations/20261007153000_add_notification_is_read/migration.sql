-- AlterTable: explicit read flag (readAt alone stays as the timestamp of when it was read)
ALTER TABLE "Notification" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: notifications that already have a read timestamp are read
UPDATE "Notification" SET "isRead" = true WHERE "readAt" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
