-- «Me ha funcionado» de Paco (Kraken, MyInvestor y eToro) y Juan (Robinhood), amigos del propietario que han cobrado.
INSERT INTO "WorkedVote" ("promotionId", "voterKey")
SELECT p."id", v."voterKey"
FROM (VALUES
  ('kraken-invitacion', 'amigo:paco'),
  ('myinvestor-plan-amigo', 'amigo:paco'),
  ('etoro-invitacion', 'amigo:paco'),
  ('robinhood-cripto-invitacion', 'amigo:juan')
) AS v("slug", "voterKey")
JOIN "Promotion" p ON p."slug" = v."slug"
ON CONFLICT DO NOTHING;

UPDATE "Promotion" p SET "workedCount" = (SELECT COUNT(*) FROM "WorkedVote" w WHERE w."promotionId" = p."id");
