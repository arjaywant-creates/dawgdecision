-- CreateTable
CREATE TABLE "plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL,
    "rent" DOUBLE PRECISION NOT NULL,
    "utilities" DOUBLE PRECISION NOT NULL,
    "transportation" DOUBLE PRECISION NOT NULL,
    "mandatoryFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leaseMonths" INTEGER NOT NULL DEFAULT 12,
    "monthlyExpenses" DOUBLE PRECISION,
    "leaseExpenses" DOUBLE PRECISION,
    "monthlySurplus" DOUBLE PRECISION,
    "leaseSurplus" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT,

    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstScenarioId" TEXT NOT NULL,
    "secondScenarioId" TEXT NOT NULL,
    "lowerMonthlyCostScenario" TEXT,
    "monthlyDifference" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comparison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_userId_idx" ON "plan"("userId");

-- CreateIndex
CREATE INDEX "scenario_userId_idx" ON "scenario"("userId");

-- CreateIndex
CREATE INDEX "scenario_planId_idx" ON "scenario"("planId");

-- CreateIndex
CREATE INDEX "comparison_userId_idx" ON "comparison"("userId");

-- CreateIndex
CREATE INDEX "comparison_firstScenarioId_idx" ON "comparison"("firstScenarioId");

-- CreateIndex
CREATE INDEX "comparison_secondScenarioId_idx" ON "comparison"("secondScenarioId");

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison" ADD CONSTRAINT "comparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison" ADD CONSTRAINT "comparison_firstScenarioId_fkey" FOREIGN KEY ("firstScenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison" ADD CONSTRAINT "comparison_secondScenarioId_fkey" FOREIGN KEY ("secondScenarioId") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
