import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Opcional para generar el cliente; obligatoria para migrar y cargar datos.
    // Con Neon, las migraciones usan la conexión directa (sin el agrupador de conexiones).
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    // Solo en local con `npm run db:local`: base auxiliar para preparar migraciones.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || undefined,
  },
});
