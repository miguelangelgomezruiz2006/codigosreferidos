-- Códigos de Openbank añadidos en prisma/datos/mis-codigos.ts (commit 85ca60b).
-- Ese archivo solo se carga en promociones nuevas, así que se insertan aquí en la base publicada.
-- Límite de 2 usos por código y orden de rotación por prioridad.

UPDATE "ReferralCode" SET "maxUses" = 2, "priority" = 0
WHERE "kind" = 'ADMIN' AND "code" = '58967318513821209101'
  AND "promotionId" IN (SELECT "id" FROM "Promotion" WHERE "slug" = 'openbank-invita-a-tus-amigos');

INSERT INTO "ReferralCode" ("id", "promotionId", "kind", "code", "maxUses", "priority", "status")
SELECT 'obk' || md5(random()::text || n.code), p."id", 'ADMIN', n.code, 2, n.priority, 'APPROVED'
FROM "Promotion" p
CROSS JOIN (VALUES
  ('58977407618141198202', 1),
  ('58977412048160156231', 2),
  ('58977421019019127916', 3),
  ('58977451802193130011', 4),
  ('5897739168721418287A', 5)
) AS n(code, priority)
WHERE p."slug" = 'openbank-invita-a-tus-amigos'
  AND NOT EXISTS (
    SELECT 1 FROM "ReferralCode" r WHERE r."promotionId" = p."id" AND r."kind" = 'ADMIN' AND r."code" = n.code
  );
