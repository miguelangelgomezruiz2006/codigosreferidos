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
  bono: { label: "Mayor bono", orderBy: [{ bonusCents: "desc" as const }, { createdAt: "desc" as const }] },
  caducan: { label: "Acaban antes", orderBy: [{ expiresAt: { sort: "asc" as const, nulls: "last" as const } }] },
  nuevas: { label: "Más nuevas", orderBy: [{ createdAt: "desc" as const }] },
};

export default async function Home({ searchParams }: { searchParams: Promise<{ cat?: string; orden?: string; esf?: string }> }) {
  const { cat, orden, esf } = await searchParams;
  const effortFilter = isEffortFilter(esf) ? esf : undefined;
  const category = isCategory(cat) ? cat : undefined;
  const sortKey = orden && orden in SORTS ? (orden as keyof typeof SORTS) : "bono";

  const where: Prisma.PromotionWhereInput = {
    AND: [activePromoWhere(), category ? { entity: { category } } : {}, effortFilter ? EFFORT_WHERE[effortFilter] : {}],
  };
  const [promos, totals, breakdown] = await Promise.all([
    db.promotion.findMany({
      where,
      // La opción estrella va siempre la primera.
      orderBy: [{ featured: "desc" }, ...SORTS[sortKey].orderBy],
      include: { entity: true, _count: { select: { codes: { where: { status: "APPROVED" } } } } },
    }),
    db.promotion.aggregate({ where: activePromoWhere(), _sum: { bonusCents: true }, _count: true }),
    db.promotion.findMany({
      where: activePromoWhere(),
      orderBy: { bonusCents: "desc" },
      select: { id: true, bonusCents: true, rewardType: true, entity: { select: { name: true } } },
    }),
  ]);
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

  return (
    <>
      <section className="bg-brand pb-7 pt-6 text-white sm:pb-8">
        <div className="wrap">
          <h1 className="max-w-2xl text-[28px] font-extrabold leading-tight sm:text-4xl">
            Gana dinero con las promociones de bancos y fintechs
          </h1>
          <p className="mt-3 max-w-2xl text-white/85">
            Requisitos explicados paso a paso y un código de invitación listo para copiar. Sin registrarte.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
          {totals._count > 0 && (
            <p className="inline-flex flex-wrap items-baseline gap-x-2 rounded-xl bg-white/10 px-4 py-3">
              <span className="text-2xl font-extrabold text-accent">{fmtEuros(totals._sum.bonusCents ?? 0)}</span>
              <span className="text-sm text-white/85">
                en bonos sumando las {totals._count} promociones activas
              </span>
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

      <div className="wrap mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <p className="font-semibold">No hay promociones activas{category || effortFilter ? " con estos filtros" : ""} ahora mismo.</p>
            <p className="hint mt-1">Vuelve pronto o mira las <Link href="/caducadas" className="underline">promociones caducadas</Link>.</p>
          </div>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promos.map((p) => (
              <li key={p.id} className="flex">
                <PromoCard p={{ ...p, codeCount: p._count.codes }} />
              </li>
            ))}
          </ul>
        )}

        <section className="card mt-10 p-5" aria-labelledby="como">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="como" className="text-lg font-bold">Cómo funciona</h2>
            <Link href="/como-funciona" className="text-sm font-semibold text-brand underline-offset-2 hover:underline">Guía completa →</Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Elige una promoción", "Ordenadas por bono. Cada ficha explica los requisitos sin letra pequeña."],
            ["2", "Copia el código", "Te damos un código de invitación que funciona. Si falla, pide otro con un toque."],
            ["3", "Cumple los pasos", "Abre la cuenta con el código y cumple los requisitos para cobrar el bono."],
          ].map(([n, t, d]) => (
            <div key={n} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent font-extrabold">{n}</span>
              <div>
                <p className="font-bold">{t}</p>
                <p className="hint">{d}</p>
              </div>
            </div>
          ))}
          </div>
        </section>
      </div>
    </>
  );
}
