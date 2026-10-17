/**
 * Comprobaciones de los códigos que envían los usuarios.
 * El enlace de referido solo se acepta si apunta a la web de la propia entidad,
 * para que nadie pueda colar enlaces a páginas falsas.
 */

export const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,39}$/;

export function normalizeCode(raw: string): string {
  return raw.trim().replace(/\s+/g, "");
}

export function isValidCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}

function hostOf(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Dominios aceptados para los enlaces de una entidad. */
export function allowedDomains(entity: { website: string; linkDomains: string[] }): string[] {
  const list = [hostOf(entity.website), ...entity.linkDomains.map((d) => d.trim().toLowerCase().replace(/^www\./, ""))];
  return [...new Set(list.filter((d): d is string => Boolean(d)))];
}

/** ¿Es un enlace https cuyo dominio es el de la entidad (o un subdominio suyo)? */
export function isAllowedLink(link: string, domains: string[]): boolean {
  const host = hostOf(link);
  if (!host) return false;
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

/** Convierte "20,50" o "20" en céntimos. Devuelve null si no es un importe válido. */
export function parseEurosToCents(raw: string): number | null {
  const s = raw.trim().replace(/\s|€/g, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [int, dec = ""] = s.split(".");
  return Number(int) * 100 + Number(dec.padEnd(2, "0"));
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
