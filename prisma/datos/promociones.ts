/**
 * Promociones reales (recopiladas el 17/10/2026 de fuentes públicas; importes de BBVA,
 * Mintos, Robinhood y Revolut confirmados por el administrador). No borra nada: crea o actualiza una promoción por
 * entidad (Kraken y eToro añadidas el 17/10/2026). Se puede repetir en local y en producción.
 *
 * `lastReviewedAt` se deja vacío a propósito: la fecha de revisión la marca el
 * administrador desde el panel cuando haya comprobado las condiciones oficiales.
 */
import type { Category, PromoStatus, PrismaClient, RiskLevel } from "../../src/generated/prisma/client";

interface PromoDef {
  entity: { slug: string; name: string; category: Category; website: string; color: string; linkDomains?: string[] };
  slug: string;
  title: string;
  bonusText: string;
  bonusCents: number;
  summary: string;
  steps: string[];
  termsUrl: string;
  expiresAt: Date | null;
  status: PromoStatus;
  risk?: RiskLevel;
  featured?: boolean;
  // Todas las actuales son sin nómina.
  requiresPayroll?: boolean;
}

const endOfDay = (isoDate: string) => new Date(`${isoDate}T23:59:59+02:00`);

const PROMOS: PromoDef[] = [
  {
    entity: { slug: "bbva", name: "BBVA", category: "BANCO", website: "https://www.bbva.es", color: "#1464A5" },
    slug: "bbva-invita-a-un-amigo",
    title: "Cuenta Online BBVA con el plan «Invita a un amigo»",
    bonusText: "50 € de cashback con la tarjeta Aqua",
    bonusCents: 5000,
    summary:
      "Si nunca has sido cliente de BBVA, abre la cuenta online con un código de invitación y recupera hasta 50 € de tus compras con la tarjeta Aqua. Cada código admite un número limitado de amigos.",
    steps: [
      "Comprueba que no eres ni has sido cliente de BBVA",
      "Copia el código antes de empezar: solo se puede poner durante el alta",
      "Abre la Cuenta Online y pide la tarjeta Aqua desde la web o la app",
      "Paga con la tarjeta Aqua: recibes 50 € de cashback según indican las bases",
      "Ten Bizum activado cuando BBVA pague el premio",
    ],
    termsUrl: "https://www.bbva.es/content/dam/public-web/bbvaes/documents/productos/cuentas/bases-legales-plan-invita-a-un-amigo.pdf",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: { slug: "openbank", name: "Openbank", category: "BANCO", website: "https://www.openbank.es", color: "#D9254C" },
    slug: "openbank-invita-a-tus-amigos",
    title: "Cuenta Corriente Open con código de amigo",
    bonusText: "70 € al abrir cuenta",
    bonusCents: 7000,
    summary:
      "Abre la Cuenta Corriente Open con un código de amigo, haz un primer ingreso y activa la tarjeta y Bizum. El premio se cobra en tres pagos.",
    steps: [
      "Abre la Cuenta Corriente Open introduciendo el código de amigo",
      "Ingresa al menos 70 € desde una cuenta de otro banco",
      "Activa la tarjeta y Bizum en los 30 días siguientes",
      "Recibe el premio en tres pagos (30 € + 20 € + 20 €)",
    ],
    termsUrl: "https://www.openbank.es/assets/OK_ES/es-ES/documents/v1/MGM_2026.pdf",
    expiresAt: endOfDay("2026-10-29"),
    status: "ACTIVE",
    featured: true,
  },
  {
    entity: { slug: "myinvestor", name: "MyInvestor", category: "BROKER", website: "https://myinvestor.es", color: "#2B2D42" },
    slug: "myinvestor-plan-amigo",
    title: "Plan Amigo MyInvestor: abre cuenta con código",
    bonusText: "25 € al abrir cuenta",
    bonusCents: 2500,
    summary:
      "Abre tu cuenta con un código de invitación y, en los 3 meses siguientes, invierte, ahorra o contrata un depósito. Los 25 € son brutos.",
    steps: [
      "Haz el alta digital con el código y valida tu identidad",
      "En los 3 meses siguientes, cumple una opción: invertir 100 € (fondos, carteras indexadas, acciones o planes), mantener 1.000 € en la cuenta o contratar un depósito",
      "Recibe 25 € brutos en tu cuenta",
    ],
    termsUrl: "https://myinvestor.es",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: { slug: "mintos", name: "Mintos", category: "INVERSION", website: "https://www.mintos.com", color: "#3D7A5A" },
    slug: "mintos-invita-a-un-amigo",
    title: "Bono por invertir en Mintos con invitación",
    bonusText: "25 € al invertir 1.000 €",
    bonusCents: 2500,
    summary:
      "Plataforma de inversión con riesgo de pérdida. Recibes 25 € si inviertes al menos 1.000 € y los mantienes invertidos el plazo indicado.",
    steps: [
      "Regístrate con el enlace de invitación",
      "Invierte al menos 1.000 € en los 30 días siguientes (préstamos, bonos, ETF o inmobiliario; Smart Cash no cuenta)",
      "Mantén al menos 1.000 € invertidos durante 90 días",
      "Recibe los 25 € en los 7 días siguientes",
    ],
    termsUrl: "https://www.mintos.com/en/mintos-referral-program/",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: { slug: "robinhood", name: "Robinhood", category: "BROKER", website: "https://robinhood.com", color: "#1E7F3C" },
    slug: "robinhood-cripto-invitacion",
    title: "Robinhood Crypto (UE): regalo en criptomonedas",
    bonusText: "10 € en cripto",
    bonusCents: 1000,
    summary:
      "Abre tu cuenta de Robinhood Crypto con un enlace de invitación y haz un primer depósito. Recibes 10 € en criptomonedas.",
    steps: [
      "Regístrate con el enlace de invitación y verifica tu identidad",
      "Haz un primer depósito (consulta el mínimo en la app)",
      "Recibe 10 € en criptomonedas",
      "Ten en cuenta que, si después inviertes en criptomonedas (incluido el regalo), su precio sube y baja mucho y estarás sujeto a esa volatilidad",
    ],
    termsUrl: "https://robinhood.com/eu/en/",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: { slug: "revolut", name: "Revolut", category: "NEOBANCO", website: "https://www.revolut.com", color: "#191C1F" },
    slug: "revolut-invitacion",
    title: "Revolut: abre tu cuenta con invitación",
    bonusText: "70 € si cumples los requisitos",
    bonusCents: 7000,
    summary:
      "Abre tu cuenta de Revolut con el enlace de invitación y consigue 70 € al cumplir todos los requisitos. Las condiciones exactas aparecen en la app al registrarte.",
    steps: [
      "Regístrate con el enlace de invitación y verifica tu identidad con DNI o NIE",
      "Recarga la cuenta con una transferencia desde otro banco",
      "Pide la tarjeta física",
      "Haz las compras con tarjeta que indique la app (apuestas, tarjetas regalo y transferencias no cuentan)",
    ],
    termsUrl: "https://www.revolut.com/es-ES/legal/referrals-terms/",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: { slug: "kraken", name: "Kraken", category: "INVERSION", website: "https://www.kraken.com", color: "#5741D9" },
    slug: "kraken-invitacion",
    title: "Kraken: compra criptomonedas con invitación",
    bonusText: "30 € al depositar y operar",
    bonusCents: 3000,
    summary:
      "Abre tu cuenta en Kraken con el código o el enlace de invitación, verifica tu identidad y cumple el depósito y las operaciones mínimas. Recibís 30 € los dos.",
    steps: [
      "Regístrate con el enlace o introduce el código de invitación al crear la cuenta",
      "Verifica tu identidad con un documento del mismo país que elegiste al registrarte",
      "Deposita al menos 200 € y compra o vende al menos 200 € (confirma los importes en la app)",
      "Recibe 30 € en tu cuenta",
      "Ten en cuenta que, si inviertes en criptomonedas, su precio sube y baja mucho y estarás sujeto a esa volatilidad",
    ],
    termsUrl: "https://www.kraken.com/legal/referrals",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: {
      slug: "etoro",
      name: "eToro",
      category: "BROKER",
      website: "https://www.etoro.com",
      color: "#13C636",
      linkDomains: ["etoro.tw"],
    },
    slug: "etoro-invitacion",
    title: "eToro: abre tu cuenta de inversión con invitación",
    bonusText: "50 € al invertir 100 $",
    bonusCents: 5000,
    summary:
      "Abre tu cuenta de eToro con el enlace de invitación, haz tu primer depósito y tus primeras operaciones en los 90 días siguientes, y recibe 50 €.",
    steps: [
      "Regístrate con el enlace de invitación y verifica tu cuenta",
      "En los 90 días siguientes, haz un primer depósito de al menos 100 $",
      "Abre una o varias operaciones por un total mínimo de 100 $",
      "Recibe 50 €",
    ],
    termsUrl: "https://www.etoro.com/wp-content/uploads/2025/06/eToro-EU-RAF-TCs-May-1-2026.pdf",
    expiresAt: null,
    status: "ACTIVE",
  },
];

