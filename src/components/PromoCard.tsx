import Link from "next/link";
import { EntityLogo } from "@/components/EntityLogo";
import { RiskBadge } from "@/components/RiskNotice";
import { daysLeft, fmtShortDate } from "@/lib/format";
import { CATEGORY_LABELS, EFFORT_LABELS, REWARD_LABELS, offerStatus, type EffortKey, type OfferStatus, type RewardKey } from "@/lib/site";

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
  termsUrl?: string;
  lastReviewedAt?: Date | null;
}

/** Etiqueta de estado: caducada, acaba pronto, revisada (con fecha) o pendiente de verificar. */
export function StatusLabel({ status }: { status: OfferStatus }) {
  switch (status.kind) {
    case "expired":
      return <span className="badge bg-line text-muted">Caducada</span>;
    case "soon":
      return (
        <span className="badge bg-danger-soft text-danger">
          Acaba en {status.days} {status.days === 1 ? "día" : "días"}
        </span>
      );
    case "reviewed":
      return <span className="text-muted">Revisada el {fmtShortDate(status.date)}</span>;
    case "unverified":
      return <span className="text-muted">Pendiente de verificar</span>;
  }
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
  const status = offerStatus(p);
  const expired = status.kind === "expired";
  const highlighted = p.featured && !expired;
  const steps = p.steps?.length ?? 0;
  return (
    <article
      className={`card group relative flex w-full flex-col gap-2 p-3 transition-shadow focus-within:shadow-md hover:shadow-md sm:gap-3 sm:p-4 ${
        highlighted ? "mt-2 border-2 border-accent shadow-md ring-4 ring-accent/20 sm:mt-0" : ""
      }`}
    >
      {highlighted && <span className="badge absolute -top-3 left-3 bg-accent px-3 py-1 text-ink shadow-sm">★ Opción estrella</span>}
      <div className="flex items-center gap-3">
        <EntityLogo name={p.entity.name} logoUrl={p.entity.logoUrl} color={p.entity.color} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-muted">{p.entity.name}</p>
          <h3 className={`text-xl font-extrabold leading-tight sm:text-2xl ${expired ? "text-muted line-through" : "text-brand"}`}>
            {/* El enlace cubre toda la tarjeta; el de condiciones queda por encima. */}
            <Link href={`/promo/${p.slug}`} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none">
              {p.bonusText}
            </Link>
          </h3>
        </div>
        {!expired && (
          <span aria-hidden className="text-2xl font-bold text-brand sm:hidden">
            ›
          </span>
        )}
      </div>

      {!expired && p.effort && (
        <p className="text-sm leading-snug">
          <span className="text-muted">Qué haces: </span>
          <strong>{p.requirementText || EFFORT_LABELS[p.effort]}</strong>
        </p>
      )}

      {!expired && (
        <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" aria-label="Resumen">
          <li>
            <PayrollBadge requiresPayroll={p.requiresPayroll} />
          </li>
          {p.rewardType && <li className="badge bg-bg text-ink">{REWARD_LABELS[p.rewardType]}</li>}
          {steps > 0 && <li className="badge bg-bg text-ink">{steps} {steps === 1 ? "paso" : "pasos"}</li>}
          {p.risk && p.risk !== "NONE" && (
            <li>
              <RiskBadge risk={p.risk} />
            </li>
          )}
          {p.workedCount ? (
            <li>
              <WorkedLabel count={p.workedCount} />
            </li>
          ) : null}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1 text-xs">
        <StatusLabel status={status} />
        {p.termsUrl && (
          <a
            href={p.termsUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="relative z-10 font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
          >
            Condiciones oficiales ↗
          </a>
        )}
      </div>
      {!expired && (
        <span aria-hidden className="btn btn-primary hidden w-full group-hover:bg-brand-dark sm:flex">
          Ver oferta →
        </span>
      )}
    </article>
  );
}
