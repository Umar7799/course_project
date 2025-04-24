/*
  Warnings:

  - You are about to drop the column `imageFile` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Template` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Template" DROP COLUMN "imageFile",
DROP COLUMN "imageUrl",
ADD COLUMN     "image" TEXT;
