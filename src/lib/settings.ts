import "server-only";
import { db } from "@/lib/db";

export async function getSettings() {
  return db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

/** Texto legal: el dato si existe; si falta, un aviso visible. No se inventa nada. */
export function legalValue(value: string, label: string): string {
  return value.trim() || `[PENDIENTE: ${label}]`;
}
