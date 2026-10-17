/**
 * Promociones reales (recopiladas el 17/10/2026 de fuentes públicas y contrastadas con las condiciones oficiales el mismo día; importes de BBVA,
 * Mintos, Robinhood y Revolut confirmados por el administrador). No borra nada: crea o actualiza una promoción por
 * entidad (Kraken y eToro añadidas el 17/10/2026). Se puede repetir en local y en producción.
 *
 * `lastReviewedAt` se deja vacío a propósito: la fecha de revisión la marca el
 * administrador desde el panel cuando haya comprobado las condiciones oficiales.
 */
import type { Category, Effort, PromoStatus, PrismaClient, RewardType, RiskLevel } from "../../src/generated/prisma/client";

interface PromoDef {
  entity: { slug: string; name: string; category: Category; website: string; color: string; linkDomains?: string[]; logoUrl?: string };
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
  effort: Effort;
  requirementText: string;
  rewardType: RewardType;
  // Desembolso mínimo en céntimos, solo si las condiciones dan un importe en euros.
  requiredCents?: number | null;
}

const endOfDay = (isoDate: string) => new Date(`${isoDate}T23:59:59+02:00`);

const PROMOS: PromoDef[] = [
  {
    entity: { slug: "bbva", name: "BBVA", category: "BANCO", website: "https://www.bbva.es", color: "#1464A5", logoUrl: "https://www.google.com/s2/favicons?domain=bbva.es&sz=128" },
    slug: "bbva-invita-a-un-amigo",
    effort: "SPEND",
    requirementText: "Pagar con la tarjeta Aqua",
    rewardType: "CASHBACK",
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
    entity: { slug: "openbank", name: "Openbank", category: "BANCO", website: "https://www.openbank.es", color: "#D9254C", logoUrl: "https://www.google.com/s2/favicons?domain=openbank.es&sz=128" },
    slug: "openbank-invita-a-tus-amigos",
    requiredCents: 7000,
    effort: "DEPOSIT",
    requirementText: "Ingresar 70 € y usar tarjeta y Bizum",
    rewardType: "CASH",
    title: "Cuenta Corriente Open con código de amigo",
    bonusText: "70 € netos en tres pagos",
    bonusCents: 7000,
    summary:
      "Abre la Cuenta Corriente Open con un código de amigo, ingresa al menos 70 € y activa la tarjeta y Bizum. Cobras 70 € netos en tres pagos. No puedes participar si fuiste cliente de Openbank en los 12 meses anteriores ni si te diste de alta en otra promoción de Bizum en ese tiempo.",
    steps: [
      "Abre la Cuenta Corriente Open con el código de amigo antes del 29/10/2026",
      "En los 30 días siguientes a la apertura, ingresa al menos 70 €",
      "Activa la tarjeta",
      "Trae Bizum a Openbank y mantenlo al menos 3 meses",
      "Recibe 70 € netos en tres pagos (30 € + 20 € + 20 €), en la segunda quincena de cada mes",
    ],
    termsUrl: "https://www.openbank.es/assets/OK_ES/es-ES/documents/v1/MGM_2026.pdf",
    expiresAt: endOfDay("2026-10-29"),
    status: "ACTIVE",
    featured: true,
  },
  {
    entity: { slug: "myinvestor", name: "MyInvestor", category: "BROKER", website: "https://myinvestor.es", color: "#2B2D42", logoUrl: "https://www.google.com/s2/favicons?domain=myinvestor.es&sz=128" },
    slug: "myinvestor-plan-amigo",
    requiredCents: 100000,
    effort: "DEPOSIT",
    requirementText: "Mantener 1.000 € o invertir 100 €",
    rewardType: "CASH",
    title: "Plan Amigo MyInvestor: abre cuenta con código",
    bonusText: "25 € brutos",
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
    entity: { slug: "mintos", name: "Mintos", category: "INVERSION", website: "https://www.mintos.com", color: "#3D7A5A", logoUrl: "https://www.google.com/s2/favicons?domain=mintos.com&sz=128" },
    slug: "mintos-invita-a-un-amigo",
    requiredCents: 100000,
    effort: "INVEST",
    requirementText: "Invertir 1.000 € hasta el día 90",
    rewardType: "CASH",
    title: "Bono por invertir en Mintos con invitación",
    bonusText: "50 € al invertir 1.000 €",
    bonusCents: 5000,
    summary:
      "Plataforma de inversión con riesgo de pérdida. Recibes 50 € si inviertes al menos 1.000 € en los 60 días siguientes al registro y los mantienes invertidos hasta el día 90.",
    steps: [
      "Regístrate con el enlace de invitación",
      "En los 60 días siguientes al registro, invierte al menos 1.000 € en préstamos, bonos, ETF o inmobiliario (Smart Cash no cuenta)",
      "Mantén al menos 1.000 € invertidos hasta el día 90 desde el registro",
      "Recibe 50 € a los 90 días del registro",
    ],
    termsUrl: "https://www.mintos.com/en/mintos-referral-program/",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: { slug: "robinhood", name: "Robinhood", category: "BROKER", website: "https://robinhood.com", color: "#1E7F3C", logoUrl: "https://www.google.com/s2/favicons?domain=robinhood.com&sz=128" },
    slug: "robinhood-cripto-invitacion",
    requiredCents: 1000,
    effort: "DEPOSIT",
    requirementText: "Depositar al menos 10 €",
    rewardType: "CRYPTO",
    title: "Robinhood Crypto (UE): regalo en criptomonedas",
    bonusText: "Al menos 10 € en cripto",
    bonusCents: 1000,
    summary:
      "Abre tu cuenta de Robinhood Crypto con un enlace de invitación y deposita al menos 10 €. Recibes al menos 10 € en criptomonedas, que debes mantener 180 días antes de poder retirarlos.",
    steps: [
      "Regístrate con el enlace de invitación (solo si nunca has tenido cuenta en Robinhood)",
      "Deposita al menos 10 € (o el importe que indique la app)",
      "Recibe al menos 10 € en criptomonedas",
      "Mantén su valor 180 días antes de retirarlo; su precio sube y baja y puede perder valor",
    ],
    termsUrl: "https://robinhood.com/eu/en/",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: { slug: "revolut", name: "Revolut", category: "NEOBANCO", website: "https://www.revolut.com", color: "#191C1F", logoUrl: "https://www.google.com/s2/favicons?domain=revolut.com&sz=128" },
    slug: "revolut-invitacion",
    effort: "SPEND",
    requirementText: "Abrir la cuenta con el enlace",
    rewardType: "CASH",
    title: "Revolut: abre tu cuenta con invitación",
    // Según la ayuda oficial de Revolut, la recompensa del programa de invitación es para quien invita.
    bonusText: "Sin bono confirmado para ti",
    bonusCents: 0,
    summary:
      "Según la ayuda oficial de Revolut, la recompensa de su programa de invitación es para quien invita (aquí, el propietario de Bonificados), no para el nuevo cliente. A veces Revolut muestra en la app campañas con premio también para quien se registra: si al abrir tu cuenta ves una, sus condiciones son las que valen. Úsalo si ya querías una cuenta de Revolut.",
    steps: [
      "Regístrate con el enlace de invitación y verifica tu identidad",
      "Si la app te muestra una campaña con premio para ti, revisa sus condiciones antes de seguir",
      "Para que la invitación cuente: añade dinero con tarjeta o transferencia (las de otros clientes de Revolut no cuentan), pide la tarjeta física y haz los pagos que indique la campaña",
      "No cuentan apuestas, tarjetas regalo, cambio de divisas ni transferencias",
    ],
    termsUrl: "https://help.revolut.com/es-ES/help/referrals/more-help-with-referrals/referrals-new/what-are-the-conditions-of-the-referral-campaign/",
    expiresAt: null,
    status: "ACTIVE",
  },
  {
    entity: { slug: "kraken", name: "Kraken", category: "INVERSION", website: "https://www.kraken.com", color: "#5741D9", logoUrl: "https://www.google.com/s2/favicons?domain=kraken.com&sz=128" },
    slug: "kraken-invitacion",
    requiredCents: 20000,
    effort: "INVEST",
    requirementText: "Depositar y operar 200 €",
    rewardType: "CASH",
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
      color: "#13C636", logoUrl: "https://www.google.com/s2/favicons?domain=etoro.com&sz=128",
      linkDomains: ["etoro.tw"],
    },
    slug: "etoro-invitacion",
    effort: "INVEST",
    requirementText: "Invertir 100 $",
    rewardType: "CASH",
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
    status: "DRAFT",
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
      effort: p.effort,
      requirementText: p.requirementText,
      rewardType: p.rewardType,
      requiredCents: p.requiredCents ?? null,
      lastReviewedAt: null,
    };
    if (existing) await db.promotion.update({ where: { id: existing.id }, data });
    else await db.promotion.create({ data });
    console.log(`${entity.name}: ${p.status === "ACTIVE" ? "activa" : "en borrador"} · ${p.bonusText}`);
  }
  return touched;
}

