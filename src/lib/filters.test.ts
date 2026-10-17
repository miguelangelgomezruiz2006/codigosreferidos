import { describe, expect, it } from "vitest";
import { FILTER_GROUPS, knownOutlayCents, matchesFilters, type FilterablePromo } from "./site";

type P = FilterablePromo & { name: string };
const ofertas: P[] = [
  { name: "BBVA", bonusCents: 5000, effort: "SPEND", rewardType: "CASHBACK", requiredCents: null, entity: { category: "BANCO" } },
  { name: "Openbank", bonusCents: 7000, effort: "DEPOSIT", rewardType: "CASH", requiredCents: 7000, entity: { category: "BANCO" } },
  { name: "MyInvestor", bonusCents: 2500, effort: "DEPOSIT", rewardType: "CASH", requiredCents: 100000, entity: { category: "BROKER" } },
  { name: "Mintos", bonusCents: 5000, effort: "INVEST", rewardType: "CASH", requiredCents: 100000, entity: { category: "INVERSION" } },
  { name: "Robinhood", bonusCents: 1000, effort: "DEPOSIT", rewardType: "CRYPTO", requiredCents: 1000, entity: { category: "BROKER" } },
  { name: "Revolut", bonusCents: 0, effort: "SPEND", rewardType: "NONE", requiredCents: null, entity: { category: "NEOBANCO" } },
  { name: "Kraken", bonusCents: 3000, effort: "INVEST", rewardType: "CASH", requiredCents: 20000, entity: { category: "INVERSION" } },
];
const names = (f: Parameters<typeof matchesFilters>[1]) => ofertas.filter((o) => matchesFilters(o, f)).map((o) => o.name);

describe("filtros con datos reales", () => {
  it("sin invertir excluye Mintos y Kraken", () =>
    expect(names({ inversion: "sin-invertir" })).toEqual(["BBVA", "Openbank", "MyInvestor", "Robinhood", "Revolut"]));
  it("una oferta sin recompensa para el invitado no sale como «en efectivo»", () => expect(names({ premio: "efectivo" }).includes("Revolut")).toBe(false));
  it("hasta 100 € no incluye BBVA (importe no indicado)", () => expect(names({ dinero: "hasta-100" })).toEqual(["Openbank", "Robinhood"]));
  it("sin ingreso inicial: ninguna", () => expect(names({ dinero: "sin-ingreso" })).toEqual([]));
  it("en efectivo", () => expect(names({ premio: "efectivo" })).toEqual(["Openbank", "MyInvestor", "Mintos", "Kraken"]));
  it("filtros combinados: sin invertir + efectivo + hasta 1.000 €", () =>
    expect(names({ inversion: "sin-invertir", premio: "efectivo", dinero: "hasta-1000" })).toEqual(["Openbank", "MyInvestor"]));
  it("tipo de entidad", () => expect(names({ cat: "BANCO" })).toEqual(["BBVA", "Openbank"]));
  it("orden por dinero necesario deja al final las que no lo indican", () => {
    const sorted = [...ofertas].sort((a, b) => {
      const ca = knownOutlayCents(a), cb = knownOutlayCents(b);
      if (ca === null && cb === null) return b.bonusCents - a.bonusCents;
      if (ca === null) return 1;
      if (cb === null) return -1;
      return ca - cb || b.bonusCents - a.bonusCents;
    });
    expect(sorted.map((o) => o.name)).toEqual(["Robinhood", "Openbank", "Kraken", "Mintos", "MyInvestor", "BBVA", "Revolut"]);
  });
  it("todos los grupos tienen opción por defecto", () => expect(Object.values(FILTER_GROUPS).every((g) => g.all.length > 0)).toBe(true));
});
