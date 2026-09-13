-- CreateTable
CREATE TABLE "assessment_attempts" (
    "id" UUID NOT NULL,
    "studentProfileId" UUID NOT NULL,
    "dailyTaskId" UUID,
    "subjectId" UUID,
    "topicId" UUID,
    "title" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "incorrectCount" INTEGER NOT NULL,
    "blankCount" INTEGER NOT NULL,
    "invalidatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_attempts_time_order" CHECK ("endedAt" > "startedAt"),
    CONSTRAINT "assessment_attempts_counts_nonnegative" CHECK (
        "correctCount" >= 0 AND "incorrectCount" >= 0 AND "blankCount" >= 0
    ),
    CONSTRAINT "assessment_attempts_question_total_positive" CHECK (
        "correctCount" + "incorrectCount" + "blankCount" > 0
    ),
    CONSTRAINT "assessment_attempts_topic_requires_subject" CHECK (
        "topicId" IS NULL OR "subjectId" IS NOT NULL
    )
);

-- CreateIndex
CREATE INDEX "assessment_attempts_studentProfileId_endedAt_idx" ON "assessment_attempts"("studentProfileId", "endedAt");

-- CreateIndex
CREATE INDEX "assessment_attempts_dailyTaskId_idx" ON "assessment_attempts"("dailyTaskId");

-- CreateIndex
CREATE INDEX "assessment_attempts_subjectId_endedAt_idx" ON "assessment_attempts"("subjectId", "endedAt");

-- CreateIndex
CREATE INDEX "assessment_attempts_topicId_endedAt_idx" ON "assessment_attempts"("topicId", "endedAt");

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_dailyTaskId_fkey" FOREIGN KEY ("dailyTaskId") REFERENCES "daily_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "study_subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "study_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
