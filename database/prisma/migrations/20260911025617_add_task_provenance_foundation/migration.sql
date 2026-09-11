-- CreateEnum
CREATE TYPE "DailyTaskSource" AS ENUM ('PERSONAL', 'COUNSELOR');

-- AlterTable
ALTER TABLE "daily_tasks"
ADD COLUMN "createdByUserId" UUID,
ADD COLUMN "source" "DailyTaskSource";

-- Backfill existing student-owned tasks from their required profile/user relationship.
UPDATE "daily_tasks" AS task
SET
  "createdByUserId" = profile."userId",
  "source" = 'PERSONAL'
FROM "student_profiles" AS profile
WHERE task."studentProfileId" = profile."id";

-- Guard the transition to required provenance against unexpected legacy integrity gaps.
DO $task_provenance_backfill$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "daily_tasks"
    WHERE "createdByUserId" IS NULL OR "source" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot require DailyTask provenance: backfill left unmapped rows';
  END IF;
END
$task_provenance_backfill$;

ALTER TABLE "daily_tasks"
ALTER COLUMN "createdByUserId" SET NOT NULL,
ALTER COLUMN "source" SET NOT NULL;

-- CreateIndex
CREATE INDEX "daily_tasks_createdByUserId_idx" ON "daily_tasks"("createdByUserId");

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
