-- CreateTable
CREATE TABLE "study_topics" (
    "id" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_topics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_topics_subjectId_idx" ON "study_topics"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "study_topics_subjectId_normalizedTitle_key" ON "study_topics"("subjectId", "normalizedTitle");

-- AddForeignKey
ALTER TABLE "study_topics" ADD CONSTRAINT "study_topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "study_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
