-- CreateEnum
CREATE TYPE "StudyPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DailyTaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "study_subjects" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plans" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StudyPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "startsOn" DATE NOT NULL,
    "endsOn" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_tasks" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "studyPlanId" UUID,
    "subjectId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledFor" DATE NOT NULL,
    "estimatedMinutes" INTEGER,
    "status" "DailyTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_subjects_studentProfileId_archivedAt_idx" ON "study_subjects"("studentProfileId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "study_subjects_studentProfileId_normalizedName_key" ON "study_subjects"("studentProfileId", "normalizedName");

-- CreateIndex
CREATE INDEX "study_plans_studentProfileId_status_idx" ON "study_plans"("studentProfileId", "status");

-- CreateIndex
CREATE INDEX "study_plans_studentProfileId_startsOn_endsOn_idx" ON "study_plans"("studentProfileId", "startsOn", "endsOn");

-- CreateIndex
CREATE INDEX "daily_tasks_studentProfileId_scheduledFor_idx" ON "daily_tasks"("studentProfileId", "scheduledFor");

-- CreateIndex
CREATE INDEX "daily_tasks_studentProfileId_status_scheduledFor_idx" ON "daily_tasks"("studentProfileId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "daily_tasks_studyPlanId_idx" ON "daily_tasks"("studyPlanId");

-- CreateIndex
CREATE INDEX "daily_tasks_subjectId_idx" ON "daily_tasks"("subjectId");

-- AddForeignKey
ALTER TABLE "study_subjects" ADD CONSTRAINT "study_subjects_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "study_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "study_subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
