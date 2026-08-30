-- DropIndex
DROP INDEX "plan_userId_key";

-- CreateIndex
CREATE INDEX "plan_userId_idx" ON "plan"("userId");
