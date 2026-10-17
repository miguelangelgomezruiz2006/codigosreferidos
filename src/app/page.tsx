import Link from "next/link";
import { PromoCard } from "@/components/PromoCard";
import { activePromoWhere } from "@/lib/codes";
import { db } from "@/lib/db";
import { fmtEuros } from "@/lib/format";
import { CATEGORY_LABELS, EFFORT_FILTERS, isCategory, isEffortFilter, type EffortFilterKey } from "@/lib/site";
import type { Prisma } from "@/generated/prisma/client";

const EFFORT_WHERE: Record<EffortFilterKey, Prisma.PromotionWhereInput> = {
  "sin-invertir": { effort: { not: "INVEST" } },
  efectivo: { rewardType: "CASH" },
};

export const dynamic = "force-dynamic";

const SORTS = {
  bono: { label: "Más dinero", orderBy: [{ bonusCents: "desc" as const }, { createdAt: "desc" as const }] },
  caducan: { label: "Acaban antes", orderBy: [{ expiresAt: { sort: "asc" as const, nulls: "last" as const } }] },
  nuevas: { label: "Más nuevas", orderBy: [{ createdAt: "desc" as const }] },
};

const HOW_IT_WORKS = [
  ["Elige una oferta", "Cada una dice cuánto te dan y qué tienes que hacer."],
  ["Copia el código", "Lo pegas al abrir la cuenta para que te den el regalo."],
  ["Sigue los pasos y cobra", "Cuando cumples lo que pide, te ingresan el dinero."],
];

