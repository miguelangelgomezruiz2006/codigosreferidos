-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "requiredCents" INTEGER;

-- Desembolso mínimo según los requisitos guardados de cada promoción (solo los que dan un importe en euros).
-- Openbank: ingresar 70 €. MyInvestor: invertir 100 € (o mantener 1.000 €). Mintos: invertir 1.000 €. Kraken: depositar 200 €.
-- BBVA, Revolut y Robinhood no indican importe; eToro lo da en dólares: se quedan vacíos.
UPDATE "Promotion" SET "requiredCents" = 7000   WHERE "slug" = 'openbank-invita-a-tus-amigos';
UPDATE "Promotion" SET "requiredCents" = 10000  WHERE "slug" = 'myinvestor-plan-amigo';
UPDATE "Promotion" SET "requiredCents" = 100000 WHERE "slug" = 'mintos-invita-a-un-amigo';
UPDATE "Promotion" SET "requiredCents" = 20000  WHERE "slug" = 'kraken-invitacion';
