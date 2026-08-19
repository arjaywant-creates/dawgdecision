/*
  Warnings:

  - You are about to drop the column `lowerMonthlyCostScenario` on the `comparison` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyDifference` on the `comparison` table. All the data in the column will be lost.
  - You are about to drop the column `leaseExpenses` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `leaseMonths` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `leaseSurplus` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyExpenses` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyIncome` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `monthlySurplus` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `otherExpenses` on the `scenario` table. All the data in the column will be lost.
  - You are about to drop the column `rent` on the `scenario` table. All the data in the column will be lost.
  - Added the required column `contractMonths` to the `scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPeriodMonths` to the `scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `housingCost` to the `scenario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comparison" DROP COLUMN "lowerMonthlyCostScenario",
DROP COLUMN "monthlyDifference",
ADD COLUMN     "resultSnapshot" JSONB;

-- AlterTable
ALTER TABLE "scenario" DROP COLUMN "leaseExpenses",
DROP COLUMN "leaseMonths",
DROP COLUMN "leaseSurplus",
DROP COLUMN "monthlyExpenses",
DROP COLUMN "monthlyIncome",
DROP COLUMN "monthlySurplus",
DROP COLUMN "otherExpenses",
DROP COLUMN "rent",
ADD COLUMN     "commuteMinutes" INTEGER,
ADD COLUMN     "contractMonths" INTEGER NOT NULL,
ADD COLUMN     "costPeriodMonths" INTEGER NOT NULL,
ADD COLUMN     "housingCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "parking" DOUBLE PRECISION,
ADD COLUMN     "upfrontCosts" DOUBLE PRECISION,
ALTER COLUMN "utilities" DROP NOT NULL,
ALTER COLUMN "transportation" DROP NOT NULL,
ALTER COLUMN "mandatoryFees" DROP NOT NULL,
ALTER COLUMN "mandatoryFees" DROP DEFAULT;
