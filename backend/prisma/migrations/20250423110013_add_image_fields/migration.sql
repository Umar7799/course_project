/*
  Warnings:

  - You are about to drop the column `image` on the `Template` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Template" DROP COLUMN "image",
ADD COLUMN     "imageFile" TEXT,
ADD COLUMN     "imageUrl" TEXT;
