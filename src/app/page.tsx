import type { Metadata } from "next";
import Link from "next/link";
import { OffersExplorer } from "@/components/OffersExplorer";
import { ReviewList } from "@/components/ReviewList";
import { Testimonios } from "@/components/Testimonios";
import { activePromoWhere } from "@/lib/codes";
import { db } from "@/lib/db";
import { fmtEuros } from "@/lib/format";
import { FILTER_GROUPS, SITE_NAME, isFilterValue, isSortKey, type FilterGroupKey, type FilterState, type SortKey } from "@/lib/site";
import { TESTIMONIOS } from "@/lib/testimonios";

export const dynamic = "force-dynamic";
// Los filtros cambian la URL, pero es la misma página: una sola dirección para Google.
export const metadata: Metadata = { alternates: { canonical: "/" } };

const STEPS = [
  ["Elige una oferta", "Cada una dice qué tienes que hacer y cuánto pones."],
  ["Sigue los requisitos", "Abre la cuenta con el código y cumple los pasos."],
  ["Cobra la recompensa", "La entidad te la paga si cumples sus condiciones."],
];

type Search = { q?: string; orden?: string; esf?: string } & Partial<Record<FilterGroupKey, string>>;

/** Enlaces antiguos usaban «esf» para varios filtros: se traducen a los grupos actuales. */
const LEGACY_ESF: Record<string, [FilterGroupKey, string]> = {
  "sin-invertir": ["inversion", "sin-invertir"],
  "sin-ingreso": ["dinero", "sin-ingreso"],
  efectivo: ["premio", "efectivo"],
  cripto: ["premio", "cripto"],
};

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const filters: FilterState = {};
  const legacy = params.esf ? LEGACY_ESF[params.esf] : undefined;
  if (legacy) filters[legacy[0]] = legacy[1];
  for (const g of Object.keys(FILTER_GROUPS) as FilterGroupKey[]) {
    const v = params[g];
    if (isFilterValue(g, v)) filters[g] = v;
  }
  const sort: SortKey = isSortKey(params.orden) ? params.orden : "bono";
  const query = (params.q ?? "").slice(0, 60);

  const [offers, withPayroll, reviews] = await Promise.all([
    db.promotion.findMany({
      where: activePromoWhere(),
      // La opción estrella primero; después, de mayor a menor recompensa.
      orderBy: [{ featured: "desc" }, { bonusCents: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        bonusText: true,
        bonusCents: true,
        expiresAt: true,
        steps: true,
        risk: true,
        featured: true,
        requiresPayroll: true,
        effort: true,
        requirementText: true,
        rewardType: true,
        requiredCents: true,
        workedCount: true,
        termsUrl: true,
        lastReviewedAt: true,
        entity: { select: { name: true, logoUrl: true, color: true, category: true } },
      },
    }),
    db.promotion.count({ where: { ...activePromoWhere(), requiresPayroll: true } }),
    db.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, text: true, createdAt: true, promotion: { select: { entity: { select: { name: true } } } } },
    }),
  ]);
  const totalCents = offers.reduce((sum, p) => sum + p.bonusCents, 0);
  const noPayroll = withPayroll === 0;

  const faqs: [string, string][] = [
    [
      "¿Es dinero garantizado?",
      "No. Es una recompensa que paga la entidad a los clientes nuevos que cumplen sus condiciones. Si no cumples un paso o un plazo, puede no pagarla.",
    ],
    [
      "¿Tengo que poner dinero?",
      "Depende de la oferta. Cada tarjeta dice si depositas (sigue siendo tuyo), gastas o inviertes (puede perder valor), y cuánto. Si las condiciones no lo dicen, pone «No indicado».",
    ],
    [
      `¿Cómo gana dinero ${SITE_NAME}?`,
      "Algunos códigos son del propietario de la web, que recibe una recompensa de la entidad si los usas. A ti no te cuesta nada ni reduce tu recompensa.",
    ],
    ["¿Tengo que declararlo?", "Sí. Estas recompensas suelen tributar en la declaración de la renta."],
  ];

  return (
    <>
      <section className="bg-brand text-white">
        <div className="wrap pb-6 pt-6 sm:pb-10 sm:pt-10">
          <h1 className="max-w-2xl text-[26px] font-bold leading-[1.15] sm:text-[42px]">Bonos de bienvenida de bancos y apps, sin complicaciones</h1>
          <p className="mt-2 max-w-xl text-white/85 sm:mt-3 sm:text-lg">
            Elige una oferta, copia el código y sigue los pasos. Antes de empezar sabrás qué tienes que hacer y cuánto pones
            {noPayroll ? ", y ninguna pide domiciliar la nómina" : ""}.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-6">
            <a href="#ofertas" className="btn btn-accent px-5">
              Explorar ofertas
            </a>
            {offers.length > 0 && (
              <p className="text-sm text-white/80">
                {offers.length} ofertas · hasta {fmtEuros(totalCents)} en recompensas anunciadas
              </p>
            )}
          </div>
        </div>
      </section>

      <section id="ofertas" aria-labelledby="ofertas-titulo" className="wrap mt-5 scroll-mt-16 sm:mt-8">
        <h2 id="ofertas-titulo" className="sr-only">
          Ofertas
        </h2>
        <OffersExplorer offers={offers} initial={{ q: query, sort, filters }} />
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Las cantidades son las recompensas que anuncia cada entidad para nuevos clientes y dependen de cumplir sus condiciones. Algunos códigos son
          del propietario de {SITE_NAME}, que puede recibir una recompensa si los usas.{" "}
          <Link href="/como-funciona" className="underline underline-offset-2 hover:text-ink">
            Más información
          </Link>
        </p>
      </section>

      <div className="wrap">
        <section aria-labelledby="pasos" className="mt-12">
          <h2 id="pasos" className="text-xl font-bold">
            Cómo funciona
          </h2>
          <ol className="mt-4 grid gap-5 sm:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="font-display grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand-dark">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold leading-tight">{t}</p>
                  <p className="hint mt-0.5">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Testimonios items={TESTIMONIOS.slice(0, 3)} title="Quienes ya lo han probado" className="mt-12" />
        {reviews.length > 0 && (
          <div className="mt-3">
            <ReviewList items={reviews.map((r) => ({ ...r, entityName: r.promotion.entity.name }))} />
          </div>
        )}

        <section aria-labelledby="dudas" className="mt-12">
          <h2 id="dudas" className="text-xl font-bold">
            Dudas frecuentes
          </h2>
          <div className="card mt-3 divide-y divide-line">
            {faqs.map(([q, a]) => (
              <details key={q} className="group px-4">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden className="text-xl text-brand transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-4 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
