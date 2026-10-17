import { describe, expect, it } from "vitest";
import { allowedDomains, isAllowedLink, isValidCode, normalizeCode, parseEurosToCents, slugify } from "./validation";

describe("códigos", () => {
  it("acepta códigos normales y quita espacios", () => {
    expect(isValidCode(normalizeCode(" ABC 123 "))).toBe(true);
    expect(isValidCode("juan.perez-2026")).toBe(true);
  });
  it("rechaza códigos vacíos, con símbolos raros o demasiado largos", () => {
    expect(isValidCode("")).toBe(false);
    expect(isValidCode("<script>")).toBe(false);
    expect(isValidCode("A".repeat(41))).toBe(false);
  });
});

describe("enlaces de referido", () => {
  const domains = allowedDomains({ website: "https://www.bbva.es", linkDomains: ["bbva.onelink.me"] });

  it("acepta la web de la entidad y sus subdominios", () => {
    expect(isAllowedLink("https://www.bbva.es/personas/invita.html?c=X", domains)).toBe(true);
    expect(isAllowedLink("https://app.bbva.es/r/X", domains)).toBe(true);
    expect(isAllowedLink("https://bbva.onelink.me/abc", domains)).toBe(true);
  });
  it("rechaza otros dominios, imitaciones y enlaces sin https", () => {
    expect(isAllowedLink("https://bbva.es.estafa.com/x", domains)).toBe(false);
    expect(isAllowedLink("https://fakebbva.es/x", domains)).toBe(false);
    expect(isAllowedLink("http://www.bbva.es/x", domains)).toBe(false);
    expect(isAllowedLink("javascript:alert(1)", domains)).toBe(false);
  });
});

describe("importes", () => {
  it("convierte euros a céntimos sin decimales", () => {
    expect(parseEurosToCents("20")).toBe(2000);
    expect(parseEurosToCents("20,5")).toBe(2050);
    expect(parseEurosToCents("1.000,99 €")).toBe(100099);
    expect(parseEurosToCents("abc")).toBeNull();
  });
});

describe("slugs", () => {
  it("genera direcciones limpias", () => {
    expect(slugify("Cuenta Online Sin Comisiones — BBVA")).toBe("cuenta-online-sin-comisiones-bbva");
    expect(slugify("imagin ñandú")).toBe("imagin-nandu");
  });
});
