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
      {count} {count === 1 ? "ya lo ha cobrado" : "ya lo han cobrado"}
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
  const soon = p.expiresAt && !p.expired && daysLeft(p.expiresAt) <= 7;
  return (
    <Link
      href={`/promo/${p.slug}`}
      className={`card group relative flex w-full flex-col gap-2 p-3 transition-shadow hover:shadow-md focus-visible:shadow-md sm:gap-3 sm:p-4 ${
        highlighted ? "mt-2 border-2 border-accent shadow-md ring-4 ring-accent/20 sm:mt-0" : ""
      }`}
    >
      {highlighted && <span className="badge absolute -top-3 left-3 bg-accent px-3 py-1 text-ink shadow-sm">★ Opción estrella</span>}
      {/* Cabecera en una fila: logo, entidad y bono juntos para que la tarjeta ocupe poco en el móvil. */}
      <div className="flex items-center gap-3">
        <EntityLogo name={p.entity.name} logoUrl={p.entity.logoUrl} color={p.entity.color} size={44} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold leading-tight text-muted">
            <span className="truncate">{p.entity.name}</span>
            {(soon || p.expired) && (
              <span className="shrink-0 text-xs">
                <ExpiryLabel expiresAt={p.expiresAt} expired={p.expired} />
              </span>
            )}
          </p>
          <p className={`text-xl font-extrabold leading-tight sm:text-2xl ${p.expired ? "text-muted line-through" : "text-brand"}`}>{p.bonusText}</p>
        </div>
        {!p.expired && (
          <span aria-hidden className="text-2xl font-bold text-brand transition-transform group-hover:translate-x-0.5 sm:hidden">
            ›
          </span>
        )}
      </div>
      {!p.expired && p.effort && (
        <p className="text-sm leading-snug">
          <span className="text-muted">Qué haces: </span>
          <strong>{p.requirementText || EFFORT_LABELS[p.effort]}</strong>
        </p>
      )}
      {!p.expired && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <PayrollBadge requiresPayroll={p.requiresPayroll} />
          {p.rewardType && p.rewardType !== "CASH" && <span className="badge bg-bg text-ink">{REWARD_LABELS[p.rewardType]}</span>}
          {p.risk && p.risk !== "NONE" && <RiskBadge risk={p.risk} />}
          {p.workedCount ? <WorkedLabel count={p.workedCount} /> : null}
        </div>
      )}
      {/* En el móvil toda la tarjeta es el enlace (con la flecha); el botón solo se ve en pantallas grandes. */}
      {!p.expired && <span className="btn btn-primary mt-auto hidden w-full group-hover:bg-brand-dark sm:flex">Ver código y pasos →</span>}
    </Link>
  );
}
