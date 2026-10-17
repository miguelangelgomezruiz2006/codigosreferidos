import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { isEligible, pickCode, shouldAutoHide } from "@/lib/rotation";

/** Promociones visibles como activas: estado activo y sin caducar. */
export function activePromoWhere(now = new Date()): Prisma.PromotionWhereInput {
  return { status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
}

export function isPromoActive(p: { status: string; expiresAt: Date | null }, now = new Date()): boolean {
  return p.status === "ACTIVE" && (!p.expiresAt || p.expiresAt > now);
}

export interface RevealedCode {
  id: string;
  code: string | null;
  link: string | null;
  kind: "ADMIN" | "COMMUNITY";
}

/**
 * Asigna un código a un visitante. Si ya tenía uno válido, se le devuelve el
 * mismo (recargar no gasta la rotación). Con `another`, se busca uno distinto.
 * Los códigos de los que esta conexión ya avisó que no funcionan se evitan mientras haya otros.
 */
export async function revealCode(
  promotionId: string,
  visitorId: string,
  another = false,
  reporterKey?: string,
): Promise<RevealedCode | null> {
  return db.$transaction(async (tx) => {
    const promo = await tx.promotion.findUnique({ where: { id: promotionId } });
    if (!promo || !isPromoActive(promo)) return null;

    const codes = await tx.referralCode.findMany({ where: { promotionId, status: "APPROVED" } });
    const assignment = await tx.assignment.findUnique({ where: { promotionId_visitorId: { promotionId, visitorId } } });
    const current = assignment ? codes.find((c) => c.id === assignment.codeId) : undefined;

    if (current && !another && isEligible(current)) {
      return { id: current.id, code: current.code, link: current.link, kind: current.kind };
    }

    const reported = reporterKey
      ? (await tx.codeReport.findMany({ where: { reporterKey, code: { promotionId } }, select: { codeId: true } })).map((r) => r.codeId)
      : [];
    const chosen =
      pickCode(codes, { exclude: new Set([...reported, ...(current ? [current.id] : [])]) }) ??
      pickCode(codes, { exclude: current ? new Set([current.id]) : undefined }) ??
      // Si solo existe el código actual, se vuelve a mostrar ese.
      (current && isEligible(current) ? current : null);
    if (!chosen) return null;

    await tx.assignment.upsert({
      where: { promotionId_visitorId: { promotionId, visitorId } },
      update: { codeId: chosen.id },
      create: { promotionId, visitorId, codeId: chosen.id },
    });
    await tx.referralCode.update({ where: { id: chosen.id }, data: { timesShown: { increment: 1 } } });
    await tx.codeEvent.create({ data: { codeId: chosen.id, promotionId, type: "REVEAL" } });
    return { id: chosen.id, code: chosen.code, link: chosen.link, kind: chosen.kind };
  });
}

/**
 * Registra que el visitante ha copiado el código o abierto el enlace.
 * Un «uso» cuenta una sola vez por visitante y código (para el límite de los códigos del administrador).
 */
export async function registerUse(codeId: string, visitorId: string, type: "COPY" | "OPEN"): Promise<string | null> {
  return db.$transaction(async (tx) => {
    const code = await tx.referralCode.findUnique({ where: { id: codeId }, include: { promotion: true } });
    if (!code || code.status !== "APPROVED" || !isPromoActive(code.promotion)) return null;

    const inserted = await tx.codeUse.createMany({ data: [{ codeId, visitorId }], skipDuplicates: true });
    await tx.referralCode.update({
      where: { id: codeId },
      data: {
        ...(type === "COPY" ? { timesCopied: { increment: 1 } } : { timesOpened: { increment: 1 } }),
        ...(inserted.count > 0 ? { uses: { increment: 1 } } : {}),
      },
    });
    await tx.codeEvent.create({ data: { codeId, promotionId: code.promotionId, type } });
    return type === "OPEN" ? code.link : code.code;
  });
}

export type ReportResult = "ok" | "duplicate" | "not_found";

/** Reporte de «Este código no funciona». Al llegar al umbral, el código de la comunidad se oculta. */
export async function reportCode(
  codeId: string,
  reporterKey: string,
  reason: string,
  threshold: number,
  visitorId?: string,
): Promise<ReportResult> {
  return db.$transaction(async (tx) => {
    const code = await tx.referralCode.findUnique({ where: { id: codeId } });
    if (!code || code.status !== "APPROVED") return "not_found";
    const created = await tx.codeReport.createMany({
      data: [{ codeId, reporterKey, reason: reason.slice(0, 300) }],
      skipDuplicates: true,
    });
    // Quien avisa ya no vuelve a ver este código: al pedir de nuevo le sale otro.
    if (visitorId) await tx.assignment.deleteMany({ where: { codeId, visitorId } });
    if (created.count === 0) return "duplicate";
    const updated = await tx.referralCode.update({ where: { id: codeId }, data: { reportCount: { increment: 1 } } });
    if (shouldAutoHide(updated.kind, updated.reportCount, threshold)) {
      await tx.referralCode.update({ where: { id: codeId }, data: { status: "HIDDEN" } });
      await tx.assignment.deleteMany({ where: { codeId } });
    }
    return "ok";
  });
}
