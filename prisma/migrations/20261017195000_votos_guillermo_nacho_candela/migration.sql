-- «Me ha funcionado» de Guillermo, Nacho y Candela (amigos del propietario que han cobrado):
-- Guillermo: Openbank. Nacho: Openbank y BBVA. Candela: Robinhood y Openbank.
INSERT INTO "WorkedVote" ("promotionId", "voterKey")
SELECT p."id", v."voterKey"
FROM (VALUES
  ('openbank-invita-a-tus-amigos', 'amigo:guillermo'),
  ('openbank-invita-a-tus-amigos', 'amigo:nacho'),
  ('bbva-invita-a-un-amigo', 'amigo:nacho'),
  ('robinhood-cripto-invitacion', 'amigo:candela'),
  ('openbank-invita-a-tus-amigos', 'amigo:candela')
) AS v("slug", "voterKey")
JOIN "Promotion" p ON p."slug" = v."slug"
ON CONFLICT DO NOTHING;

-- El contador de cada promoción es el número de votos.
UPDATE "Promotion" p SET "workedCount" = (SELECT COUNT(*) FROM "WorkedVote" w WHERE w."promotionId" = p."id");