/**
 * Con `onlyMissing`, solo crea las promociones cuyo slug aún no existe y no toca las demás
 * (lo que se use al publicar, para no pisar los cambios hechos desde Administración).
 * Devuelve los slugs de las entidades cuyas promociones se han creado o actualizado.
 */
export async function loadPromotions(db: PrismaClient, { onlyMissing = false } = {}): Promise<Set<string>> {
  const touched = new Set<string>();
  for (const p of PROMOS) {
    if (onlyMissing && (await db.promotion.findUnique({ where: { slug: p.slug } }))) continue;
    const entity = await db.entity.upsert({ where: { slug: p.entity.slug }, update: {}, create: p.entity });
    touched.add(entity.slug);
    const existing =
      (await db.promotion.findUnique({ where: { slug: p.slug } })) ??
      (await db.promotion.findFirst({ where: { entityId: entity.id }, orderBy: { createdAt: "asc" } }));
    const data = {
      slug: p.slug,
      entityId: entity.id,
      title: p.title,
      bonusText: p.bonusText,
      bonusCents: p.bonusCents,
      summary: p.summary,
      steps: p.steps,
      termsUrl: p.termsUrl,
      expiresAt: p.expiresAt,
      status: p.status,
      risk: p.risk ?? "NONE",
      featured: p.featured ?? false,
      requiresPayroll: p.requiresPayroll ?? false,
      lastReviewedAt: null,
    };
    if (existing) await db.promotion.update({ where: { id: existing.id }, data });
    else await db.promotion.create({ data });
    console.log(`${entity.name}: ${p.status === "ACTIVE" ? "activa" : "en borrador"} · ${p.bonusText}`);
  }
  return touched;
}

