/*
  Warnings:

  - A unique constraint covering the columns `[carId,userId]` on the table `CarReview` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CarReview" ADD COLUMN     "reply" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CarReview_carId_userId_key" ON "CarReview"("carId", "userId");
