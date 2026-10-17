"use server";
import { z } from "zod";
import { registerUse, reportCode, revealCode, type RevealedCode } from "@/lib/codes";
import { hitRateLimit } from "@/lib/ratelimit";
import { getSettings } from "@/lib/settings";
import { getOrCreateVisitorId, ipFingerprint } from "@/lib/visitor";

// Acciones públicas: no necesitan cuenta. Todo el recuento se decide aquí, en el servidor.

const id = z.string().min(1).max(40);

export type RevealState = { ok: true; code: RevealedCode } | { ok: false; error: string };

export async function revealAction(promotionId: string, another = false): Promise<RevealState> {
  if (!id.safeParse(promotionId).success) return { ok: false, error: "Promoción no válida." };
  const ip = await ipFingerprint();
  if (!(await hitRateLimit(`reveal:${ip}`, 120, 60 * 60 * 1000))) {
    return { ok: false, error: "Demasiadas peticiones seguidas. Espera un rato y vuelve a probar." };
  }
  const visitorId = await getOrCreateVisitorId();
  const code = await revealCode(promotionId, visitorId, another, `ip:${ip}`);
  if (!code) return { ok: false, error: "Ahora mismo no hay códigos disponibles para esta promoción." };
  return { ok: true, code };
}

export async function trackAction(codeId: string, type: "COPY" | "OPEN"): Promise<void> {
  if (!id.safeParse(codeId).success || (type !== "COPY" && type !== "OPEN")) return;
  if (!(await hitRateLimit(`track:${await ipFingerprint()}`, 300, 60 * 60 * 1000))) return;
  await registerUse(codeId, await getOrCreateVisitorId(), type);
}

export async function reportAction(codeId: string, reason: string): Promise<{ ok: boolean; message: string }> {
  if (!id.safeParse(codeId).success) return { ok: false, message: "Código no válido." };
  const ip = await ipFingerprint();
  if (!(await hitRateLimit(`report:${ip}`, 10, 24 * 60 * 60 * 1000))) {
    return { ok: false, message: "Has enviado muchos avisos hoy. Gracias, lo revisaremos." };
  }
  // Un aviso por conexión y código: borrar cookies no permite tumbar un código uno solo.
  const reporterKey = `ip:${ip}`;
  const { reportThreshold } = await getSettings();
  const result = await reportCode(codeId, reporterKey, reason, reportThreshold, await getOrCreateVisitorId());
  if (result === "duplicate") return { ok: true, message: "Ya nos habías avisado de este código. Gracias." };
  if (result === "not_found") return { ok: false, message: "Este código ya no está disponible." };
  return { ok: true, message: "Gracias por avisar. Pulsa «Dame otro código» para probar con otro." };
}
