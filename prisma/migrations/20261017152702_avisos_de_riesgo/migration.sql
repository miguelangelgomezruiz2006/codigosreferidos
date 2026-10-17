-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NONE', 'INVESTMENT', 'CRYPTO');

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "risk" "RiskLevel" NOT NULL DEFAULT 'NONE';

-- Promociones de inversión y criptomonedas ya publicadas.
UPDATE "Promotion" SET "risk" = 'INVESTMENT' WHERE "slug" IN ('mintos-invita-a-un-amigo', 'myinvestor-plan-amigo');
UPDATE "Promotion" SET "risk" = 'CRYPTO' WHERE "slug" = 'robinhood-cripto-invitacion';
