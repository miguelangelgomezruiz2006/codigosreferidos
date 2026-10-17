-- «Me ha funcionado» de Luisa (MyInvestor y Kraken), amiga del propietario que ha cobrado.
-- Ramón (Revolut) aún no: su recompensa está pendiente.
INSERT INTO "WorkedVote" ("promotionId", "voterKey")
SELECT p."id", v."voterKey"
FROM (VALUES
  ('myinvestor-plan-amigo', 'amigo:luisa'),
  ('kraken-invitacion', 'amigo:luisa')
) AS v("slug", "voterKey")
JOIN "Promotion" p ON p."slug" = v."slug"
ON CONFLICT DO NOTHING;

UPDATE "Promotion" p SET "workedCount" = (SELECT COUNT(*) FROM "WorkedVote" w WHERE w."promotionId" = p."id");
