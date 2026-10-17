-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "voterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_promotionId_voterKey_key" ON "Review"("promotionId", "voterKey");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
