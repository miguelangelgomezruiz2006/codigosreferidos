-- Nuevos tipos de premio. (Van solos en esta migración: PostgreSQL no deja usar un valor nuevo de un enum
-- en la misma transacción en que se crea.)
ALTER TYPE "RewardType" ADD VALUE IF NOT EXISTS 'NONE';
ALTER TYPE "RewardType" ADD VALUE IF NOT EXISTS 'VOUCHER';
ALTER TYPE "RewardType" ADD VALUE IF NOT EXISTS 'SHARES';
ALTER TYPE "RewardType" ADD VALUE IF NOT EXISTS 'DISCOUNT';
