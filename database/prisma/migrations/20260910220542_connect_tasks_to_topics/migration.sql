-- AlterTable
ALTER TABLE "daily_tasks" ADD COLUMN     "topicId" UUID;

-- CreateIndex
CREATE INDEX "daily_tasks_topicId_idx" ON "daily_tasks"("topicId");

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "study_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
