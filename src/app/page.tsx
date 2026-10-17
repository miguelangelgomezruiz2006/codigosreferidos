import Link from "next/link";
import { PromoCard } from "@/components/PromoCard";
import { ReviewList } from "@/components/ReviewList";
import { Testimonios } from "@/components/Testimonios";
import { TESTIMONIOS } from "@/lib/testimonios";
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
  ["Elige una oferta", "Mira cuánto te dan y qué tienes que hacer."],
  ["Copia el código", "Pégalo al abrir la cuenta."],
  ["Cumple los pasos y cobra", "Te ingresan el regalo."],
];

export default async function Home({ searchParams }: { searchParams: Promise<{ cat?: string; orden?: string; esf?: string }> }) {
  const { cat, orden, esf } = await searchParams;
  const effortFilter = isEffortFilter(esf) ? esf : undefined;
  const category = isCategory(cat) ? cat : undefined;
  const sortKey = orden && orden in SORTS ? (orden as keyof typeof SORTS) : "bono";

  const where: Prisma.PromotionWhereInput = {
    AND: [activePromoWhere(), category ? { entity: { category } } : {}, effortFilter ? EFFORT_WHERE[effortFilter] : {}],
  };
  const [promos, totals, withPayroll, breakdown, reviews] = await Promise.all([
    db.promotion.findMany({
      where,
      // La opción estrella va siempre la primera.
      orderBy: [{ featured: "desc" }, ...SORTS[sortKey].orderBy],
      include: { entity: true },
    }),
    db.promotion.aggregate({ where: activePromoWhere(), _sum: { bonusCents: true, workedCount: true }, _count: true }),
    db.promotion.count({ where: { ...activePromoWhere(), requiresPayroll: true } }),
    db.promotion.findMany({
      where: activePromoWhere(),
      orderBy: { bonusCents: "desc" },
      select: { id: true, bonusCents: true, rewardType: true, entity: { select: { name: true } } },
    }),
    db.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, text: true, createdAt: true, promotion: { select: { entity: { select: { name: true } } } } },
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

  const total = fmtEuros(totals._sum.bonusCents ?? 0);
  const worked = totals._sum.workedCount ?? 0;
  const noFilter = !category && !effortFilter;
  const chips: { key: string; label: string; href: string; on: boolean }[] = [
    { key: "todas", label: "Todas", href: link({ cat: undefined, esf: undefined }), on: noFilter },
    ...Object.entries(EFFORT_FILTERS).map(([key, label]) => ({
      key,
      label,
      href: link({ cat: undefined, esf: key }),
      on: effortFilter === key,
    })),
    ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
      key,
      label,
      href: link({ cat: key, esf: undefined }),
      on: category === key,
    })),
  ];

  return (
    <>
      <section className="bg-brand pb-4 pt-4 text-white sm:pb-6 sm:pt-6">
        <div className="wrap">
          <h1 className="max-w-2xl text-2xl font-extrabold leading-tight sm:text-4xl">
            Abre la cuenta con nuestro código y cobra el regalo
          </h1>
          {totals._count > 0 && (
            <p className="mt-2 max-w-2xl text-white/90 sm:mt-3 sm:text-lg">
              Hasta <strong className="text-accent">{total}</strong> en {totals._count} ofertas.{" "}
              {allWithoutPayroll ? "Sin nómina" : "Ofertas sin nómina"} y sin registrarte.
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:mt-4">
            <a href="#ofertas" className="btn btn-accent hidden sm:inline-flex">Ver ofertas ↓</a>
            {worked > 0 && (
              <span className="font-semibold text-white">
                ✓ {worked} {worked === 1 ? "bono cobrado" : "bonos cobrados"} y confirmados
              </span>
            )}
          </div>
          {breakdown.length > 0 && (
            <details className="mt-1 max-w-xl text-sm">
              <summary className="inline-flex min-h-10 cursor-pointer list-none items-center text-white/80 underline underline-offset-4 hover:text-white [&::-webkit-details-marker]:hidden">
                ¿De dónde salen los {total}?
              </summary>
              <div className="mt-1 rounded-xl bg-white/10 p-4">
                <p className="text-white/90">
                  Es la suma de todas las ofertas activas. Cobras cada una si cumples sus pasos y, normalmente, si nunca has sido cliente.
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

      <div id="ofertas" className="wrap mt-3 scroll-mt-16 sm:mt-5">
        <nav aria-label="Filtrar ofertas" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((c) => (
            <Link key={c.key} href={c.href} className={`chip shrink-0 ${c.on ? "chip-on" : ""}`} aria-current={c.on ? "true" : undefined}>
              {c.label}
            </Link>
          ))}
        </nav>

        {promos.length === 0 ? (
          <div className="card mt-5 p-6 text-center">
            <p className="font-semibold">No hay ofertas con este filtro.</p>
            <p className="mt-2">
              <Link href="/" className="btn btn-primary btn-sm">Ver todas</Link>
            </p>
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {promos.map((p) => (
              <li key={p.id} className="flex">
                <PromoCard p={p} />
              </li>
            ))}
          </ul>
        )}

        <section aria-label="Cómo funciona" className="card mt-10 p-4 sm:p-5">
          <ol className="grid gap-4 sm:grid-cols-3">
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

        <Testimonios items={TESTIMONIOS} title="Ya lo han cobrado" className="mt-10" />

        {reviews.length > 0 && (
          <div className="mt-3">
            <ReviewList items={reviews.map((r) => ({ ...r, entityName: r.promotion.entity.name }))} />
          </div>
        )}
        <p className="mt-4">
          <Link href="/opinar" className="font-semibold text-brand underline underline-offset-4">¿Ya has cobrado? Cuéntalo aquí →</Link>
        </p>

        <section aria-labelledby="faq" className="mt-10">
          <h2 id="faq" className="text-xl font-extrabold">Dudas rápidas</h2>
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
            <Link href="/como-funciona" className="text-sm font-semibold text-brand underline-offset-2 hover:underline">Guía completa →</Link>
          </p>
        </section>
      </div>
    </>
  );
}
