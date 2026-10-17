-- Revolut vuelve a mostrarse con el enlace de invitación del propietario, pero sin prometer un bono al nuevo cliente:
-- según la ayuda oficial de Revolut, la recompensa de su programa de invitación es para quien invita.
UPDATE "Promotion" SET
  "status" = 'ACTIVE',
  "bonusText" = 'Sin bono confirmado para ti',
  "bonusCents" = 0,
  "requiredCents" = NULL,
  "requirementText" = 'Abrir la cuenta con el enlace',
  "summary" = 'Según la ayuda oficial de Revolut, la recompensa de su programa de invitación es para quien invita (aquí, el propietario de Bonificados), no para el nuevo cliente. A veces Revolut muestra en la app campañas con premio también para quien se registra: si al abrir tu cuenta ves una, sus condiciones son las que valen. Úsalo si ya querías una cuenta de Revolut.',
  "steps" = ARRAY[
    'Regístrate con el enlace de invitación y verifica tu identidad',
    'Si la app te muestra una campaña con premio para ti, revisa sus condiciones antes de seguir',
    'Para que la invitación cuente: añade dinero con tarjeta o transferencia (las de otros clientes de Revolut no cuentan), pide la tarjeta física y haz los pagos que indique la campaña',
    'No cuentan apuestas, tarjetas regalo, cambio de divisas ni transferencias'
  ],
  "termsUrl" = 'https://help.revolut.com/es-ES/help/referrals/more-help-with-referrals/referrals-new/what-are-the-conditions-of-the-referral-campaign/'
WHERE "slug" = 'revolut-invitacion';

-- Logos de cada entidad (icono público de su web, servido a través de la propia web con el optimizador de imágenes).
UPDATE "Entity" SET "logoUrl" = 'https://www.google.com/s2/favicons?domain=openbank.es&sz=128'   WHERE "slug" = 'openbank';
UPDATE "Entity" SET "logoUrl" = 'https://www.google.com/s2/favicons?domain=bbva.es&sz=128'       WHERE "slug" = 'bbva';
UPDATE "Entity" SET "logoUrl" = 'https://www.google.com/s2/favicons?domain=myinvestor.es&sz=128' WHERE "slug" = 'myinvestor';
UPDATE "Entity" SET "logoUrl" = 'https://www.google.com/s2/favicons?domain=mintos.com&sz=128'    WHERE "slug" = 'mintos';
UPDATE "Entity" SET "logoUrl" = 'https://www.google.com/s2/favicons?domain=robinhood.com&sz=128' WHERE "slug" = 'robinhood';
UPDATE "Entity" SET "logoUrl" = 'https://www.google.com/s2/favicons?domain=revolut.com&sz=128'   WHERE "slug" = 'revolut';
UPDATE "Entity" SET "logoUrl" = 'https://www.google.com/s2/favicons?domain=kraken.com&sz=128'    WHERE "slug" = 'kraken';
UPDATE "Entity" SET "logoUrl" = 'https://www.google.com/s2/favicons?domain=etoro.com&sz=128'     WHERE "slug" = 'etoro';
