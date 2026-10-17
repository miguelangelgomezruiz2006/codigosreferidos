import { describe, expect, it } from "vitest";
import { FILTER_GROUPS, knownOutlayCents, matchesFilters, type FilterablePromo } from "./site";

type P = FilterablePromo & { name: string; bonus: number };
const ofertas: P[] = [
  { name: "BBVA", bonus: 5000, effort: "SPEND", rewardType: "CASHBACK", requiredCents: null, entity: { category: "BANCO" } },
  { name: "Openbank", bonus: 7000, effort: "DEPOSIT", rewardType: "CASH", requiredCents: 7000, entity: { category: "BANCO" } },
  { name: "MyInvestor", bonus: 2500, effort: "DEPOSIT", rewardType: "CASH", requiredCents: 100000, entity: { category: "BROKER" } },
  { name: "Mintos", bonus: 5000, effort: "INVEST", rewardType: "CASH", requiredCents: 100000, entity: { category: "INVERSION" } },
  { name: "Robinhood", bonus: 1000, effort: "DEPOSIT", rewardType: "CRYPTO", requiredCents: 1000, entity: { category: "BROKER" } },
  { name: "Kraken", bonus: 3000, effort: "INVEST", rewardType: "CASH", requiredCents: 20000, entity: { category: "INVERSION" } },
];
const names = (f: Parameters<typeof matchesFilters>[1]) => ofertas.filter((o) => matchesFilters(o, f)).map((o) => o.name);

describe("filtros con datos reales", () => {
  it("sin invertir excluye Mintos y Kraken", () => expect(names({ inversion: "sin-invertir" })).toEqual(["BBVA", "Openbank", "MyInvestor", "Robinhood"]));
  it("hasta 100 € no incluye BBVA (importe no indicado)", () => expect(names({ dinero: "hasta-100" })).toEqual(["Openbank", "Robinhood"]));
  it("sin ingreso inicial: ninguna", () => expect(names({ dinero: "sin-ingreso" })).toEqual([]));
  it("en efectivo", () => expect(names({ premio: "efectivo" })).toEqual(["Openbank", "MyInvestor", "Mintos", "Kraken"]));
  it("filtros combinados: sin invertir + efectivo + hasta 1.000 €", () =>
    expect(names({ inversion: "sin-invertir", premio: "efectivo", dinero: "hasta-1000" })).toEqual(["Openbank", "MyInvestor"]));
  it("tipo de entidad", () => expect(names({ cat: "BANCO" })).toEqual(["BBVA", "Openbank"]));
  it("orden por dinero necesario deja al final las que no lo indican", () => {
    const sorted = [...ofertas].sort((a, b) => {
      const ca = knownOutlayCents(a), cb = knownOutlayCents(b);
      if (ca === null && cb === null) return b.bonus - a.bonus;
      if (ca === null) return 1;
      if (cb === null) return -1;
      return ca - cb || b.bonus - a.bonus;
    });
    expect(sorted.map((o) => o.name)).toEqual(["Robinhood", "Openbank", "Kraken", "Mintos", "MyInvestor", "BBVA"]);
  });
  it("todos los grupos tienen opción por defecto", () => expect(Object.values(FILTER_GROUPS).every((g) => g.all.length > 0)).toBe(true));
});
