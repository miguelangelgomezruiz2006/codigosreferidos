/**
 * Opiniones de personas que han usado las promociones.
 * Las han enviado al propietario personas que han usado las ofertas.
 * Para añadir una: nombre, texto con sus palabras y `entities` con los slugs de las entidades
 * (los de Administración › Entidades) para que salga también en esas fichas.
 */

/**
 * Qué dice la persona sobre la recompensa, según sus propias palabras:
 * «cobrado» si dice haberla recibido; «pendiente» si dice haber cumplido los pasos pero aún no la ha recibido.
 * No lo comprobamos con la entidad.
 */
export type TestimonioEstado = "cobrado" | "pendiente";

export interface Testimonio {
  name: string;
  text: string;
  entities: string[];
  estado: TestimonioEstado;
}

const ENTITY_NAMES: Record<string, string> = {
  openbank: "Openbank",
  bbva: "BBVA",
  robinhood: "Robinhood",
  kraken: "Kraken",
  myinvestor: "MyInvestor",
  etoro: "eToro",
  revolut: "Revolut",
};

/** «Openbank», «Openbank y BBVA», «Kraken, MyInvestor y eToro». */
export function entityNames(t: Testimonio): string {
  const names = t.entities.map((e) => ENTITY_NAMES[e] ?? e);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}` : names.join("");
}

export const TESTIMONIOS: Testimonio[] = [
  {
    name: "Guillermo",
    text: "Abrí la cuenta de Openbank y a los 15 días ya tenía los 70 €. Todo perfecto.",
    entities: ["openbank"],
    estado: "cobrado",
  },
  {
    name: "Nacho",
    text: "Hice Openbank y BBVA, y en menos de un mes ya lo tenía todo.",
    entities: ["openbank", "bbva"],
    estado: "cobrado",
  },
  {
    name: "Candela",
    text: "Hice Robinhood y Openbank, y todo correcto.",
    entities: ["robinhood", "openbank"],
    estado: "cobrado",
  },
  {
    name: "Paco",
    text: "He usado Kraken, MyInvestor y eToro, y en los tres me ha funcionado.",
    entities: ["kraken", "myinvestor", "etoro"],
    estado: "cobrado",
  },
  {
    name: "Juan",
    text: "Me encanta la app de Robinhood, y de paso me he llevado 10 €.",
    entities: ["robinhood"],
    estado: "cobrado",
  },
  {
    name: "Ramón",
    text: "Revolut va muy bien. Ya he cumplido los pasos y la recompensa me llega en unos días.",
    entities: ["revolut"],
    estado: "pendiente",
  },
  {
    name: "Luisa",
    text: "MyInvestor y Kraken son lo que más nos gusta a los criptobros: para mí, las mejores comisiones. Y encima, el bono.",
    entities: ["myinvestor", "kraken"],
    estado: "cobrado",
  },
];

export function testimoniosFor(entitySlug?: string): Testimonio[] {
  return entitySlug ? TESTIMONIOS.filter((t) => t.entities.includes(entitySlug)) : TESTIMONIOS;
}
