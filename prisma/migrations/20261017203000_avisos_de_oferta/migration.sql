-- CreateTable
CREATE TABLE "OfferReport" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "reporterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferReport_createdAt_idx" ON "OfferReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OfferReport_promotionId_reporterKey_key" ON "OfferReport"("promotionId", "reporterKey");

-- AddForeignKey
ALTER TABLE "OfferReport" ADD CONSTRAINT "OfferReport_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
