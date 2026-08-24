/*
  Warnings:

  - You are about to drop the column `description` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `scenario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `comparisonId` to the `plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedScenario` to the `plan` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `plan` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "scenario" DROP CONSTRAINT "scenario_planId_fkey";

-- DropIndex
DROP INDEX "plan_userId_idx";

-- DropIndex
DROP INDEX "scenario_planId_idx";

-- AlterTable
ALTER TABLE "plan" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "comparisonId" TEXT NOT NULL,
ADD COLUMN     "selectedScenario" TEXT NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "scenario" DROP COLUMN "planId";

-- CreateIndex
CREATE UNIQUE INDEX "plan_userId_key" ON "plan"("userId");

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;
