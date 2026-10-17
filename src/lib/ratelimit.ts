import "server-only";
import { db } from "@/lib/db";

/**
 * Cuenta un intento y dice si está permitido: como mucho `limit` intentos
 * por `windowMs` para la misma clave (por ejemplo, «login:email@x.es»).
 */
export async function hitRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const row = await db.rateLimit.findUnique({ where: { key } });
  if (!row || row.resetAt <= now) {
    await db.rateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    return true;
  }
  if (row.count >= limit) return false;
  await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}
