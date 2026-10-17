/**
 * Se ejecuta en cada publicación, después de crear o actualizar las tablas.
 * - Crea la fila de ajustes si no existe.
 * - SOLO si la base no tiene ninguna promoción (primera publicación), carga las
 *   promociones de `datos/promociones.ts` y tus códigos de `datos/mis-codigos.ts`.
 * Nunca pisa cambios hechos después desde Administración.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { loadMyCodes } from "./datos/mis-codigos";
import { loadPromotions } from "./datos/promociones";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("Sin DATABASE_URL: no se preparan datos.");
    return;
  }
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }) });
  try {
    await db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
    if ((await db.promotion.count()) > 0) {
      console.log("La base ya tiene promociones: no se carga nada.");
      return;
    }
    await loadPromotions(db);
    await loadMyCodes(db);
    console.log("Primera publicación: promociones y códigos cargados.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
