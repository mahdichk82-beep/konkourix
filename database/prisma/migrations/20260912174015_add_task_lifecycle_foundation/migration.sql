-- CreateEnum
CREATE TYPE "DailyTaskSkipReason" AS ENUM ('NO_TIME', 'TOO_DIFFICULT', 'FORGOT', 'OTHER');

-- AlterTable
ALTER TABLE "daily_tasks" ADD COLUMN     "skipReason" "DailyTaskSkipReason",
ADD COLUMN     "skippedAt" TIMESTAMP(3);
