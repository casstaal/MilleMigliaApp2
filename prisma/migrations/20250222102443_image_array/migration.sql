/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `Marker` table. All the data in the column will be lost.
  - You are about to drop the column `imgUrl2` on the `Marker` table. All the data in the column will be lost.
  - You are about to drop the column `imgUrl3` on the `Marker` table. All the data in the column will be lost.
  - You are about to drop the column `imgUrl4` on the `Marker` table. All the data in the column will be lost.
  - You are about to drop the column `imgUrl5` on the `Marker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Marker" DROP COLUMN "imgUrl",
DROP COLUMN "imgUrl2",
DROP COLUMN "imgUrl3",
DROP COLUMN "imgUrl4",
DROP COLUMN "imgUrl5",
ADD COLUMN     "images" TEXT[];
