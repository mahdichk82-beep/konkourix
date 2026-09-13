-- AlterTable
ALTER TABLE "study_sessions" ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- AddCheckConstraint
ALTER TABLE "study_sessions"
ADD CONSTRAINT "study_sessions_finish_cancel_exclusive"
CHECK (NOT ("endedAt" IS NOT NULL AND "cancelledAt" IS NOT NULL));
