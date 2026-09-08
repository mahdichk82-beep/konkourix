-- CreateEnum
CREATE TYPE "StudentGoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "subjectId" UUID,
    "dailyTaskId" UUID,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_goals" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "subjectId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" DATE,
    "status" "StudentGoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_sessions_studentProfileId_startedAt_idx" ON "study_sessions"("studentProfileId", "startedAt");

-- CreateIndex
CREATE INDEX "study_sessions_studentProfileId_subjectId_startedAt_idx" ON "study_sessions"("studentProfileId", "subjectId", "startedAt");

-- CreateIndex
CREATE INDEX "study_sessions_dailyTaskId_idx" ON "study_sessions"("dailyTaskId");

-- CreateIndex
CREATE INDEX "student_goals_studentProfileId_status_idx" ON "student_goals"("studentProfileId", "status");

-- CreateIndex
CREATE INDEX "student_goals_studentProfileId_targetDate_idx" ON "student_goals"("studentProfileId", "targetDate");

-- CreateIndex
CREATE INDEX "student_goals_subjectId_idx" ON "student_goals"("subjectId");

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "study_subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_dailyTaskId_fkey" FOREIGN KEY ("dailyTaskId") REFERENCES "daily_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_goals" ADD CONSTRAINT "student_goals_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_goals" ADD CONSTRAINT "student_goals_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "study_subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
