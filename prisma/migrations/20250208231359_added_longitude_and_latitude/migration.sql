/*
  Warnings:

  - You are about to drop the column `location` on the `Check` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `Check` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Check` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Check" DROP COLUMN "location",
ADD COLUMN     "latitude" TEXT NOT NULL,
ADD COLUMN     "longitude" TEXT NOT NULL;
