-- Códigos de Openbank del administrador: usos ilimitados. La rotación los reparte por turnos
-- (cada persona nueva recibe el siguiente al último mostrado).
UPDATE "ReferralCode" SET "maxUses" = NULL
WHERE "kind" = 'ADMIN'
  AND "promotionId" IN (SELECT "id" FROM "Promotion" WHERE "slug" = 'openbank-invita-a-tus-amigos');
