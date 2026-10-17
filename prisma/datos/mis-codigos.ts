/**
 * Carga los códigos del administrador. No borra nada salvo los códigos de
 * ejemplo del administrador. Sirve para local y para producción (se puede repetir).
 *
 * Si una entidad no tiene promoción, se crea una en BORRADOR (no se ve) con avisos
 * [PENDIENTE]: el importe y los requisitos reales se rellenan en Administración.
 */
import type { Category, PrismaClient } from "../../src/generated/prisma/client";

interface MyCode {
  entity: { slug: string; name: string; category: Category; website: string; color: string };
  code?: string;
  link?: string;
}

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
  {
    entity: { slug: "openbank", name: "Openbank", category: "BANCO", website: "https://www.openbank.es", color: "#D9254C" },
    code: "58967318513821209101",
  },
  {
    entity: { slug: "bbva", name: "BBVA", category: "BANCO", website: "https://www.bbva.es", color: "#1464A5" },
    code: "14C700311035E0",
  },
];

export async function loadMyCodes(db: PrismaClient) {
  for (const item of MY_CODES) {
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
          data: { promotionId: promo.id, kind: "ADMIN", code: item.code ?? null, link: item.link ?? null, priority: 0, status: "APPROVED" },
        });
      }
    }
    console.log(`${entity.name}: código cargado en ${promos.length} ${promos.length === 1 ? "promoción" : "promociones"}.`);
  }
}

