import Link from "next/link";
import { PromoCard } from "@/components/PromoCard";
import { activePromoWhere } from "@/lib/codes";
import { db } from "@/lib/db";
import { fmtEuros } from "@/lib/format";
import { CATEGORY_LABELS, isCategory } from "@/lib/site";

export const dynamic = "force-dynamic";

const SORTS = {
  bono: { label: "Mayor bono", orderBy: [{ bonusCents: "desc" as const }, { createdAt: "desc" as const }] },
  caducan: { label: "Acaban antes", orderBy: [{ expiresAt: { sort: "asc" as const, nulls: "last" as const } }] },
  nuevas: { label: "Más nuevas", orderBy: [{ createdAt: "desc" as const }] },
};

export default async function Home({ searchParams }: { searchParams: Promise<{ cat?: string; orden?: string }> }) {
  const { cat, orden } = await searchParams;
  const category = isCategory(cat) ? cat : undefined;
  const sortKey = orden && orden in SORTS ? (orden as keyof typeof SORTS) : "bono";

  const where = { ...activePromoWhere(), ...(category ? { entity: { category } } : {}) };
  const [promos, totals] = await Promise.all([
    db.promotion.findMany({
      where,
      // La opción estrella va siempre la primera.
      orderBy: [{ featured: "desc" }, ...SORTS[sortKey].orderBy],
      include: { entity: true, _count: { select: { codes: { where: { status: "APPROVED" } } } } },
    }),
    db.promotion.aggregate({ where: activePromoWhere(), _sum: { bonusCents: true }, _count: true }),
  ]);

  const link = (params: { cat?: string; orden?: string }) => {
    const q = new URLSearchParams();
    const c = "cat" in params ? params.cat : category;
    const o = "orden" in params ? params.orden : sortKey;
    if (c) q.set("cat", c);
    if (o && o !== "bono") q.set("orden", o);
    const s = q.toString();
    return s ? `/?${s}` : "/";
  };

  return (
    <>
      <section className="bg-brand pb-8 pt-6 text-white">
        <div className="wrap">
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Gana dinero con las promociones de bancos y fintechs
          </h1>
          <p className="mt-3 max-w-2xl text-white/85">
            Requisitos explicados paso a paso y un código de invitación listo para copiar. Sin registrarte.
          </p>
          {totals._count > 0 && (
            <p className="mt-5 inline-flex flex-wrap items-baseline gap-x-2 rounded-xl bg-white/10 px-4 py-3">
              <span className="text-2xl font-extrabold text-accent">{fmtEuros(totals._sum.bonusCents ?? 0)}</span>
              <span className="text-sm text-white/85">
                en bonos sumando las {totals._count} promociones activas
              </span>
            </p>
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
          <nav aria-label="Ordenar" className="flex items-center gap-1 text-sm">
            <span className="text-muted">Ordenar:</span>
            {Object.entries(SORTS).map(([key, s]) => (
              <Link
                key={key}
                href={link({ orden: key })}
                className={`rounded-md px-2 py-1 ${sortKey === key ? "bg-brand-soft font-semibold text-brand-dark" : "text-muted hover:text-ink"}`}
                aria-current={sortKey === key ? "true" : undefined}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>

        {promos.length === 0 ? (
          <div className="card mt-6 p-6 text-center">
            <p className="font-semibold">No hay promociones activas{category ? " en esta categoría" : ""} ahora mismo.</p>
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

        <section className="card mt-10 grid gap-4 p-5 sm:grid-cols-3">
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
        </section>
      </div>
    </>
  );
}
