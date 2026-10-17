import { describe, expect, it } from "vitest";
import { checkPromotion, firstEuroAmountCents, type CheckablePromo } from "./promo-checks";

const now = new Date("2026-10-17T12:00:00Z");

function promo(overrides: Partial<CheckablePromo> = {}): CheckablePromo {
  return {
    status: "ACTIVE",
    bonusText: "70 € netos en tres pagos",
    bonusCents: 7000,
    expiresAt: new Date("2026-10-29T21:59:59Z"),
    termsUrl: "https://www.openbank.es/condiciones.pdf",
    steps: ["Abre la cuenta", "Ingresa 70 €"],
    requirementText: "Ingresar 70 €",
    effort: "DEPOSIT",
    requiredCents: 7000,
    risk: "NONE",
    lastReviewedAt: new Date("2026-10-15T10:00:00Z"),
    approvedCodes: 1,
    ...overrides,
  };
}

const messages = (p: CheckablePromo) => checkPromotion(p, now).map((i) => i.message);

describe("importe en el texto", () => {
  it("lee euros con decimales y miles", () => {
    expect(firstEuroAmountCents("70 € al abrir")).toBe(7000);
    expect(firstEuroAmountCents("25,50 € brutos")).toBe(2550);
    expect(firstEuroAmountCents("Invertir 1.000 €")).toBe(100000);
    expect(firstEuroAmountCents("Al menos 10 $")).toBeNull();
  });
});

describe("comprobaciones de promociones", () => {
  it("una promoción correcta no tiene avisos", () => {
    expect(checkPromotion(promo(), now)).toEqual([]);
  });

  it("detecta que el texto y el importe no coinciden", () => {
    expect(messages(promo({ bonusText: "50 € al abrir cuenta" })).some((m) => m.includes("50 €"))).toBe(true);
  });

  it("detecta ofertas sin recompensa para el invitado, importes inválidos y enlaces no https", () => {
    expect(messages(promo({ bonusText: "Sin bono confirmado para ti", bonusCents: 0, rewardType: "NONE" })).some((x) => x.includes("No hay recompensa"))).toBe(true);
    expect(messages(promo({ bonusText: "Cripto de regalo", bonusCents: 0, rewardType: "CRYPTO" })).some((x) => x.includes("importe en euros"))).toBe(true);
    expect(messages(promo({ bonusText: "Primera transferencia sin comisiones", bonusCents: 0, rewardType: "DISCOUNT" })).some((x) => x.includes("importe"))).toBe(false);
    const m = messages(promo({ bonusCents: -5, termsUrl: "http://ejemplo.com" }));
    expect(m.some((x) => x.includes("no es válido"))).toBe(true);
    expect(m.some((x) => x.includes("https"))).toBe(true);
  });

  it("avisa de las activas ya caducadas por fecha", () => {
    expect(messages(promo({ expiresAt: new Date("2026-10-01T00:00:00Z") })).some((m) => m.includes("caducado"))).toBe(true);
  });

  it("marca como incompatible «solo abrir cuenta» con desembolso", () => {
    expect(messages(promo({ effort: "NONE", requiredCents: 5000 })).some((m) => m.includes("solo abrir cuenta"))).toBe(true);
  });

  it("avisa si falta el dinero necesario o la revisión", () => {
    const m = messages(promo({ requiredCents: null, lastReviewedAt: null }));
    expect(m.some((x) => x.includes("No indicado"))).toBe(true);
    expect(m.some((x) => x.includes("Sin revisar"))).toBe(true);
  });

  it("avisa de revisiones antiguas y de activas sin códigos", () => {
    const m = messages(promo({ lastReviewedAt: new Date("2026-08-01T00:00:00Z"), approvedCodes: 0 }));
    expect(m.some((x) => x.includes("más de 30 días"))).toBe(true);
    expect(m.some((x) => x.includes("ningún código"))).toBe(true);
  });
});
