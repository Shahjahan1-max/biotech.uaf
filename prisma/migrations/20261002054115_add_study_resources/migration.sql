-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('NOTE', 'STUDY_GUIDE', 'PRESENTATION', 'REFERENCE', 'OTHER');

-- CreateTable
CREATE TABLE "StudyResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" "ResourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyResource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudyResource" ADD CONSTRAINT "StudyResource_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
