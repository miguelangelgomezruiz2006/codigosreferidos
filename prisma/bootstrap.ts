/**
 * Se ejecuta en cada publicación, después de crear o actualizar las tablas.
 * - Crea la fila de ajustes si no existe.
 * - Crea las promociones de `datos/promociones.ts` que aún no existen (por su slug)
 *   y les añade tus códigos de `datos/mis-codigos.ts`.
 * Nunca modifica promociones que ya existen: lo que cambies en Administración se respeta.
 * (Si borras desde el panel una promoción que está en `datos/promociones.ts`, volverá a
 * crearse en la siguiente publicación: para quitarla del todo, cadúcala en vez de borrarla.)
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
    const created = await loadPromotions(db, { onlyMissing: true });
    if (created.size === 0) {
      console.log("No hay promociones nuevas que cargar.");
      return;
    }
    await loadMyCodes(db, { onlyEntities: created });
    console.log(`Promociones nuevas cargadas: ${[...created].join(", ")}.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