export default async function Home({ searchParams }: { searchParams: Promise<{ cat?: string; orden?: string; esf?: string }> }) {
  const { cat, orden, esf } = await searchParams;
  const effortFilter = isEffortFilter(esf) ? esf : undefined;
  const category = isCategory(cat) ? cat : undefined;
  const sortKey = orden && orden in SORTS ? (orden as keyof typeof SORTS) : "bono";

  const where: Prisma.PromotionWhereInput = {
    AND: [activePromoWhere(), category ? { entity: { category } } : {}, effortFilter ? EFFORT_WHERE[effortFilter] : {}],
  };
  const [promos, totals, withPayroll, breakdown] = await Promise.all([
    db.promotion.findMany({
      where,
      // La opción estrella va siempre la primera.
      orderBy: [{ featured: "desc" }, ...SORTS[sortKey].orderBy],
      include: { entity: true },
    }),
    db.promotion.aggregate({ where: activePromoWhere(), _sum: { bonusCents: true }, _count: true }),
    db.promotion.count({ where: { ...activePromoWhere(), requiresPayroll: true } }),
    db.promotion.findMany({
      where: activePromoWhere(),
      orderBy: { bonusCents: "desc" },
      select: { id: true, bonusCents: true, rewardType: true, entity: { select: { name: true } } },
    }),
  ]);
  const allWithoutPayroll = withPayroll === 0;
  const nonCash = breakdown.filter((b) => b.rewardType !== "CASH").map((b) => b.entity.name);

  const link = (params: { cat?: string; orden?: string; esf?: string }) => {
    const q = new URLSearchParams();
    const c = "cat" in params ? params.cat : category;
    const o = "orden" in params ? params.orden : sortKey;
    const e = "esf" in params ? params.esf : effortFilter;
    if (c) q.set("cat", c);
    if (e) q.set("esf", e);
    if (o && o !== "bono") q.set("orden", o);
    const s = q.toString();
    return s ? `/?${s}` : "/";
  };

  const faqs: [string, string][] = [
    [
      "¿De verdad es dinero gratis?",
      "Sí. Los bancos y las apps pagan un regalo a los clientes nuevos que llegan invitados por otro cliente. Tú abres la cuenta con el código, cumples lo que piden y te ingresan el dinero.",
    ],
    [
      "¿Tengo que domiciliar la nómina?",
      allWithoutPayroll
        ? "No. Todas las ofertas de esta web son sin nómina."
        : "En las marcadas con «✓ Sin nómina», no. Las que la piden lo indican en su tarjeta.",
    ],
    [
      "¿Tengo que poner dinero?",
      "En algunas sí: un ingreso, una compra con la tarjeta o una pequeña inversión. En cada oferta te decimos exactamente cuánto y en qué plazo.",
    ],
    ["¿Me tengo que registrar en esta web?", "No. Entras, copias el código y listo. Solo hace falta cuenta si quieres compartir tu propio código."],
    ["¿Y si el código no funciona?", "Pulsa «Este código no funciona» y después «Dame otro código». Te daremos otro al momento."],
    ["¿Cuándo me pagan?", "Depende de cada entidad. Normalmente unos días o semanas después de cumplir los pasos. Lo verás en las condiciones de cada oferta."],
    ["¿Tengo que declararlo?", "Sí. Estos regalos suelen tributar en la declaración de la renta."],
  ];

  return (
    <>
      <section className="bg-brand pb-7 pt-6 text-white sm:pb-8">
        <div className="wrap">
          <p className="inline-flex rounded-full bg-accent px-3 py-1 text-sm font-bold text-ink">✓ {allWithoutPayroll ? "Todas sin nómina" : "Ofertas sin nómina"}</p>
          <h1 className="mt-3 max-w-2xl text-[28px] font-extrabold leading-tight sm:text-4xl">Dinero gratis por abrir cuentas en bancos y apps</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">
            Sin domiciliar la nómina. Te explicamos qué hacer paso a paso y te damos el código para que te paguen el regalo.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
          {totals._count > 0 && (
            <p className="inline-flex flex-wrap items-baseline gap-x-2 rounded-xl bg-white/10 px-4 py-3">
              <span className="text-sm text-white/90">Puedes ganar hasta</span>
              <span className="text-2xl font-extrabold text-accent">{fmtEuros(totals._sum.bonusCents ?? 0)}</span>
              <span className="text-sm text-white/90">si haces las {totals._count} ofertas</span>
            </p>
          )}
            <Link href="/como-funciona" className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-white underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
              ¿Cómo funciona? Te lo explicamos en 1 minuto →
            </Link>
          </div>
          {breakdown.length > 0 && (
            <details className="group mt-3 max-w-xl text-sm">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 text-white/85 underline underline-offset-4 hover:text-white [&::-webkit-details-marker]:hidden">
                ¿De dónde sale esta cifra?
              </summary>
              <div className="mt-1 rounded-xl bg-white/10 p-4">
                <p className="text-white/90">
                  Es la suma de los bonos anunciados de todas las promociones activas. Solo cobras cada uno si cumples sus requisitos y, normalmente, si
                  nunca has sido cliente de esa entidad. No es un beneficio garantizado.
                </p>
                <ul className="mt-3 grid gap-1">
                  {breakdown.map((b) => (
                    <li key={b.id} className="flex justify-between gap-3 border-b border-white/10 pb-1">
                      <span>{b.entity.name}</span>
                      <span className="font-semibold tabular-nums">{fmtEuros(b.bonusCents)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-3 pt-1 font-extrabold text-accent">
                    <span>Total</span>
                    <span className="tabular-nums">{fmtEuros(totals._sum.bonusCents ?? 0)}</span>
                  </li>
                </ul>
                {nonCash.length > 0 && (
                  <p className="mt-3 text-white/80">Incluye premios que no son en efectivo (cashback o criptomonedas): {nonCash.join(", ")}.</p>
                )}
              </div>
            </details>
          )}
        </div>
      </section>

      <section aria-label="Cómo funciona" className="border-b border-line bg-white">
        <ol className="wrap grid gap-3 py-4 sm:grid-cols-3">
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

      <div className="wrap mt-6">
        <h2 className="text-xl font-extrabold">Ofertas disponibles</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Filtrar por tipo" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <Link href={link({ cat: undefined })} className={`chip shrink-0 ${!category ? "chip-on" : ""}`} aria-current={!category ? "page" : undefined}>
              Todas
            </Link>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Link key={key} href={link({ cat: key })} className={`chip shrink-0 ${category === key ? "chip-on" : ""}`} aria-current={category === key ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Ordenar" className="-mx-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap px-4 text-sm sm:mx-0 sm:px-0">
            <span className="text-muted">Ordenar:</span>
            {Object.entries(SORTS).map(([key, s]) => (
              <Link
                key={key}
                href={link({ orden: key })}
                className={`rounded-md px-2 py-2 ${sortKey === key ? "bg-brand-soft font-semibold text-brand-dark" : "text-muted hover:text-ink"}`}
                aria-current={sortKey === key ? "true" : undefined}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav aria-label="Filtrar por esfuerzo" className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <span className="shrink-0 text-sm text-muted">Filtrar:</span>
          {Object.entries(EFFORT_FILTERS).map(([key, label]) => {
            const on = effortFilter === key;
            return (
              <Link key={key} href={link({ esf: on ? undefined : key })} className={`chip shrink-0 ${on ? "chip-on" : ""}`} aria-current={on ? "true" : undefined}>
                {on ? `✕ ${label}` : label}
              </Link>
            );
          })}
        </nav>

        {promos.length === 0 ? (
          <div className="card mt-6 p-6 text-center">
            <p className="font-semibold">No hay ofertas activas{category || effortFilter ? " con estos filtros" : ""} ahora mismo.</p>
            <p className="hint mt-1">
              Vuelve pronto o mira las <Link href="/caducadas" className="underline">ofertas que ya terminaron</Link>.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {promos.map((p) => (
              <li key={p.id} className="flex">
                <PromoCard p={p} />
              </li>
            ))}
          </ul>
        )}

        <section aria-labelledby="faq" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="faq" className="text-xl font-extrabold">Preguntas frecuentes</h2>
            <Link href="/como-funciona" className="text-sm font-semibold text-brand underline-offset-2 hover:underline">Guía completa →</Link>
          </div>
          <div className="card mt-3 divide-y divide-line">
            {faqs.map(([q, a]) => (
              <details key={q} className="group px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {q}
                  <span aria-hidden className="text-xl text-brand transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
