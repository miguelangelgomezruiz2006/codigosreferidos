// Nombre provisional de la web: cámbialo aquí y se actualiza en todas las páginas.
export const SITE_NAME = "Bonificados";
export const SITE_TAGLINE = "Promociones de bancos y códigos de invitación en España";

export const CATEGORY_LABELS = {
  BANCO: "Bancos",
  NEOBANCO: "Neobancos",
  BROKER: "Brokers",
  INVERSION: "Inversión",
} as const;

export type CategoryKey = keyof typeof CATEGORY_LABELS;

export function isCategory(v: string | undefined): v is CategoryKey {
  return !!v && v in CATEGORY_LABELS;
}

/** Dirección pública de la web (para Google, enlaces compartidos y emails). */
export function siteUrl(path = ""): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null;
  const base = (process.env.AUTH_URL || process.env.SITE_URL || vercel || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

/** Qué hay que hacer para cobrar (etiqueta corta de las tarjetas). */
export const EFFORT_LABELS = {
  NONE: "Solo abrir cuenta",
  SPEND: "Usar la tarjeta",
  DEPOSIT: "Ingresar dinero",
  INVEST: "Invertir",
} as const;

export const REWARD_LABELS = {
  CASH: "En efectivo",
  CASHBACK: "Cashback",
  CRYPTO: "En cripto",
} as const;

export type EffortKey = keyof typeof EFFORT_LABELS;
export type RewardKey = keyof typeof REWARD_LABELS;

/** Filtros de la portada por esfuerzo y tipo de premio. */
export const EFFORT_FILTERS = {
  "sin-invertir": "Sin invertir",
  "sin-ingreso": "Sin ingreso inicial",
  efectivo: "Premio en efectivo",
  cripto: "Premio en cripto",
  compras: "Con compras",
} as const;

export type EffortFilterKey = keyof typeof EFFORT_FILTERS;

export function isEffortFilter(v: string | undefined): v is EffortFilterKey {
  return !!v && v in EFFORT_FILTERS;
}

/** Datos mínimos para decidir si una oferta cumple un filtro. Solo se usan datos guardados: si falta, no cumple. */
export interface FilterablePromo {
  effort: EffortKey;
  rewardType: RewardKey;
}

export const EFFORT_FILTER_TEST: Record<EffortFilterKey, (p: FilterablePromo) => boolean> = {
  "sin-invertir": (p) => p.effort !== "INVEST",
  // Solo las que únicamente piden abrir la cuenta. Las de «usar la tarjeta» pueden necesitar saldo, así que no cuentan.
  "sin-ingreso": (p) => p.effort === "NONE",
  efectivo: (p) => p.rewardType === "CASH",
  cripto: (p) => p.rewardType === "CRYPTO",
  compras: (p) => p.effort === "SPEND",
};

export const SORT_OPTIONS = {
  bono: "Mayor recompensa",
  facil: "Menos pasos",
  revisadas: "Revisadas hace menos",
  caducan: "Acaban antes",
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export function isSortKey(v: string | undefined): v is SortKey {
  return !!v && v in SORT_OPTIONS;
}

/** Estado visible de una oferta: caducada, acaba pronto, revisada o pendiente de verificar. */
export type OfferStatus =
  | { kind: "expired" }
  | { kind: "soon"; days: number }
  | { kind: "reviewed"; date: Date }
  | { kind: "unverified" };

export function offerStatus(p: { expiresAt: Date | null; lastReviewedAt?: Date | null; expired?: boolean }, now = new Date()): OfferStatus {
  if (p.expired || (p.expiresAt && p.expiresAt <= now)) return { kind: "expired" };
  if (p.expiresAt) {
    const days = Math.ceil((p.expiresAt.getTime() - now.getTime()) / 86_400_000);
    if (days <= 7) return { kind: "soon", days };
  }
  if (p.lastReviewedAt) return { kind: "reviewed", date: p.lastReviewedAt };
  return { kind: "unverified" };
}

/** Motivos para avisar de que una oferta está mal (formulario de la ficha y Moderación). */
export const OFFER_REPORT_KINDS = {
  caducada: "La oferta ha terminado",
  importe: "El importe o los requisitos han cambiado",
  enlace: "El enlace o las condiciones no funcionan",
  otro: "Otro problema",
} as const;
