-- AlterTable
ALTER TABLE "StudyResource" ADD COLUMN     "fileMimeType" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "originalFileName" TEXT,
ALTER COLUMN "url" DROP NOT NULL;
