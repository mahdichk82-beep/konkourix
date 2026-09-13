-- AlterTable
ALTER TABLE "study_sessions"
ADD COLUMN "focusRating" INTEGER,
ADD COLUMN "studyQualityRating" INTEGER;

-- AddConstraint
ALTER TABLE "study_sessions"
ADD CONSTRAINT "study_sessions_focus_rating_range"
CHECK ("focusRating" IS NULL OR "focusRating" BETWEEN 1 AND 5),
ADD CONSTRAINT "study_sessions_study_quality_rating_range"
CHECK ("studyQualityRating" IS NULL OR "studyQualityRating" BETWEEN 1 AND 5);
