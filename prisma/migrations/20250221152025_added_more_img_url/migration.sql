/*
  Warnings:

  - Added the required column `imgUrl2` to the `Marker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imgUrl3` to the `Marker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imgUrl4` to the `Marker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imgUrl5` to the `Marker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Marker" ADD COLUMN     "imgUrl2" TEXT NOT NULL,
ADD COLUMN     "imgUrl3" TEXT NOT NULL,
ADD COLUMN     "imgUrl4" TEXT NOT NULL,
ADD COLUMN     "imgUrl5" TEXT NOT NULL;
