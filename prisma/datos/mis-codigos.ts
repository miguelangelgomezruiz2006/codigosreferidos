/**
 * Carga los códigos del administrador. No borra nada salvo los códigos de
 * ejemplo del administrador. Sirve para local y para producción (se puede repetir).
 *
 * Si una entidad no tiene promoción, se crea una en BORRADOR (no se ve) con avisos
 * [PENDIENTE]: el importe y los requisitos reales se rellenan en Administración.
 *
 * OJO: en la web publicada este archivo solo se carga para promociones NUEVAS.
 * Para añadir un código a una promoción que ya está publicada, usa Administración › Promociones
 * (o una migración SQL, como prisma/migrations/20261019120000_codigos_openbank).
 */
import type { Category, PrismaClient } from "../../src/generated/prisma/client";

interface MyCode {
  entity: { slug: string; name: string; category: Category; website: string; color: string; linkDomains?: string[] };
  code?: string;
  link?: string;
  /** Nº máximo de usos (sin poner = sin límite). Para códigos de un solo uso, como los de Openbank. */
  maxUses?: number;
  /** Orden en la rotación: número menor = se muestra antes (por defecto 0). */
  priority?: number;
}

const OPENBANK = { slug: "openbank", name: "Openbank", category: "BANCO", website: "https://www.openbank.es", color: "#D9254C" } as const;

const MY_CODES: MyCode[] = [
  {
    entity: { slug: "myinvestor", name: "MyInvestor", category: "BROKER", website: "https://myinvestor.es", color: "#2B2D42" },
    code: "JX2US",
    link: "https://newapp.myinvestor.es/do/signup?promotionalCode=JX2US",
  },
  {
    entity: { slug: "mintos", name: "Mintos", category: "INVERSION", website: "https://www.mintos.com", color: "#3D7A5A" },
    code: "BL20PF",
    link: "https://www.mintos.com/en/l/ref/BL20PF/?utm_source=mintos&utm_medium=app&utm_campaign=raf",
  },
  {
    entity: { slug: "revolut", name: "Revolut", category: "NEOBANCO", website: "https://www.revolut.com", color: "#191C1F" },
    link: "https://revolut.com/referral/?referral-code=mgomezruiz!OCT1-26-AR-H2&geo-redirect",
  },
  {
    entity: { slug: "robinhood", name: "Robinhood", category: "BROKER", website: "https://robinhood.com", color: "#1E7F3C" },
    link: "https://join.robinhood.com/eu_crypto/miguelg-c6475b/",
  },
  // Openbank: varios códigos sin límite de usos; la web los reparte por turnos.
  { entity: OPENBANK, code: "58967318513821209101", priority: 0 },
  { entity: OPENBANK, code: "58977407618141198202", priority: 1 },
  { entity: OPENBANK, code: "58977412048160156231", priority: 2 },
  { entity: OPENBANK, code: "58977421019019127916", priority: 3 },
  { entity: OPENBANK, code: "58977451802193130011", priority: 4 },
  { entity: OPENBANK, code: "5897739168721418287A", priority: 5 },
  {
    entity: { slug: "bbva", name: "BBVA", category: "BANCO", website: "https://www.bbva.es", color: "#1464A5" },
    code: "14C700311035E0",
  },
  {
    entity: { slug: "kraken", name: "Kraken", category: "INVERSION", website: "https://www.kraken.com", color: "#5741D9" },
    code: "s7qwr77s",
    link: "https://invite.kraken.com/JDNW/h3jbz8fu",
  },
  {
    entity: { slug: "etoro", name: "eToro", category: "BROKER", website: "https://www.etoro.com", color: "#13C636", linkDomains: ["etoro.tw"] },
    link: "https://etoro.tw/4dC7EwR",
  },
  {
    entity: { slug: "imagin", name: "imagin", category: "NEOBANCO", website: "https://www.imagin.com", color: "#1A1A1A", linkDomains: ["pwlnk.io"] },
    code: "B02IM50391305",
    link: "https://imagin.pwlnk.io/uj$&JA4Qc",
  },
  {
    entity: { slug: "coinbase", name: "Coinbase", category: "INVERSION", website: "https://www.coinbase.com", color: "#0052FF" },
    link: "https://coinbase.com/join/R9GHRP8?src=ios-link",
  },
  {
    entity: { slug: "trade-republic", name: "Trade Republic", category: "BROKER", website: "https://traderepublic.com", color: "#111111", linkDomains: ["trade.re"] },
    link: "https://refnocode.trade.re/fvt8b12f",
  },
  {
    entity: { slug: "wise", name: "Wise", category: "NEOBANCO", website: "https://wise.com", color: "#163300" },
    link: "https://wise.com/invite/irtc/miguelangelgomezruizg",
  },
];

/** Con `onlyEntities`, solo carga los códigos de esas entidades. */
export async function loadMyCodes(db: PrismaClient, { onlyEntities }: { onlyEntities?: Set<string> } = {}) {
  for (const item of MY_CODES) {
    if (onlyEntities && !onlyEntities.has(item.entity.slug)) continue;
    const entity = await db.entity.upsert({ where: { slug: item.entity.slug }, update: {}, create: item.entity });

    let promos = await db.promotion.findMany({ where: { entityId: entity.id }, orderBy: { createdAt: "asc" } });
    if (promos.length === 0) {
      promos = [
        await db.promotion.create({
          data: {
            slug: `${entity.slug}-invitacion`,
            entityId: entity.id,
            title: `Abre tu cuenta de ${entity.name} con invitación`,
            bonusText: "[PENDIENTE: bono]",
            summary: "[PENDIENTE: revisa las condiciones oficiales y completa esta promoción antes de activarla]",
            termsUrl: entity.website,
            status: "DRAFT",
          },
        }),
      ];
      console.log(`${entity.name}: promoción creada en borrador (falta rellenar el bono).`);
    }

    for (const promo of promos) {
      // Quita los códigos de ejemplo del administrador.
      await db.referralCode.deleteMany({
        where: { promotionId: promo.id, kind: "ADMIN", OR: [{ code: { startsWith: "EJEMPLO" } }, { link: { contains: "ejemplo=1" } }] },
      });
      const exists = await db.referralCode.findFirst({
        where: { promotionId: promo.id, kind: "ADMIN", code: item.code ?? null, link: item.link ?? null },
      });
      if (!exists) {
        await db.referralCode.create({
          data: {
            promotionId: promo.id,
            kind: "ADMIN",
            code: item.code ?? null,
            link: item.link ?? null,
            maxUses: item.maxUses ?? null,
            priority: item.priority ?? 0,
            status: "APPROVED",
          },
        });
      }
    }
    console.log(`${entity.name}: código cargado en ${promos.length} ${promos.length === 1 ? "promoción" : "promociones"}.`);
  }
}

