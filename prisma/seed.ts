/**
 * Datos de EJEMPLO solo para probar en local. BORRA todo lo que haya.
 * Los importes y requisitos son inventados para la prueba: antes de publicar,
 * cada promoción real se crea desde Administración con las condiciones oficiales.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { isLocalDatabaseUrl } from "../src/lib/local-db";

if (process.env.NODE_ENV === "production" || !isLocalDatabaseUrl(process.env.DATABASE_URL)) {
  console.error("Los datos de ejemplo BORRAN la base de datos y solo se cargan en una base local (localhost). No se ha tocado nada.");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }) });

const NOTE = "Datos de ejemplo para probar la web: el importe y los requisitos no son reales.";
const day = 24 * 3600 * 1000;

async function main() {
  await db.codeEvent.deleteMany();
  await db.codeReport.deleteMany();
  await db.codeUse.deleteMany();
  await db.assignment.deleteMany();
  await db.referralCode.deleteMany();
  await db.promotion.deleteMany();
  await db.entity.deleteMany();
  await db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const entities = [
    { slug: "bbva", name: "BBVA", category: "BANCO", website: "https://www.bbva.es", color: "#1464A5" },
    { slug: "imagin", name: "imagin", category: "NEOBANCO", website: "https://www.imagin.com", color: "#1F9E8E" },
    { slug: "myinvestor", name: "MyInvestor", category: "BROKER", website: "https://myinvestor.es", color: "#2B2D42" },
    { slug: "openbank", name: "Openbank", category: "BANCO", website: "https://www.openbank.es", color: "#D9254C" },
    { slug: "mintos", name: "Mintos", category: "INVERSION", website: "https://www.mintos.com", color: "#3D7A5A" },
  ] as const;
  const e: Record<string, string> = {};
  for (const ent of entities) e[ent.slug] = (await db.entity.create({ data: ent })).id;

  const promos = [
    {
      slug: "bbva-cuenta-online",
      entityId: e.bbva,
      title: "Cuenta online sin comisiones con invitación",
      bonusText: "20 € al abrir cuenta",
      bonusCents: 2000,
      expiresAt: new Date(Date.now() + 40 * day),
      steps: ["Abre la cuenta desde la app con el código de invitación", "Activa la tarjeta y haz un pago", "Recibe el bono en tu cuenta"],
    },
    {
      slug: "imagin-bienvenida",
      entityId: e.imagin,
      title: "Bono de bienvenida por darte de alta",
      bonusText: "15 € de bienvenida",
      bonusCents: 1500,
      expiresAt: new Date(Date.now() + 5 * day),
      steps: ["Descarga la app e introduce el código al registrarte", "Haz tu primera compra con la tarjeta", "El bono llega en unos días"],
    },
    {
      slug: "myinvestor-cuenta",
      entityId: e.myinvestor,
      title: "Abre cuenta y haz tu primera aportación",
      bonusText: "25 € al invertir",
      bonusCents: 2500,
      expiresAt: null,
      steps: ["Regístrate con el código", "Aporta la cantidad mínima indicada en las condiciones", "Mantén la inversión el plazo indicado"],
    },
    {
      slug: "openbank-nomina",
      entityId: e.openbank,
      title: "Trae tu nómina",
      bonusText: "Hasta 100 € por tu nómina",
      bonusCents: 10000,
      expiresAt: new Date(Date.now() + 90 * day),
      steps: ["Abre la cuenta con el enlace de invitación", "Domicilia tu nómina", "Cumple los meses de permanencia"],
    },
    {
      slug: "mintos-registro",
      entityId: e.mintos,
      title: "Bono por invertir en préstamos",
      bonusText: "1 % de lo invertido",
      bonusCents: 500,
      expiresAt: new Date(Date.now() - 3 * day),
      steps: ["Regístrate con el enlace", "Invierte la cantidad mínima", "Ojo: es inversión con riesgo"],
    },
  ];
  const p: Record<string, string> = {};
  for (const pr of promos) {
    const entity = entities.find((x) => e[x.slug] === pr.entityId)!;
    p[pr.slug] = (
      await db.promotion.create({
        data: { ...pr, summary: NOTE, termsUrl: entity.website, status: "ACTIVE", lastReviewedAt: new Date() },
      })
    ).id;
  }

  // Códigos del administrador: el de BBVA con límite de 3 usos para ver el paso a la comunidad.
  await db.referralCode.createMany({
    data: [
      { promotionId: p["bbva-cuenta-online"], kind: "ADMIN", code: "EJEMPLO-BBVA", maxUses: 3, status: "APPROVED" },
      { promotionId: p["imagin-bienvenida"], kind: "ADMIN", code: "EJEMPLOIMAGIN", status: "APPROVED" },
      { promotionId: p["openbank-nomina"], kind: "ADMIN", link: "https://www.openbank.es/?ejemplo=1", status: "APPROVED" },
    ],
  });

  // Usuarios de la comunidad de ejemplo.
  const users = await Promise.all(
    ["ana@ejemplo.test", "luis@ejemplo.test", "marta@ejemplo.test"].map((email) =>
      db.user.upsert({ where: { email }, update: {}, create: { email } }),
    ),
  );
  await db.referralCode.createMany({
    data: [
      { promotionId: p["bbva-cuenta-online"], userId: users[0].id, kind: "COMMUNITY", code: "ANA2026", status: "APPROVED" },
      { promotionId: p["bbva-cuenta-online"], userId: users[1].id, kind: "COMMUNITY", code: "LUISBBVA", status: "APPROVED" },
      { promotionId: p["bbva-cuenta-online"], userId: users[2].id, kind: "COMMUNITY", code: "MARTA-BBVA", status: "PENDING" },
      { promotionId: p["myinvestor-cuenta"], userId: users[0].id, kind: "COMMUNITY", code: "ANAINVEST", status: "APPROVED" },
      { promotionId: p["myinvestor-cuenta"], userId: users[1].id, kind: "COMMUNITY", code: "LUIS-MYI", status: "APPROVED", reportCount: 1 },
    ],
  });
  const luisMyi = await db.referralCode.findFirstOrThrow({ where: { code: "LUIS-MYI" } });
  await db.codeReport.create({ data: { codeId: luisMyi.id, reporterKey: "ip:ejemplo", reason: "La app dice que el código no existe" } });

  console.log("Datos de ejemplo cargados: 5 entidades, 5 promociones (1 caducada), 8 códigos.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
