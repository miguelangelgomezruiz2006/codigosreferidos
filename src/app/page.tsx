import Link from "next/link";
import { AutoSubmitSelect } from "@/components/AutoSubmitSelect";
import { PromoCard } from "@/components/PromoCard";
import { ReviewList } from "@/components/ReviewList";
import { Testimonios } from "@/components/Testimonios";
import { activePromoWhere } from "@/lib/codes";
import { db } from "@/lib/db";
import { fmtEuros } from "@/lib/format";
import {
  CATEGORY_LABELS,
  EFFORT_FILTERS,
  EFFORT_FILTER_TEST,
  SORT_OPTIONS,
  isCategory,
  isEffortFilter,
  isSortKey,
  type SortKey,
} from "@/lib/site";
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

type Search = { cat?: string; orden?: string; esf?: string; q?: string };

/** Normaliza para buscar sin tildes ni mayúsculas. */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const category = isCategory(params.cat) ? params.cat : undefined;
  const effortFilter = isEffortFilter(params.esf) ? params.esf : undefined;
  const sortKey: SortKey = isSortKey(params.orden) ? params.orden : "bono";
  const query = (params.q ?? "").slice(0, 60);

  // Hay pocas ofertas: se cargan todas las activas una vez y se filtran aquí, con los datos guardados de cada una.
  const [all, withPayroll, reviews] = await Promise.all([
    db.promotion.findMany({ where: activePromoWhere(), include: { entity: true } }),
    db.promotion.count({ where: { ...activePromoWhere(), requiresPayroll: true } }),
    db.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, text: true, createdAt: true, promotion: { select: { entity: { select: { name: true } } } } },
    }),
  ]);
  const allWithoutPayroll = withPayroll === 0;
  const totalCents = all.reduce((sum, p) => sum + p.bonusCents, 0);
  const worked = all.reduce((sum, p) => sum + p.workedCount, 0);
  const breakdown = [...all].sort((a, b) => b.bonusCents - a.bonusCents);
  const nonCash = breakdown.filter((b) => b.rewardType !== "CASH").map((b) => b.entity.name);

  const q = norm(query);
  const promos = all
    .filter((p) => !category || p.entity.category === category)
    .filter((p) => !effortFilter || EFFORT_FILTER_TEST[effortFilter](p))
    .filter((p) => !q || norm(p.entity.name).includes(q) || norm(p.title).includes(q))
    .sort((a, b) => {
      // La opción estrella va siempre la primera.
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      switch (sortKey) {
        case "facil":
          return a.steps.length - b.steps.length || b.bonusCents - a.bonusCents;
        case "revisadas":
          return (b.lastReviewedAt?.getTime() ?? 0) - (a.lastReviewedAt?.getTime() ?? 0) || b.bonusCents - a.bonusCents;
        case "caducan":
          return (a.expiresAt?.getTime() ?? Infinity) - (b.expiresAt?.getTime() ?? Infinity) || b.bonusCents - a.bonusCents;
        default:
          return b.bonusCents - a.bonusCents;
      }
    });

  const link = (next: Search) => {
    const s = new URLSearchParams();
    const merged: Search = { cat: category, esf: effortFilter, orden: sortKey, q: query, ...next };
    if (merged.cat) s.set("cat", merged.cat);
    if (merged.esf) s.set("esf", merged.esf);
    if (merged.q) s.set("q", merged.q);
    if (merged.orden && merged.orden !== "bono") s.set("orden", merged.orden);
    const str = s.toString();
    return `/${str ? `?${str}` : ""}#ofertas`;
  };

  // Solo se muestran los filtros que tienen alguna oferta: un filtro vacío solo confunde.
  const noFilter = !category && !effortFilter;
  const chips = [
    { key: "todas", label: "Todas", href: link({ cat: undefined, esf: undefined }), on: noFilter, count: all.length },
    ...Object.entries(EFFORT_FILTERS).map(([key, label]) => ({
      key,
      label,
      href: link({ cat: undefined, esf: key }),
      on: effortFilter === key,
      count: all.filter(EFFORT_FILTER_TEST[key as keyof typeof EFFORT_FILTERS]).length,
    })),
    ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
      key,
      label,
      href: link({ cat: key, esf: undefined }),
      on: category === key,
      count: all.filter((p) => p.entity.category === key).length,
    })),
  ].filter((c) => c.count > 0 || c.on);

  const faqs: [string, string][] = [
    [
      "¿Es dinero garantizado?",
      "No. Es una recompensa que la entidad paga a los clientes nuevos que cumplen sus condiciones. Si no cumples un paso o un plazo, o ya has sido cliente, puede no pagarla.",
    ],
    [
      "¿Tengo que domiciliar la nómina?",
      allWithoutPayroll
        ? "No. Ninguna de las ofertas actuales pide domiciliar la nómina."
        : "En las marcadas con «✓ Sin nómina», no. Las que la piden lo indican en su tarjeta.",
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
                <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-xs font-black text-ink">✓</span>
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
        <form action="/" method="get" role="search" className="flex flex-wrap items-center gap-2">
          {category && <input type="hidden" name="cat" value={category} />}
          {effortFilter && <input type="hidden" name="esf" value={effortFilter} />}
          <label htmlFor="buscar" className="sr-only">Buscar entidad</label>
          <input
            id="buscar"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Buscar entidad (Openbank, Revolut…)"
            className="input min-w-0 flex-1 basis-56"
          />
          <label htmlFor="orden" className="sr-only">Ordenar por</label>
          <AutoSubmitSelect
            id="orden"
            name="orden"
            defaultValue={sortKey}
            className="input w-auto"
            options={Object.entries(SORT_OPTIONS).map(([value, label]) => ({ value, label }))}
          />
          <button type="submit" className="btn btn-ghost">Buscar</button>
        </form>

        <nav aria-label="Filtrar ofertas" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((c) => (
            <Link key={c.key} href={c.href} className={`chip shrink-0 ${c.on ? "chip-on" : ""}`} aria-current={c.on ? "true" : undefined}>
              {c.label}
              <span className={`ml-1.5 text-xs ${c.on ? "text-white/80" : "text-muted"}`}>{c.count}</span>
            </Link>
          ))}
        </nav>

        {query && (
          <p className="mt-3 text-sm text-muted">
            {promos.length} {promos.length === 1 ? "resultado" : "resultados"} para «{query}».{" "}
            <Link href={link({ q: undefined })} className="font-semibold text-brand underline">Quitar búsqueda</Link>
          </p>
        )}

        {promos.length === 0 ? (
          <div className="card mt-4 p-6 text-center">
            <p className="font-semibold">No hay ofertas que cumplan estos filtros.</p>
            <p className="mt-2">
              <Link href="/#ofertas" className="btn btn-primary btn-sm">Ver todas</Link>
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {promos.map((p) => (
              <li key={p.id} className="flex">
                <PromoCard p={p} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">
          Las cantidades son las recompensas anunciadas por cada entidad para nuevos clientes. No son ganancias garantizadas.
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
