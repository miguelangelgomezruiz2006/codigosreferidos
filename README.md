# Bonificados (nombre provisional)

Web de promociones bancarias y códigos de invitación para España.

- **Visitantes**: ven promociones y copian códigos **sin registrarse**.
- **Rotación**: primero tus códigos (cada uno con su límite de usos y su prioridad); cuando se agotan, los de la comunidad por turnos, siempre el que menos veces se ha mostrado.
- **Comunidad**: entran con su email (enlace mágico, sin contraseña), añaden un código por promoción y ven cuántas veces se ha mostrado y copiado.
- **Avisos**: botón «Este código no funciona». Con X avisos de conexiones distintas, el código de la comunidad se oculta solo (X se cambia en Administración › Ajustes).
- **Administración**: promociones, entidades, tus códigos y límites, moderación, estadísticas y datos legales.

El nombre de la web se cambia en `src/lib/site.ts`.

## Puesta en marcha en tu ordenador

Necesitas Node.js 24.

```bash
npm install
npm run db:local        # arranca una base de datos PostgreSQL local (muestra su dirección)
cp .env.example .env    # y rellena DATABASE_URL, SHADOW_DATABASE_URL, AUTH_SECRET y ADMIN_EMAIL
npm run db:migrate      # crea las tablas
npm run db:seed         # carga datos de EJEMPLO (borra lo que haya; solo funciona en local)
npm run db:mis-codigos  # carga tus códigos (prisma/mis-codigos.ts)
npm run dev             # abre http://localhost:3000
```

- Para entrar como administración, usa el email de `ADMIN_EMAIL` en «Añadir mi código».
- Sin clave de Resend, los emails no salen: el enlace para entrar aparece en http://localhost:3000/dev/buzon.
- Si apagas el ordenador, vuelve a arrancar la base con `npm run db:start`.

Tus códigos están en `prisma/mis-codigos.ts`. Para añadir o cambiar uno, edítalo ahí y repite `npm run db:mis-codigos` (también se pueden gestionar desde Administración).

## Comprobaciones

```bash
npm test            # reglas de rotación, avisos y validación de enlaces
npm run lint
npm run typecheck
```

## Publicar (Vercel + Neon)

1. Crea una base de datos en Neon y copia su dirección.
2. Crea el proyecto en Vercel desde el repositorio y añade las variables: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM` (y `AUTH_URL` con tu dominio).
3. Crea las tablas y los ajustes en la base de producción (no carga ejemplos):
   ```bash
   npx prisma migrate deploy
   npm run db:init
   npm run db:mis-codigos
   ```
4. Entra con tu email y crea las promociones reales desde Administración.

## Seguridad y reglas

- Todo el recuento (mostrado, copiado, usos, avisos) se decide en el servidor.
- Los enlaces de invitación solo se aceptan si son `https` y del dominio oficial de la entidad (o de los dominios extra que indiques en Entidades), para evitar enlaces falsos.
- Cookies: solo técnicas (identificador anónimo de visitante y sesión). No se guarda la IP, solo una huella cifrada para limitar abusos.
- Los datos legales no se inventan: si faltan, los textos muestran `[PENDIENTE: …]`.
