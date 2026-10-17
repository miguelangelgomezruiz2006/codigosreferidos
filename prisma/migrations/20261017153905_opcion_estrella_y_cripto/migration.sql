-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- Openbank, opción estrella.
UPDATE "Promotion" SET "featured" = true WHERE "slug" = 'openbank-invita-a-tus-amigos';

-- Kraken y Robinhood: sin aviso de «riesgo alto»; la volatilidad se explica en las condiciones.
UPDATE "Promotion" SET
  "risk" = 'NONE',
  "summary" = 'Abre tu cuenta de Robinhood Crypto con un enlace de invitación y haz un primer depósito. Recibes 10 € en criptomonedas.',
  "steps" = ARRAY[
    'Regístrate con el enlace de invitación y verifica tu identidad',
    'Haz un primer depósito (consulta el mínimo en la app)',
    'Recibe 10 € en criptomonedas',
    'Ten en cuenta que, si después inviertes en criptomonedas (incluido el regalo), su precio sube y baja mucho y estarás sujeto a esa volatilidad'
  ]
WHERE "slug" = 'robinhood-cripto-invitacion';

UPDATE "Promotion" SET
  "risk" = 'NONE',
  "steps" = ARRAY[
    'Regístrate con el enlace o introduce el código de invitación al crear la cuenta',
    'Verifica tu identidad con un documento del mismo país que elegiste al registrarte',
    'Deposita al menos 200 € y compra o vende al menos 200 € (confirma los importes en la app)',
    'Recibe 30 € en tu cuenta',
    'Ten en cuenta que, si inviertes en criptomonedas, su precio sube y baja mucho y estarás sujeto a esa volatilidad'
  ]
WHERE "slug" = 'kraken-invitacion';

-- eToro: el invitado recibe 50 €.
UPDATE "Promotion" SET
  "bonusText" = '50 € al invertir 100 $',
  "bonusCents" = 5000,
  "summary" = 'Abre tu cuenta de eToro con el enlace de invitación, haz tu primer depósito y tus primeras operaciones en los 90 días siguientes, y recibe 50 €.',
  "steps" = ARRAY[
    'Regístrate con el enlace de invitación y verifica tu cuenta',
    'En los 90 días siguientes, haz un primer depósito de al menos 100 $',
    'Abre una o varias operaciones por un total mínimo de 100 $',
    'Recibe 50 €'
  ],
  "status" = 'ACTIVE'
WHERE "slug" = 'etoro-invitacion';
