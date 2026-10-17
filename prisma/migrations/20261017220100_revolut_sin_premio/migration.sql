-- Revolut: según su ayuda oficial, el nuevo cliente no tiene recompensa confirmada.
UPDATE "Promotion" SET "rewardType" = 'NONE' WHERE "slug" = 'revolut-invitacion';
