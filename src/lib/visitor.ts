import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";

// Cookie técnica anónima: sirve para que cada visitante vea siempre el mismo
// código, para contar usos reales y para que nadie reporte dos veces. No identifica a nadie.
const VISITOR_COOKIE = "vid";

/** Identificador anónimo del visitante. Solo se crea dentro de acciones del servidor. */
export async function getOrCreateVisitorId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing && /^[0-9a-f-]{36}$/.test(existing)) return existing;
  const id = randomUUID();
  jar.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });
  return id;
}

export async function readVisitorId(): Promise<string | null> {
  const v = (await cookies()).get(VISITOR_COOKIE)?.value;
  return v && /^[0-9a-f-]{36}$/.test(v) ? v : null;
}

/** Huella de la IP (cifrada, nunca se guarda la IP) para limitar abusos. */
export async function ipFingerprint(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${ip}`).digest("hex").slice(0, 24);
}
