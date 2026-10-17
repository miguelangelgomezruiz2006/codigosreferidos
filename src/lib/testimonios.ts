/**
 * Opiniones de personas que han usado las promociones.
 * Son amigos del propietario de la web, y así se indica en la página.
 * Para añadir una: nombre, texto con sus palabras y `entities` con los slugs de las entidades
 * (los de Administración › Entidades) para que salga también en esas fichas.
 */

export interface Testimonio {
  name: string;
  text: string;
  entities: string[];
}

const ENTITY_NAMES: Record<string, string> = { openbank: "Openbank", bbva: "BBVA", robinhood: "Robinhood" };

export function entityNames(t: Testimonio): string {
  return t.entities.map((e) => ENTITY_NAMES[e] ?? e).join(" y ");
}

export const TESTIMONIOS: Testimonio[] = [
  {
    name: "Guillermo",
    text: "Abrí la cuenta de Openbank y a los 15 días ya tenía los 70 €. Todo perfecto.",
    entities: ["openbank"],
  },
  {
    name: "Nacho",
    text: "Hice Openbank y BBVA, y en menos de un mes ya lo tenía todo.",
    entities: ["openbank", "bbva"],
  },
  {
    name: "Candela",
    text: "Hice Robinhood y Openbank, y todo correcto.",
    entities: ["robinhood", "openbank"],
  },
];

export function testimoniosFor(entitySlug?: string): Testimonio[] {
  return entitySlug ? TESTIMONIOS.filter((t) => t.entities.includes(entitySlug)) : TESTIMONIOS;
}
