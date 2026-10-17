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
