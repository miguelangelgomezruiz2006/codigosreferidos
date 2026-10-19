"use server";
import { z } from "zod";
import type { FormState } from "@/app/actions/account";
import { db } from "@/lib/db";
import { registerUse, reportCode, revealCode, type RevealedCode } from "@/lib/codes";
import { hitRateLimit } from "@/lib/ratelimit";
import { getSettings } from "@/lib/settings";
import { OFFER_REPORT_KINDS } from "@/lib/site";
import { getOrCreateVisitorId, ipFingerprint } from "@/lib/visitor";

// Acciones públicas: no necesitan cuenta. Todo el recuento se decide aquí, en el servidor.

const id = z.string().min(1).max(40);
// Códigos que ya le han salido a este visitante en la página («Dame otro código» los salta).
const seenIds = z.array(id).max(200);

export type RevealState = { ok: true; code: RevealedCode } | { ok: false; error: string };

export async function revealAction(promotionId: string, another = false, seen: string[] = []): Promise<RevealState> {
  if (!id.safeParse(promotionId).success) return { ok: false, error: "Promoción no válida." };
  const seenParsed = seenIds.safeParse(seen);
  const ip = await ipFingerprint();
  if (!(await hitRateLimit(`reveal:${ip}`, 120, 60 * 60 * 1000))) {
    return { ok: false, error: "Demasiadas peticiones seguidas. Espera un rato y vuelve a probar." };
  }
  const visitorId = await getOrCreateVisitorId();
  const code = await revealCode(promotionId, visitorId, another, `ip:${ip}`, seenParsed.success ? seenParsed.data : []);
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

export type WorkedState = { ok: boolean; message: string; count?: number };

/** «Me ha funcionado»: un voto por conexión y promoción. */
export async function workedAction(promotionId: string): Promise<WorkedState> {
  if (!id.safeParse(promotionId).success) return { ok: false, message: "Promoción no válida." };
  const ip = await ipFingerprint();
  if (!(await hitRateLimit(`worked:${ip}`, 20, 24 * 60 * 60 * 1000))) {
    return { ok: false, message: "Has enviado muchas respuestas hoy. Gracias." };
  }
  const voterKey = `ip:${ip}`;
  return db.$transaction(async (tx) => {
    const promo = await tx.promotion.findUnique({ where: { id: promotionId }, select: { id: true, status: true } });
    if (!promo || promo.status === "DRAFT") return { ok: false, message: "Promoción no válida." };
    const inserted = await tx.workedVote.createMany({ data: [{ promotionId, voterKey }], skipDuplicates: true });
    const updated =
      inserted.count > 0
        ? await tx.promotion.update({ where: { id: promotionId }, data: { workedCount: { increment: 1 } }, select: { workedCount: true } })
        : await tx.promotion.findUniqueOrThrow({ where: { id: promotionId }, select: { workedCount: true } });
    return {
      ok: true,
      message: inserted.count > 0 ? "¡Enhorabuena! Gracias por contarlo: ayuda a otras personas." : "Ya nos lo habías dicho. ¡Gracias!",
      count: updated.workedCount,
    };
  });
}

const reviewSchema = z.object({
  promotionId: id,
  name: z.string().trim().min(2, "Escribe tu nombre o apodo.").max(40, "El nombre es demasiado largo (máximo 40 caracteres)."),
  text: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres).")
    .max(600, "La opinión es demasiado larga (máximo 600 caracteres).")
    .refine((t) => !/https?:\/\/|www\./i.test(t), "Sin enlaces, por favor."),
});

/** Opinión de un visitante. Queda pendiente hasta que el administrador la aprueba. */
export async function submitReviewAction(_prev: FormState, form: FormData): Promise<FormState> {
  // Campo trampa: los humanos no lo ven; los robots lo rellenan.
  if (String(form.get("web") ?? "")) return { ok: "¡Gracias! Revisaremos tu opinión antes de publicarla.", nonce: Date.now() };
  if (form.get("consent") !== "on") return { error: "Marca la casilla para confirmar que has usado la oferta y aceptas que se publique." };
  const parsed = reviewSchema.safeParse({
    promotionId: String(form.get("promotionId") ?? ""),
    name: String(form.get("name") ?? ""),
    text: String(form.get("text") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ip = await ipFingerprint();
  if (!(await hitRateLimit(`review:${ip}`, 5, 24 * 60 * 60 * 1000))) {
    return { error: "Has enviado varias opiniones hoy. Vuelve a probar mañana." };
  }
  const promo = await db.promotion.findUnique({ where: { id: parsed.data.promotionId }, select: { status: true } });
  if (!promo || promo.status === "DRAFT") return { error: "Elige la oferta que has usado." };

  const created = await db.review.createMany({ data: [{ ...parsed.data, voterKey: `ip:${ip}` }], skipDuplicates: true });
  if (created.count === 0) return { error: "Ya habías dejado una opinión sobre esta oferta. ¡Gracias!" };
  return { ok: "¡Gracias! Revisaremos tu opinión y la publicaremos en breve.", nonce: Date.now() };
}

/** Aviso de que una oferta ha caducado o tiene datos incorrectos. Lo revisa el administrador. */
export async function reportOfferAction(_prev: FormState, form: FormData): Promise<FormState> {
  const promotionId = String(form.get("promotionId") ?? "");
  const kind = String(form.get("kind") ?? "");
  const message = String(form.get("message") ?? "").trim().slice(0, 500);
  if (!id.safeParse(promotionId).success) return { error: "Oferta no válida." };
  if (!(kind in OFFER_REPORT_KINDS)) return { error: "Elige qué ocurre con la oferta." };
  const ip = await ipFingerprint();
  if (!(await hitRateLimit(`offer-report:${ip}`, 10, 24 * 60 * 60 * 1000))) {
    return { error: "Has enviado muchos avisos hoy. Gracias, los revisaremos." };
  }
  const promo = await db.promotion.findUnique({ where: { id: promotionId }, select: { status: true } });
  if (!promo || promo.status === "DRAFT") return { error: "Oferta no válida." };
  const created = await db.offerReport.createMany({ data: [{ promotionId, kind, message, reporterKey: `ip:${ip}` }], skipDuplicates: true });
  return {
    ok: created.count > 0 ? "Gracias por avisar. Revisaremos la oferta lo antes posible." : "Ya nos habías avisado de esta oferta. ¡Gracias!",
    nonce: Date.now(),
  };
}
