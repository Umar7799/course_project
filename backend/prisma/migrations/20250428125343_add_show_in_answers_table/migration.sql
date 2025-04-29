-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "position" INTEGER,
ADD COLUMN     "showInAnswersTable" BOOLEAN NOT NULL DEFAULT true;
