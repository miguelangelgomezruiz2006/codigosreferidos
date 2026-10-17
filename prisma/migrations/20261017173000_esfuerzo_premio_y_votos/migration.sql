-- CreateEnum
CREATE TYPE "Effort" AS ENUM ('NONE', 'SPEND', 'DEPOSIT', 'INVEST');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('CASH', 'CASHBACK', 'CRYPTO');

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "effort" "Effort" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "requirementText" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rewardType" "RewardType" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "workedCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WorkedVote" (
    "promotionId" TEXT NOT NULL,
    "voterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkedVote_pkey" PRIMARY KEY ("promotionId","voterKey")
);

-- AddForeignKey
ALTER TABLE "WorkedVote" ADD CONSTRAINT "WorkedVote_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Esfuerzo y tipo de premio de las promociones actuales.
UPDATE "Promotion" SET "effort" = 'SPEND',   "requirementText" = 'Pagar con la tarjeta Aqua',        "rewardType" = 'CASHBACK' WHERE "slug" = 'bbva-invita-a-un-amigo';
UPDATE "Promotion" SET "effort" = 'DEPOSIT', "requirementText" = 'Ingresar 70 €',                     "rewardType" = 'CASH'     WHERE "slug" = 'openbank-invita-a-tus-amigos';
UPDATE "Promotion" SET "effort" = 'DEPOSIT', "requirementText" = 'Mantener 1.000 € o invertir 100 €', "rewardType" = 'CASH'     WHERE "slug" = 'myinvestor-plan-amigo';
UPDATE "Promotion" SET "effort" = 'INVEST',  "requirementText" = 'Invertir 1.000 € durante 90 días',  "rewardType" = 'CASH'     WHERE "slug" = 'mintos-invita-a-un-amigo';
UPDATE "Promotion" SET "effort" = 'DEPOSIT', "requirementText" = 'Hacer un primer depósito',          "rewardType" = 'CRYPTO'   WHERE "slug" = 'robinhood-cripto-invitacion';
UPDATE "Promotion" SET "effort" = 'SPEND',   "requirementText" = 'Recargar y pagar con la tarjeta',   "rewardType" = 'CASH'     WHERE "slug" = 'revolut-invitacion';
UPDATE "Promotion" SET "effort" = 'INVEST',  "requirementText" = 'Depositar y operar 200 €',          "rewardType" = 'CASH'     WHERE "slug" = 'kraken-invitacion';
UPDATE "Promotion" SET "effort" = 'INVEST',  "requirementText" = 'Invertir 100 $',                    "rewardType" = 'CASH'     WHERE "slug" = 'etoro-invitacion';
