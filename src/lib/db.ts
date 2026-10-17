import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Una sola conexión reutilizada (evita abrir conexiones nuevas en cada recarga en desarrollo).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // La base local de pruebas (`prisma dev`) no admite bien consultas simultáneas:
  // en local se usa DATABASE_POOL_MAX=1. En producción (Neon) se deja el valor por defecto.
  const max = Number(process.env.DATABASE_POOL_MAX) || undefined;
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
