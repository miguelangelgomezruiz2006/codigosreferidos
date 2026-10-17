const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });
const short = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Madrid" });

export function fmtEuros(cents: number): string {
  return eur.format(cents / 100).replace(/,00(?=\s?€)/, "");
}

export function fmtDate(d: Date): string {
  return date.format(d);
}

export function fmtShortDate(d: Date): string {
  return short.format(d);
}

/** Valor para un <input type="date"> a partir de una fecha. */
export function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function daysLeft(d: Date, now = new Date()): number {
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}
