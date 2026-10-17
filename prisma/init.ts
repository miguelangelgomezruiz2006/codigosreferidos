/**
 * Preparación segura para producción: crea la fila de ajustes si no existe.
 * No borra nada ni crea promociones de ejemplo.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

db.settings
  .upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
  .then(() => console.log("Ajustes listos."))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
