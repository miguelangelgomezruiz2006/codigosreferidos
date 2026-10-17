import Link from "next/link";
import { EntityLogo } from "@/components/EntityLogo";
import { RiskBadge } from "@/components/RiskNotice";
import { daysLeft, fmtShortDate } from "@/lib/format";
import { CATEGORY_LABELS, EFFORT_LABELS, REWARD_LABELS, type EffortKey, type RewardKey } from "@/lib/site";

export interface PromoCardData {
  slug: string;
  title: string;
  bonusText: string;
  expiresAt: Date | null;
  steps?: string[];
  risk?: "NONE" | "INVESTMENT" | "CRYPTO";
  featured?: boolean;
  requiresPayroll?: boolean;
  entity: { name: string; logoUrl: string | null; color: string; category: keyof typeof CATEGORY_LABELS };
  expired?: boolean;
  effort?: EffortKey;
  requirementText?: string;
  rewardType?: RewardKey;
  workedCount?: number;
}

function CheckIcon() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Qué hay que hacer, cuántos pasos y en qué se cobra: para comparar ofertas de un vistazo. */
export function PromoFacts({ p, showPayroll = false }: { p: PromoCardData; showPayroll?: boolean }) {
  const steps = p.steps?.length ?? 0;
  const invest = p.effort === "INVEST";
  return (
    <ul className="contents" aria-label="Resumen de requisitos">
      {showPayroll && (
        <li>
          <PayrollBadge requiresPayroll={p.requiresPayroll} />
        </li>
      )}
      {p.effort && (
        <li className={`badge ${invest ? "bg-accent-soft text-ink ring-1 ring-accent/60" : "bg-brand-soft text-brand-dark"}`}>
          {p.requirementText || EFFORT_LABELS[p.effort]}
        </li>
      )}
      {steps > 0 && <li className="badge bg-bg text-ink">{steps} {steps === 1 ? "paso" : "pasos"}</li>}
      {p.rewardType && <li className="badge bg-bg text-ink">{REWARD_LABELS[p.rewardType]}</li>}
    </ul>
  );
}

export function WorkedLabel({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-brand-dark">
      <CheckIcon />
      {count} {count === 1 ? "persona lo ha cobrado" : "personas lo han cobrado"}
    </span>
  );
}

export function ExpiryLabel({ expiresAt, expired }: { expiresAt: Date | null; expired?: boolean }) {
  if (expired) return <span className="badge bg-line text-muted">Caducada</span>;
  if (!expiresAt) return <span className="text-muted">Sin fecha límite</span>;
  const days = daysLeft(expiresAt);
  if (days <= 7) return <span className="badge bg-danger-soft text-danger">¡Acaba en {days} {days === 1 ? "día" : "días"}!</span>;
  return <span className="text-muted">Hasta el {fmtShortDate(expiresAt)}</span>;
}

/** Etiqueta «Sin nómina» (o «Con nómina» si la promoción la exige). */
export function PayrollBadge({ requiresPayroll }: { requiresPayroll?: boolean }) {
  return requiresPayroll ? (
    <span className="badge bg-accent-soft text-ink">Pide domiciliar la nómina</span>
  ) : (
    <span className="badge bg-brand-soft text-brand-dark">✓ Sin nómina</span>
  );
}

export function PromoCard({ p }: { p: PromoCardData }) {
  const highlighted = p.featured && !p.expired;
  return (
    <Link
      href={`/promo/${p.slug}`}
      className={`card group relative flex w-full flex-col gap-3 p-4 transition-shadow hover:shadow-md focus-visible:shadow-md ${
        highlighted ? "border-2 border-accent shadow-md ring-4 ring-accent/20" : ""
      }`}
    >
      {highlighted && <span className="badge absolute -top-3 left-4 bg-accent px-3 py-1 text-ink shadow-sm">★ Opción estrella</span>}
      <div className="flex items-center gap-3">
        <EntityLogo name={p.entity.name} logoUrl={p.entity.logoUrl} color={p.entity.color} />
        <div className="min-w-0">
          <p className="font-bold leading-tight">{p.entity.name}</p>
          <p className="text-xs text-muted">{CATEGORY_LABELS[p.entity.category]}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{p.expired ? "Daban" : "Te dan"}</p>
        <p className={`text-2xl font-extrabold leading-tight ${p.expired ? "text-muted line-through" : "text-brand"}`}>{p.bonusText}</p>
      </div>
      <p className="text-sm leading-snug text-muted">{p.title}</p>
      {!p.expired && (
        <div className="flex flex-wrap gap-2">
          <PromoFacts p={p} showPayroll />
          {p.risk && p.risk !== "NONE" && <RiskBadge risk={p.risk} />}
        </div>
      )}
      {!p.expired && p.workedCount ? (
        <p className="text-xs">
          <WorkedLabel count={p.workedCount} />
        </p>
      ) : null}
      <div className="mt-auto pt-1 text-xs">
        <ExpiryLabel expiresAt={p.expiresAt} expired={p.expired} />
      </div>
      {!p.expired && <span className="btn btn-primary btn-sm w-full group-hover:bg-brand-dark">Ver cómo conseguirlo →</span>}
    </Link>
  );
}
