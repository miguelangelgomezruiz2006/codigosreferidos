-- Coinbase: condiciones que muestra la app (17/10/2026): 20 € en bitcoin para el nuevo cliente
-- tras su primera compra de 20 € o más; solo nuevos clientes en España; pago en unas 48 horas.
UPDATE "Promotion" SET
  "bonusText" = '20 € en bitcoin',
  "bonusCents" = 2000,
  "requiredCents" = 2000,
  "requirementText" = 'Comprar al menos 20 € en cripto',
  "summary" = 'Regístrate en Coinbase con la invitación y haz tu primera compra de 20 € o más: recibes 20 € en bitcoin unas 48 horas después. Solo para nuevos clientes en España. Quien te invita también recibe 20 €. Las criptomonedas son de alto riesgo: puedes perder lo que inviertas.',
  "steps" = ARRAY[
    'Regístrate con el enlace de invitación (solo nuevos clientes en España que nunca han tenido cuenta en Coinbase)',
    'Verifica tu identidad',
    'Haz tu primera compra de criptomonedas por 20 € o más (Coinbase Advanced no cuenta)',
    'Recibe 20 € en bitcoin unas 48 horas después de la compra',
    'Ten en cuenta que el precio de las criptomonedas sube y baja mucho: puedes perder lo que inviertas, también el regalo'
  ]
WHERE "slug" = 'coinbase-invitacion';
