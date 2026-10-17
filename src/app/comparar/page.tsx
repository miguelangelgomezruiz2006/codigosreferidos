import type { Metadata } from "next";
import Link from "next/link";
import { EntityLogo } from "@/components/EntityLogo";
import { IconArrowRight, IconExternal } from "@/components/Icons";
import { PayrollBadge, ReviewLabel, ValidityLabel, WorkedLabel, outlayText } from "@/components/PromoCard";
import { RiskBadge } from "@/components/RiskNotice";
import { isPromoActive } from "@/lib/codes";
import { db } from "@/lib/db";
import { EFFORT_TAGS, REWARD_LABELS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Comparar ofertas",
  description: "Compara lado a lado recompensa, dinero necesario, requisitos y vigencia de varias promociones.",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ o?: string }> }) {
  const slugs = [...new Set((await searchParams).o?.split(",").map((s) => s.trim()).filter(Boolean) ?? [])].slice(0, 3);
  const found = slugs.length
    ? await db.promotion.findMany({ where: { slug: { in: slugs }, status: { not: "DRAFT" } }, include: { entity: true } })
    : [];
  // Se respeta el orden en que se eligieron.
  const promos = slugs.map((s) => found.find((p) => p.slug === s)).filter((p): p is (typeof found)[number] => !!p);

  if (promos.length < 2) {
    return (
      <div className="wrap mt-6 max-w-xl">
        <h1 className="text-2xl font-extrabold">Comparar ofertas</h1>
        <div className="card mt-4 flex flex-col items-start gap-3 p-5">
          <p>Elige al menos dos ofertas con el botón «Comparar» de cada tarjeta.</p>
          <Link href="/#ofertas" className="btn btn-primary btn-sm">
            Ir a las ofertas
          </Link>
        </div>
      </div>
    );
  }

  type Row = { label: string; cell: (p: (typeof promos)[number]) => React.ReactNode };
  const rows: Row[] = [
    { label: "Recompensa anunciada", cell: (p) => <span className="font-display text-lg font-bold text-brand">{p.bonusText}</span> },
    { label: "Pones tú", cell: (p) => <span className="font-semibold tabular-nums">{outlayText(p)}</span> },
    { label: "Qué haces", cell: (p) => p.requirementText || "Consulta los requisitos" },
    { label: "Tipo de requisito", cell: (p) => EFFORT_TAGS[p.effort] },
    { label: "Premio", cell: (p) => REWARD_LABELS[p.rewardType] },
    { label: "Pasos", cell: (p) => (p.steps.length ? p.steps.length : "—") },
    { label: "Nómina", cell: (p) => <PayrollBadge requiresPayroll={p.requiresPayroll} /> },
    { label: "Riesgo", cell: (p) => (p.risk === "NONE" ? <span className="text-muted">Sin aviso de riesgo</span> : <RiskBadge risk={p.risk} />) },
    { label: "Vigencia", cell: (p) => <ValidityLabel expiresAt={p.expiresAt} expired={!isPromoActive(p)} /> },
    { label: "Última revisión", cell: (p) => <ReviewLabel lastReviewedAt={p.lastReviewedAt} /> },
    { label: "Lo han cobrado", cell: (p) => (p.workedCount > 0 ? <WorkedLabel count={p.workedCount} /> : <span className="text-muted">Sin confirmaciones</span>) },
    {
      label: "Condiciones",
      cell: (p) => (
        <a href={p.termsUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-semibold text-brand underline">
          Oficiales <IconExternal size={14} />
        </a>
      ),
    },
  ];

  return (
    <div className="wrap mt-6">
      <Link href="/#ofertas" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline">
        ← Volver a las ofertas
      </Link>
      <h1 className="mt-1 text-2xl font-extrabold">Comparar {promos.length} ofertas</h1>
      <p className="hint mt-1">
        La recompensa es la que anuncia cada entidad, no una ganancia garantizada. «Pones tú» es el dinero que piden ingresar, gastar o invertir.
      </p>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <caption className="sr-only">Comparación de ofertas</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-32 bg-white p-3 text-left align-bottom text-xs font-semibold text-muted">
                Oferta
              </th>
              {promos.map((p) => (
                <th key={p.id} scope="col" className="min-w-40 p-3 text-left align-top">
                  <div className="flex items-center gap-2">
                    <EntityLogo name={p.entity.name} logoUrl={p.entity.logoUrl} color={p.entity.color} size={36} />
                    <span className="font-bold">{p.entity.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-line">
                <th scope="row" className="sticky left-0 z-10 bg-white p-3 text-left align-top text-xs font-semibold text-muted">
                  {r.label}
                </th>
                {promos.map((p) => (
                  <td key={p.id} className="p-3 align-top">
                    {r.cell(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 bg-white p-3" />
              {promos.map((p) => (
                <td key={p.id} className="p-3">
                  <div className="flex flex-col gap-2">
                    <Link href={`/promo/${p.slug}#codigo`} className="btn btn-primary btn-sm">
                      Conseguir <IconArrowRight size={14} />
                    </Link>
                    <Link href={`/promo/${p.slug}`} className="btn btn-ghost btn-sm">
                      Ver requisitos
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
