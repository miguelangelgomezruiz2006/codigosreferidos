import Link from "next/link";
import { EntityLogo } from "@/components/EntityLogo";
import { IconArrowRight, IconCheck, IconClock, IconShieldCheck, IconStar } from "@/components/Icons";
import { RiskBadge } from "@/components/RiskNotice";
import { daysLeft, fmtEuros, fmtShortDate } from "@/lib/format";
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
  requiredCents?: number | null;
  workedCount?: number;
  termsUrl?: string;
  lastReviewedAt?: Date | null;
}

/** Cuánto dinero pone el usuario, o «No indicado» si las condiciones no dan un importe. */
export function outlayText(p: Pick<PromoCardData, "requiredCents" | "effort">): string {
  if (p.requiredCents != null) return p.requiredCents === 0 ? "Nada" : fmtEuros(p.requiredCents);
  return p.effort === "NONE" ? "Nada" : "No indicado";
}

/** Revisión manual: fecha de la última comprobación o «Pendiente de revisión». Nunca se marca como revisada sin fecha. */
export function ReviewLabel({ lastReviewedAt }: { lastReviewedAt?: Date | null }) {
  return lastReviewedAt ? (
    <span className="inline-flex items-center gap-1 text-brand-dark">
      <IconShieldCheck size={14} />
      Revisada el {fmtShortDate(lastReviewedAt)}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted">
      <IconShieldCheck size={14} />
      Pendiente de revisión
    </span>
  );
}

/** Vigencia: hasta cuándo dura, si acaba pronto o si ha caducado. */
export function ValidityLabel({ expiresAt, expired }: { expiresAt: Date | null; expired?: boolean }) {
  if (expired) return <span className="badge bg-line text-muted">Caducada</span>;
  if (!expiresAt) {
    return (
      <span className="inline-flex items-center gap-1 text-muted">
        <IconClock size={14} />
        Sin fecha de fin
      </span>
    );
  }
  const days = daysLeft(expiresAt);
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-danger">
        <IconClock size={14} />
        Acaba en {days} {days === 1 ? "día" : "días"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted">
      <IconClock size={14} />
      Hasta el {fmtShortDate(expiresAt)}
    </span>
  );
}

/** Etiqueta de estado (ficha): caducada, acaba pronto, revisada o pendiente de revisión. */
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
      return <ReviewLabel lastReviewedAt={status.date} />;
    case "unverified":
      return <ReviewLabel lastReviewedAt={null} />;
  }
}

export function WorkedLabel({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-brand-dark">
      <IconCheck size={14} />
      {count} {count === 1 ? "ya lo ha cobrado" : "ya lo han cobrado"}
    </span>
  );
}

export function ExpiryLabel({ expiresAt, expired }: { expiresAt: Date | null; expired?: boolean }) {
  return <ValidityLabel expiresAt={expiresAt} expired={expired} />;
}

/** Etiqueta «Sin nómina» (o aviso si la promoción la exige). */
export function PayrollBadge({ requiresPayroll }: { requiresPayroll?: boolean }) {
  return requiresPayroll ? (
    <span className="badge bg-accent-soft text-ink">Pide domiciliar la nómina</span>
  ) : (
    <span className="badge gap-1 bg-brand-soft text-brand-dark">
      <IconCheck size={12} />
      Sin nómina
    </span>
  );
}

export function PromoCard({ p }: { p: PromoCardData }) {
  const status = offerStatus(p);
  const expired = status.kind === "expired";
  const highlighted = p.featured && !expired;
  const href = `/promo/${p.slug}`;
  const requirement = p.requirementText || (p.effort ? EFFORT_LABELS[p.effort] : "Consulta los requisitos");

  return (
    <article
      className={`card group relative flex w-full flex-col gap-3 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:shadow-md ${
        highlighted ? "mt-2 border-accent ring-2 ring-accent/40 sm:mt-0" : ""
      }`}
    >
      {highlighted && (
        <span className="badge absolute -top-3 left-3 gap-1 bg-accent px-2.5 py-1 text-ink shadow-sm">
          <IconStar size={12} />
          Opción estrella
        </span>
      )}

      <div className="flex items-center gap-3">
        <EntityLogo name={p.entity.name} logoUrl={p.entity.logoUrl} color={p.entity.color} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-muted">{p.entity.name}</p>
          <h3 className={`font-display text-xl font-bold leading-tight ${expired ? "text-muted line-through" : "text-ink"}`}>{p.bonusText}</h3>
        </div>
      </div>

      {!expired && (
        <dl className="grid gap-1.5 border-t border-line pt-3 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 text-muted">Qué haces</dt>
            <dd className="text-right font-semibold leading-snug">{requirement}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 text-muted">Pones tú</dt>
            <dd className="text-right font-semibold tabular-nums">{outlayText(p)}</dd>
          </div>
          {p.rewardType && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-muted">Recibes</dt>
              <dd className="text-right font-semibold">{REWARD_LABELS[p.rewardType]}</dd>
            </div>
          )}
        </dl>
      )}

      {/* Solo lo que cambia la decisión: que acaba pronto o que es una inversión con riesgo. */}
      {!expired && (status.kind === "soon" || (p.risk && p.risk !== "NONE")) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {status.kind === "soon" && <ValidityLabel expiresAt={p.expiresAt} />}
          {p.risk && p.risk !== "NONE" && <RiskBadge risk={p.risk} />}
        </div>
      )}

      <Link
        href={href}
        className={`btn mt-auto w-full after:absolute after:inset-0 after:rounded-xl ${expired ? "btn-ghost" : "btn-primary group-hover:bg-brand-dark"}`}
      >
        {expired ? "Ver cómo era" : "Ver cómo conseguirla"}
        {!expired && <IconArrowRight size={16} />}
      </Link>
    </article>
  );
}
