import Link from "next/link";
import { IconCheck } from "@/components/Icons";
import { OffersExplorer, type OfferItem } from "@/components/OffersExplorer";
import { ReviewList } from "@/components/ReviewList";
import { Testimonios } from "@/components/Testimonios";
import { activePromoWhere } from "@/lib/codes";
import { db } from "@/lib/db";
import { fmtEuros } from "@/lib/format";
import { FILTER_GROUPS, isFilterValue, isSortKey, type FilterGroupKey, type FilterState, type SortKey } from "@/lib/site";
import { TESTIMONIOS } from "@/lib/testimonios";

export const dynamic = "force-dynamic";

const HOW_IT_WORKS = [
  ["Elige una oferta", "Mira cuánto te dan y qué tienes que hacer."],
  ["Copia el código", "Pégalo al abrir la cuenta."],
  ["Cumple los pasos y cobra", "La entidad te ingresa la recompensa."],
];

const BENEFITS = [
  ["Requisitos claros", "Qué hay que ingresar, gastar o invertir, antes de empezar."],
  ["Condiciones oficiales", "Cada oferta enlaza a las bases de la entidad."],
  ["Revisión manual", "Indicamos la fecha de la última comprobación."],
];

type Search = { cat?: string; orden?: string; esf?: string; premio?: string; q?: string };

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  // Enlaces antiguos: «esf=efectivo» y «esf=cripto» eran filtros de premio.
  const legacyPremio = params.esf === "efectivo" || params.esf === "cripto" ? params.esf : undefined;
  const raw: Record<FilterGroupKey, string | undefined> = { esf: params.esf, premio: params.premio ?? legacyPremio, cat: params.cat };
  const filters: FilterState = {};
  for (const g of Object.keys(FILTER_GROUPS) as FilterGroupKey[]) {
    const v = raw[g];
    if (isFilterValue(g, v)) filters[g] = v;
  }
  const sort: SortKey = isSortKey(params.orden) ? params.orden : "bono";
  const query = (params.q ?? "").slice(0, 60);

  // Hay pocas ofertas: se cargan todas las activas y el explorador filtra al instante en el navegador.
  const [all, withPayroll, reviews] = await Promise.all([
    db.promotion.findMany({
      where: activePromoWhere(),
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
      take: 6,
      select: { id: true, name: true, text: true, createdAt: true, promotion: { select: { entity: { select: { name: true } } } } },
    }),
  ]);
  const offers: OfferItem[] = all;
  const allWithoutPayroll = withPayroll === 0;
  const totalCents = all.reduce((sum, p) => sum + p.bonusCents, 0);
  const worked = all.reduce((sum, p) => sum + p.workedCount, 0);
  const breakdown = [...all].sort((a, b) => b.bonusCents - a.bonusCents);
  const nonCash = breakdown.filter((b) => b.rewardType !== "CASH").map((b) => b.entity.name);

  const faqs: [string, string][] = [
    [
      "¿Es dinero garantizado?",
      "No. Es una recompensa que la entidad paga a los clientes nuevos que cumplen sus condiciones. Si no cumples un paso o un plazo, o ya has sido cliente, puede no pagarla.",
    ],
    [
      "¿Tengo que domiciliar la nómina?",
      allWithoutPayroll
        ? "No. Ninguna de las ofertas actuales pide domiciliar la nómina."
        : "En las marcadas con «Sin nómina», no. Las que la piden lo indican en su tarjeta.",
    ],
    [
      "¿Tengo que poner dinero?",
      "En algunas sí: un ingreso, compras con la tarjeta o una inversión. Cada tarjeta lo indica en «Qué haces» y la ficha da los importes y plazos.",
    ],
    ["¿Me tengo que registrar en esta web?", "No. Entras, copias el código y listo. Solo hace falta cuenta si quieres compartir tu propio código."],
    ["¿Y si el código no funciona?", "Pulsa «Este código no funciona» y después «Dame otro código»."],
    ["¿Cuándo me pagan?", "Depende de cada entidad. Lo indican sus condiciones oficiales, enlazadas en cada oferta."],
    ["¿Cómo gana dinero esta web?", "Algunos códigos son del propietario, que recibe una recompensa de la entidad si los usas. A ti no te cuesta nada ni reduce tu bono."],
    ["¿Tengo que declararlo?", "Sí. Estas recompensas suelen tributar en la declaración de la renta."],
  ];

  return (
    <>
      <section className="bg-brand pb-5 pt-5 text-white sm:pb-8 sm:pt-8">
        <div className="wrap">
          <h1 className="max-w-2xl text-2xl font-extrabold leading-tight sm:text-4xl">
            Encuentra promociones y consigue recompensas con códigos de invitación
          </h1>
          <p className="mt-2 max-w-2xl text-white/90 sm:mt-3 sm:text-lg">
            Compara códigos de bancos y aplicaciones, conoce los requisitos y descubre cuánto necesitas ingresar antes de empezar.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a href="#ofertas" className="btn btn-accent">Ver ofertas</a>
            <Link href="/como-funciona" className="btn border border-white/40 text-white hover:bg-white/10">Cómo funciona</Link>
          </div>
          <ul className="mt-6 hidden gap-4 text-sm sm:grid sm:grid-cols-3">
            {BENEFITS.map(([t, d]) => (
              <li key={t} className="flex gap-2">
                <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-ink">
                  <IconCheck size={12} />
                </span>
                <span>
                  <strong className="block">{t}</strong>
                  <span className="text-white/80">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          {all.length > 0 && (
            <details className="mt-3 max-w-xl text-sm sm:mt-5">
              <summary className="inline-flex min-h-10 cursor-pointer list-none flex-wrap items-center gap-x-2 text-white/90 [&::-webkit-details-marker]:hidden">
                <span>
                  {fmtEuros(totalCents)} en recompensas anunciadas en {all.length} ofertas
                  {worked > 0 ? ` · ${worked} cobradas y confirmadas` : ""}
                </span>
                <span className="underline underline-offset-4">¿De dónde sale?</span>
              </summary>
              <div className="mt-1 rounded-xl bg-white/10 p-4">
                <p className="text-white/90">
                  Es la suma de las recompensas anunciadas por cada entidad, no una ganancia garantizada. Cobras cada una solo si cumples sus
                  condiciones y, normalmente, si nunca has sido cliente.
                  {worked > 0 ? " Las «cobradas y confirmadas» son las personas que han pulsado «Me ha funcionado» en cada oferta." : ""}
                </p>
                <ul className="mt-3 grid gap-1">
                  {breakdown.map((b) => (
                    <li key={b.id} className="flex justify-between gap-3 border-b border-white/10 pb-1">
                      <span>{b.entity.name}</span>
                      <span className="font-semibold tabular-nums">{fmtEuros(b.bonusCents)}</span>
                    </li>
                  ))}
                </ul>
                {nonCash.length > 0 && <p className="mt-3 text-white/80">No son en efectivo: {nonCash.join(", ")} (cashback o cripto).</p>}
              </div>
            </details>
          )}
        </div>
      </section>

      <div id="ofertas" className="wrap mt-4 scroll-mt-16 sm:mt-6">
        <h2 className="sr-only">Ofertas</h2>
        <OffersExplorer offers={offers} initial={{ q: query, sort, filters }} />
        <p className="mt-3 text-xs text-muted">
          Las cantidades son las recompensas anunciadas por cada entidad para nuevos clientes. No son ganancias garantizadas: dependen de cumplir
          sus condiciones. «Pones tú» es el dinero que piden ingresar, gastar o invertir según sus condiciones; si no lo indican, aparece «No
          indicado».
        </p>

        <section aria-labelledby="como" className="card mt-10 p-4 sm:p-5">
          <h2 id="como" className="text-lg font-bold">Cómo funciona</h2>
          <ol className="mt-3 grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map(([t, d], i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent font-extrabold">{i + 1}</span>
                <div>
                  <p className="font-bold leading-tight">{t}</p>
                  <p className="hint">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Testimonios items={TESTIMONIOS} title="Opiniones de quienes lo han probado" className="mt-10" />

        {reviews.length > 0 && (
          <div className="mt-3">
            <ReviewList items={reviews.map((r) => ({ ...r, entityName: r.promotion.entity.name }))} />
          </div>
        )}
        <p className="mt-4">
          <Link href="/opinar" className="font-semibold text-brand underline underline-offset-4">¿Ya has cobrado? Cuéntalo aquí →</Link>
        </p>

        <section aria-labelledby="faq" className="mt-10">
          <h2 id="faq" className="text-xl font-extrabold">Preguntas frecuentes</h2>
          <div className="card mt-3 divide-y divide-line">
            {faqs.map(([q, a]) => (
              <details key={q} className="group px-4 py-3">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {q}
                  <span aria-hidden className="text-xl text-brand transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-3">
            <Link href="/como-funciona" className="text-sm font-semibold text-brand underline-offset-2 hover:underline">Guía completa y cómo revisamos las ofertas →</Link>
          </p>
        </section>
      </div>
    </>
  );
}
