import { describe, expect, it } from "vitest";
import { pickCode, shouldAutoHide, type RotationCandidate } from "./rotation";

let n = 0;
function code(overrides: Partial<RotationCandidate>): RotationCandidate {
  n += 1;
  return {
    id: `c${n}`,
    kind: "COMMUNITY",
    status: "APPROVED",
    maxUses: null,
    uses: 0,
    priority: 0,
    timesShown: 0,
    createdAt: new Date(2026, 0, n),
    ...overrides,
  };
}

describe("rotación de códigos", () => {
  it("muestra primero el código del administrador aunque la comunidad tenga menos visitas", () => {
    const admin = code({ kind: "ADMIN", maxUses: 10, uses: 3, timesShown: 500 });
    const community = code({ timesShown: 0 });
    expect(pickCode([community, admin])?.id).toBe(admin.id);
  });

  it("respeta la prioridad entre códigos del administrador", () => {
    const second = code({ kind: "ADMIN", priority: 2 });
    const first = code({ kind: "ADMIN", priority: 1 });
    expect(pickCode([second, first])?.id).toBe(first.id);
  });

  it("pasa a la comunidad cuando el administrador agota su límite", () => {
    const admin = code({ kind: "ADMIN", maxUses: 5, uses: 5 });
    const community = code({});
    expect(pickCode([admin, community])?.id).toBe(community.id);
  });

  it("un código del administrador sin límite nunca se agota", () => {
    const admin = code({ kind: "ADMIN", maxUses: null, uses: 100000 });
    expect(pickCode([admin, code({})])?.id).toBe(admin.id);
  });

  it("entre la comunidad elige el que menos veces se ha mostrado", () => {
    const a = code({ timesShown: 7 });
    const b = code({ timesShown: 2 });
    const c = code({ timesShown: 4 });
    expect(pickCode([a, b, c])?.id).toBe(b.id);
  });

  it("si hay empate, reparte al azar entre los empatados", () => {
    const a = code({ timesShown: 1 });
    const b = code({ timesShown: 1 });
    const c = code({ timesShown: 9 });
    expect(pickCode([a, b, c], { random: () => 0 })?.id).toBe(a.id);
    expect(pickCode([a, b, c], { random: () => 0.99 })?.id).toBe(b.id);
  });

  it("reparto justo: simulando muchas visitas, todos reciben casi las mismas", () => {
    const pool = [code({}), code({}), code({}), code({})];
    for (let i = 0; i < 400; i++) pickCode(pool)!.timesShown += 1;
    const shown = pool.map((c) => c.timesShown);
    expect(Math.max(...shown) - Math.min(...shown)).toBeLessThanOrEqual(1);
  });

  it("ignora códigos pendientes, rechazados u ocultos", () => {
    const list = [code({ status: "PENDING" }), code({ status: "REJECTED" }), code({ status: "HIDDEN" })];
    expect(pickCode(list)).toBeNull();
  });

  it("«Dame otro código» excluye el actual", () => {
    const admin = code({ kind: "ADMIN" });
    const community = code({});
    expect(pickCode([admin, community], { exclude: new Set([admin.id]) })?.id).toBe(community.id);
  });

  it("devuelve vacío si no hay ningún código disponible", () => {
    expect(pickCode([])).toBeNull();
  });
});

describe("ocultado automático por reportes", () => {
  it("oculta un código de la comunidad al llegar al umbral", () => {
    expect(shouldAutoHide("COMMUNITY", 2, 3)).toBe(false);
    expect(shouldAutoHide("COMMUNITY", 3, 3)).toBe(true);
  });

  it("nunca oculta automáticamente los códigos del administrador", () => {
    expect(shouldAutoHide("ADMIN", 50, 3)).toBe(false);
  });
});
