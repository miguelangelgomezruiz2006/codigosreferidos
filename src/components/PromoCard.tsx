import Link from "next/link";
import { EntityLogo } from "@/components/EntityLogo";
import { daysLeft, fmtShortDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/site";

export interface PromoCardData {
  slug: string;
  title: string;
  bonusText: string;
  expiresAt: Date | null;
  entity: { name: string; logoUrl: string | null; color: string; category: keyof typeof CATEGORY_LABELS };
  codeCount: number;
  expired?: boolean;
}

export function ExpiryLabel({ expiresAt, expired }: { expiresAt: Date | null; expired?: boolean }) {
  if (expired) return <span className="badge bg-line text-muted">Caducada</span>;
  if (!expiresAt) return <span className="text-muted">Sin fecha de fin anunciada</span>;
  const days = daysLeft(expiresAt);
  if (days <= 7) return <span className="badge bg-danger-soft text-danger">Acaba en {days} {days === 1 ? "día" : "días"}</span>;
  return <span className="text-muted">Hasta el {fmtShortDate(expiresAt)}</span>;
}

export function PromoCard({ p }: { p: PromoCardData }) {
  return (
    <Link
      href={`/promo/${p.slug}`}
      className="card group flex flex-col gap-3 p-4 transition-shadow hover:shadow-md focus-visible:shadow-md"
    >
      <div className="flex items-center gap-3">
        <EntityLogo name={p.entity.name} logoUrl={p.entity.logoUrl} color={p.entity.color} />
        <div className="min-w-0">
          <p className="font-bold leading-tight">{p.entity.name}</p>
          <p className="text-xs text-muted">{CATEGORY_LABELS[p.entity.category]}</p>
        </div>
      </div>
      <p className={`text-2xl font-extrabold leading-tight ${p.expired ? "text-muted line-through" : "text-brand"}`}>{p.bonusText}</p>
      <p className="text-sm leading-snug">{p.title}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <ExpiryLabel expiresAt={p.expiresAt} expired={p.expired} />
        {!p.expired && (
          <span className="text-muted">
            {p.codeCount > 0 ? `${p.codeCount} ${p.codeCount === 1 ? "código" : "códigos"}` : "Sin códigos aún"}
          </span>
        )}
      </div>
      {!p.expired && (
        <span className="btn btn-primary btn-sm w-full group-hover:bg-brand-dark">Ver requisitos y código</span>
      )}
    </Link>
  );
}
