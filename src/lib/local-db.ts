/**
 * ¿Apunta esta dirección a una base de datos de este mismo ordenador?
 * Se usa para impedir que el script de datos de ejemplo toque una base real.
 */
export function isLocalDatabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
  } catch {
    return false;
  }
}
