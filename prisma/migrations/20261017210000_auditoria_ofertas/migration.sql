-- Auditoría del 17/10/2026 contra las condiciones oficiales de cada entidad.

-- eToro y Revolut: según sus condiciones oficiales, la recompensa del programa de invitación es solo para quien invita;
-- el nuevo cliente no recibe nada. Se ocultan (borrador) para no prometer un bono que no existe.
-- Se pueden volver a activar desde Administración si la entidad confirma una recompensa para el invitado.
UPDATE "Promotion" SET "status" = 'DRAFT' WHERE "slug" IN ('etoro-invitacion', 'revolut-invitacion');

-- Mintos: la página oficial de invitación ofrece ahora 50 € (antes 25 €) con otros plazos.
UPDATE "Promotion" SET
  "bonusText" = '50 € al invertir 1.000 €',
  "bonusCents" = 5000,
  "requirementText" = 'Invertir 1.000 € hasta el día 90',
  "requiredCents" = 100000,
  "summary" = 'Plataforma de inversión con riesgo de pérdida. Recibes 50 € si inviertes al menos 1.000 € en los 60 días siguientes al registro y los mantienes invertidos hasta el día 90.',
  "steps" = ARRAY[
    'Regístrate con el enlace de invitación',
    'En los 60 días siguientes al registro, invierte al menos 1.000 € en préstamos, bonos, ETF o inmobiliario (Smart Cash no cuenta)',
    'Mantén al menos 1.000 € invertidos hasta el día 90 desde el registro',
    'Recibe 50 € a los 90 días del registro'
  ]
WHERE "slug" = 'mintos-invita-a-un-amigo';

-- Openbank: importe correcto, pero se cobra en tres pagos y tiene exclusiones.
UPDATE "Promotion" SET
  "bonusText" = '70 € netos en tres pagos',
  "requirementText" = 'Ingresar 70 € y usar tarjeta y Bizum',
  "summary" = 'Abre la Cuenta Corriente Open con un código de amigo, ingresa al menos 70 € y activa la tarjeta y Bizum. Cobras 70 € netos en tres pagos. No puedes participar si fuiste cliente de Openbank en los 12 meses anteriores ni si te diste de alta en otra promoción de Bizum en ese tiempo.',
  "steps" = ARRAY[
    'Abre la Cuenta Corriente Open con el código de amigo antes del 29/10/2026',
    'En los 30 días siguientes a la apertura, ingresa al menos 70 €',
    'Activa la tarjeta',
    'Trae Bizum a Openbank y mantenlo al menos 3 meses',
    'Recibe 70 € netos en tres pagos (30 € + 20 € + 20 €), en la segunda quincena de cada mes'
  ]
WHERE "slug" = 'openbank-invita-a-tus-amigos';

-- MyInvestor: el importe mínimo depositado es 1.000 € (la otra opción es invertir 100 €, con riesgo).
UPDATE "Promotion" SET "requiredCents" = 100000 WHERE "slug" = 'myinvestor-plan-amigo';

-- Robinhood: depósito mínimo de 10 € y el regalo hay que mantenerlo 180 días.
UPDATE "Promotion" SET
  "bonusText" = 'Al menos 10 € en cripto',
  "requirementText" = 'Depositar al menos 10 €',
  "requiredCents" = 1000,
  "summary" = 'Abre tu cuenta de Robinhood Crypto con un enlace de invitación y deposita al menos 10 €. Recibes al menos 10 € en criptomonedas, que debes mantener 180 días antes de poder retirarlos.',
  "steps" = ARRAY[
    'Regístrate con el enlace de invitación (solo si nunca has tenido cuenta en Robinhood)',
    'Deposita al menos 10 € (o el importe que indique la app)',
    'Recibe al menos 10 € en criptomonedas',
    'Mantén su valor 180 días antes de retirarlo; su precio sube y baja y puede perder valor'
  ]
WHERE "slug" = 'robinhood-cripto-invitacion';

-- MyInvestor: el importe es bruto y no basta con abrir la cuenta.
UPDATE "Promotion" SET "bonusText" = '25 € brutos' WHERE "slug" = 'myinvestor-plan-amigo';
