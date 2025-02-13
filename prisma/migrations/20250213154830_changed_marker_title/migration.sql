/*
  Warnings:

  - You are about to drop the column `title` on the `Marker` table. All the data in the column will be lost.
  - Added the required column `brand` to the `Marker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Marker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Marker" DROP COLUMN "title",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL;
