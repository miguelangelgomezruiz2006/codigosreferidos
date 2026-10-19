import { describe, expect, it } from "vitest";
import { pickAnother, pickCode, shouldAutoHide, type RotationCandidate } from "./rotation";

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

describe("«Dame otro código»", () => {
  // Simula a alguien que pulsa el botón una y otra vez, como hace la ficha.
  function press(codes: RotationCandidate[], times: number) {
    let seen: string[] = [];
    let current: RotationCandidate | undefined;
    const shown: string[] = [];
    for (let i = 0; i < times; i++) {
      const next = pickAnother(codes, { current, seen, random: () => 0 });
      if (!next) break;
      seen = seen.includes(next.id) ? [next.id] : [...seen, next.id];
      current = next;
      shown.push(next.id);
    }
    return shown;
  }

  it("recorre todos los códigos del administrador en orden, sin rebotar entre los dos primeros", () => {
    const codes = [0, 1, 2, 3, 4].map((priority) => code({ kind: "ADMIN", maxUses: 2, priority }));
    expect(press(codes, 5)).toEqual(codes.map((c) => c.id));
  });

  it("después de los del administrador pasa a los de la comunidad y luego vuelve a empezar", () => {
    const a = code({ kind: "ADMIN", priority: 0 });
    const b = code({ kind: "ADMIN", priority: 1 });
    const c1 = code({});
    const c2 = code({});
    expect(press([a, b, c1, c2], 6)).toEqual([a.id, b.id, c1.id, c2.id, a.id, b.id]);
  });

  it("se salta los agotados y los que esa persona dijo que no funcionan", () => {
    const a = code({ kind: "ADMIN", priority: 0 });
    const spent = code({ kind: "ADMIN", priority: 1, maxUses: 2, uses: 2 });
    const reported = code({ kind: "ADMIN", priority: 2 });
    const d = code({ kind: "ADMIN", priority: 3 });
    const all = [a, spent, reported, d];
    expect(pickAnother(all, { current: a, seen: [a.id], reported: [reported.id] })?.id).toBe(d.id);
  });

  it("si solo hay un código, lo vuelve a mostrar", () => {
    const only = code({ kind: "ADMIN" });
    expect(pickAnother([only], { current: only, seen: [only.id] })?.id).toBe(only.id);
  });
});

describe("turnos entre los códigos del administrador", () => {
  it("cada persona nueva recibe el siguiente al último mostrado y al final vuelve a empezar", () => {
    const codes = [0, 1, 2].map((priority) => code({ kind: "ADMIN", priority }));
    let last: string | undefined;
    const shown: string[] = [];
    for (let i = 0; i < 5; i++) {
      const next = pickAnother(codes, { lastShown: last })!;
      shown.push(next.id);
      last = next.id;
    }
    const [a, b, c] = codes.map((x) => x.id);
    expect(shown).toEqual([a, b, c, a, b]);
  });

  it("se salta los agotados al buscar el siguiente", () => {
    const a = code({ kind: "ADMIN", priority: 0 });
    const spent = code({ kind: "ADMIN", priority: 1, maxUses: 1, uses: 1 });
    const c = code({ kind: "ADMIN", priority: 2 });
    expect(pickCode([a, spent, c], { after: a.id })?.id).toBe(c.id);
  });

  it("sin usos máximos (ilimitados) nunca se agotan y siguen rotando", () => {
    const a = code({ kind: "ADMIN", priority: 0, uses: 999 });
    const b = code({ kind: "ADMIN", priority: 1, uses: 999 });
    expect(pickCode([a, b], { after: a.id })?.id).toBe(b.id);
    expect(pickCode([a, b], { after: b.id })?.id).toBe(a.id);
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
