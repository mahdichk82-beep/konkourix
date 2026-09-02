-- CreateEnum
CREATE TYPE "StudentCounselorStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "educationLevel" TEXT,
    "schoolName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counselor_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bio" TEXT,
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counselor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_counselor_relationships" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "counselorId" UUID NOT NULL,
    "status" "StudentCounselorStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_counselor_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "counselor_profiles_userId_key" ON "counselor_profiles"("userId");

-- CreateIndex
CREATE INDEX "student_counselor_relationships_studentId_idx" ON "student_counselor_relationships"("studentId");

-- CreateIndex
CREATE INDEX "student_counselor_relationships_counselorId_idx" ON "student_counselor_relationships"("counselorId");

-- CreateIndex
CREATE INDEX "student_counselor_relationships_status_idx" ON "student_counselor_relationships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "student_counselor_relationships_studentId_counselorId_key" ON "student_counselor_relationships"("studentId", "counselorId");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselor_profiles" ADD CONSTRAINT "counselor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_counselor_relationships" ADD CONSTRAINT "student_counselor_relationships_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_counselor_relationships" ADD CONSTRAINT "student_counselor_relationships_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
