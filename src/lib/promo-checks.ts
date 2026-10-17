/**
 * Comprobaciones automáticas de los datos de una promoción. No consultan internet ni la base de datos:
 * revisan que los campos guardados sean coherentes entre sí. Se muestran en Administración › Promociones.
 */

export type CheckLevel = "error" | "aviso";

export interface CheckIssue {
  level: CheckLevel;
  message: string;
}

export interface CheckablePromo {
  status: "DRAFT" | "ACTIVE" | "EXPIRED";
  bonusText: string;
  bonusCents: number;
  expiresAt: Date | null;
  termsUrl: string;
  steps: string[];
  requirementText: string;
  effort: "NONE" | "SPEND" | "DEPOSIT" | "INVEST";
  requiredCents: number | null;
  risk: "NONE" | "INVESTMENT" | "CRYPTO";
  lastReviewedAt: Date | null;
  /** Códigos aprobados disponibles (opcional). */
  approvedCodes?: number;
}

/** Días tras los que una revisión se considera antigua. */
export const REVIEW_MAX_DAYS = 30;

/** Primer importe en euros que aparece en un texto: «70 € netos» → 7000. Null si no hay. */
export function firstEuroAmountCents(text: string): number | null {
  const m = text.match(/(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?\s?€/);
  if (!m) return null;
  const euros = Number(m[1].replace(/\./g, ""));
  const cents = m[2] ? Number(m[2].padEnd(2, "0")) : 0;
  return euros * 100 + cents;
}

export function checkPromotion(p: CheckablePromo, now = new Date()): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const add = (level: CheckLevel, message: string) => issues.push({ level, message });

  if (!Number.isInteger(p.bonusCents) || p.bonusCents < 0) add("error", "El importe de la recompensa no es válido.");
  else if (p.bonusCents === 0) add("aviso", "No hay recompensa confirmada para el nuevo cliente: el texto de la tarjeta debe decirlo claramente.");
  const textAmount = firstEuroAmountCents(p.bonusText);
  if (textAmount !== null && p.bonusCents > 0 && textAmount !== p.bonusCents) {
    add("error", `El texto dice ${textAmount / 100} € pero el importe guardado es ${p.bonusCents / 100} €.`);
  }

  if (p.expiresAt && Number.isNaN(p.expiresAt.getTime())) add("error", "La fecha de caducidad no es válida.");
  else if (p.status === "ACTIVE" && p.expiresAt && p.expiresAt <= now) {
    add("aviso", "Ya ha caducado por fecha: no se muestra. Márcala como caducada.");
  }

  if (!/^https:\/\/[^\s]+\.[^\s]+/.test(p.termsUrl)) add("error", "El enlace a las condiciones oficiales no es una dirección https válida.");
  if (p.steps.length === 0) add("error", "No tiene pasos: la ficha no explicará qué hacer.");
  if (!p.requirementText.trim()) add("aviso", "Falta el requisito principal que se ve en la tarjeta.");

  if (p.effort === "NONE" && p.requiredCents && p.requiredCents > 0) {
    add("error", "Dice «solo abrir cuenta» pero tiene un desembolso mínimo: revisa el tipo de requisito.");
  }
  if (p.effort !== "NONE" && p.requiredCents == null) {
    add("aviso", "Falta el dinero necesario: aparecerá «No indicado» y no entrará en los filtros por importe.");
  }
  if (p.requiredCents != null && p.requiredCents < 0) add("error", "El desembolso mínimo no puede ser negativo.");

  if (p.effort === "INVEST" && p.risk === "NONE") {
    add("aviso", "Pide invertir: la web mostrará igualmente que el capital puede perder valor.");
  }

  if (!p.lastReviewedAt) add("aviso", "Sin revisar: se muestra como «Pendiente de revisión».");
  else if ((now.getTime() - p.lastReviewedAt.getTime()) / 86_400_000 > REVIEW_MAX_DAYS) {
    add("aviso", `Revisada hace más de ${REVIEW_MAX_DAYS} días.`);
  }

  if (p.status === "ACTIVE" && p.approvedCodes === 0) add("error", "Está activa pero no tiene ningún código aprobado.");

  return issues;
}
