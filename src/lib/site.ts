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

/** Etiqueta corta del tipo de requisito, para las tarjetas. */
export const EFFORT_TAGS = {
  NONE: "Solo abrir cuenta",
  SPEND: "Con compras",
  DEPOSIT: "Con depósito",
  INVEST: "Con inversión",
} as const;

/** Lo que el explorador de ofertas necesita de cada oferta para filtrar y ordenar. */
export interface FilterablePromo {
  effort: EffortKey;
  rewardType: RewardKey;
  /** 0 si no hay recompensa confirmada para el nuevo cliente. */
  bonusCents: number;
  requiredCents: number | null;
  entity: { category: CategoryKey };
}

/** Dinero mínimo conocido: 0 si solo hay que abrir la cuenta; null si las condiciones no lo dicen. */
export function knownOutlayCents(p: Pick<FilterablePromo, "effort" | "requiredCents">): number | null {
  if (p.requiredCents != null) return p.requiredCents;
  return p.effort === "NONE" ? 0 : null;
}

const upTo = (limit: number) => (p: FilterablePromo) => {
  const c = knownOutlayCents(p);
  // Si no se sabe cuánto piden, no se puede decir que esté por debajo del límite.
  return c !== null && c <= limit;
};

/**
 * Filtros en grupos combinables: dentro de un grupo se elige una opción; entre grupos se suman.
 * Solo usan los datos guardados de cada oferta: si falta un dato, la oferta no cumple el filtro.
 */
export const FILTER_GROUPS = {
  inversion: {
    label: "Inversión",
    all: "Con o sin inversión",
    options: {
      "sin-invertir": { label: "Sin invertir", test: (p: FilterablePromo) => p.effort !== "INVEST" },
      "con-inversion": { label: "Requiere inversión", test: (p: FilterablePromo) => p.effort === "INVEST" },
    },
  },
  dinero: {
    label: "Dinero necesario",
    all: "Cualquier importe",
    options: {
      "sin-ingreso": { label: "Sin ingreso inicial", test: upTo(0) },
      "hasta-100": { label: "Hasta 100 €", test: upTo(10000) },
      "hasta-1000": { label: "Hasta 1.000 €", test: upTo(100000) },
    },
  },
  premio: {
    label: "Recompensa",
    all: "Cualquier recompensa",
    options: {
      efectivo: { label: "En efectivo", test: (p: FilterablePromo) => p.bonusCents > 0 && p.rewardType === "CASH" },
      cashback: { label: "Cashback", test: (p: FilterablePromo) => p.bonusCents > 0 && p.rewardType === "CASHBACK" },
      cripto: { label: "En cripto", test: (p: FilterablePromo) => p.bonusCents > 0 && p.rewardType === "CRYPTO" },
    },
  },
  cat: {
    label: "Tipo de entidad",
    all: "Bancos y apps",
    options: Object.fromEntries(
      Object.entries(CATEGORY_LABELS).map(([key, label]) => [key, { label, test: (p: FilterablePromo) => p.entity.category === key }]),
    ) as Record<CategoryKey, { label: string; test: (p: FilterablePromo) => boolean }>,
  },
} as const;

export type FilterGroupKey = keyof typeof FILTER_GROUPS;
export type FilterState = Partial<Record<FilterGroupKey, string>>;

export function isFilterValue(group: FilterGroupKey, v: string | undefined): v is string {
  return !!v && v in FILTER_GROUPS[group].options;
}

/** ¿Cumple la oferta todos los filtros activos? Se puede excluir un grupo para calcular cuántas quedarían al cambiarlo. */
export function matchesFilters(p: FilterablePromo, filters: FilterState, except?: FilterGroupKey): boolean {
  return (Object.keys(FILTER_GROUPS) as FilterGroupKey[]).every((g) => {
    const v = filters[g];
    if (g === except || !v) return true;
    const option = (FILTER_GROUPS[g].options as Record<string, { test: (p: FilterablePromo) => boolean }>)[v];
    return option ? option.test(p) : true;
  });
}

export const SORT_OPTIONS = {
  bono: "Más recompensa",
  capital: "Menos dinero",
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
