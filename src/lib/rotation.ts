/**
 * Reglas de rotación de códigos (sin base de datos, para poder probarlas).
 *
 * 1. Primero los códigos del administrador que aún no han llegado a su límite
 *    de usos, en orden de prioridad (número menor = antes).
 * 2. Cuando se agotan, el código de la comunidad que menos veces se ha mostrado.
 *    Si hay empate, uno al azar entre los empatados, para que todos reciban visitas.
 * Solo cuentan los códigos aprobados.
 */

export interface RotationCandidate {
  id: string;
  kind: "ADMIN" | "COMMUNITY";
  status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  maxUses: number | null;
  uses: number;
  priority: number;
  timesShown: number;
  createdAt: Date;
}

export function adminHasUsesLeft(c: Pick<RotationCandidate, "maxUses" | "uses">): boolean {
  return c.maxUses === null || c.uses < c.maxUses;
}

/** ¿Puede este código mostrarse ahora mismo? */
export function isEligible(c: RotationCandidate): boolean {
  if (c.status !== "APPROVED") return false;
  return c.kind === "COMMUNITY" || adminHasUsesLeft(c);
}

/**
 * Elige el código que se muestra. `exclude` sirve para «Dame otro código».
 * `random` devuelve un número entre 0 y 1 (se puede fijar en los tests).
 */
export function pickCode<T extends RotationCandidate>(
  candidates: T[],
  options: { exclude?: ReadonlySet<string>; random?: () => number } = {},
): T | null {
  const { exclude, random = Math.random } = options;
  const eligible = candidates.filter((c) => isEligible(c) && !exclude?.has(c.id));

  const admin = eligible
    .filter((c) => c.kind === "ADMIN")
    .sort((a, b) => a.priority - b.priority || a.createdAt.getTime() - b.createdAt.getTime());
  if (admin.length > 0) return admin[0];

  const community = eligible.filter((c) => c.kind === "COMMUNITY");
  if (community.length === 0) return null;
  const minShown = Math.min(...community.map((c) => c.timesShown));
  const tied = community.filter((c) => c.timesShown === minShown);
  return tied[Math.min(tied.length - 1, Math.floor(random() * tied.length))];
}

/**
 * «Dame otro código»: el siguiente que esta persona aún no ha visto, en el orden de
 * la rotación (primero los del administrador por prioridad, luego la comunidad).
 * Cuando ya los ha visto todos, vuelve a empezar por el primero. Los que ha avisado
 * que no funcionan se evitan mientras haya otros.
 */
export function pickAnother<T extends RotationCandidate>(
  candidates: T[],
  options: { current?: T; seen?: readonly string[]; reported?: readonly string[]; random?: () => number } = {},
): T | null {
  const { current, seen = [], reported = [], random } = options;
  const currentIds = current ? [current.id] : [];
  return (
    pickCode(candidates, { exclude: new Set([...seen, ...reported, ...currentIds]), random }) ??
    pickCode(candidates, { exclude: new Set([...reported, ...currentIds]), random }) ??
    pickCode(candidates, { exclude: new Set(currentIds), random }) ??
    // Si solo existe el código actual, se vuelve a mostrar ese.
    (current && isEligible(current) ? current : null)
  );
}

/** ¿Debe ocultarse un código de la comunidad tras un nuevo reporte? */
export function shouldAutoHide(kind: RotationCandidate["kind"], reportCount: number, threshold: number): boolean {
  return kind === "COMMUNITY" && threshold > 0 && reportCount >= threshold;
}
