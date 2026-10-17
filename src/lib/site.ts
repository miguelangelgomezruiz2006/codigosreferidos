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
  efectivo: "Pago en efectivo",
} as const;

export type EffortFilterKey = keyof typeof EFFORT_FILTERS;

export function isEffortFilter(v: string | undefined): v is EffortFilterKey {
  return !!v && v in EFFORT_FILTERS;
}
