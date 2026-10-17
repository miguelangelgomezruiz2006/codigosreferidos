import Link from "next/link";
import { EntityLogo } from "@/components/EntityLogo";
import { IconArrowRight, IconCheck, IconClock, IconColumns, IconShieldCheck, IconStar } from "@/components/Icons";
import { RiskBadge } from "@/components/RiskNotice";
import { daysLeft, fmtEuros, fmtShortDate } from "@/lib/format";
import { CATEGORY_LABELS, EFFORT_LABELS, EFFORT_TAGS, REWARD_LABELS, offerStatus, type EffortKey, type OfferStatus, type RewardKey } from "@/lib/site";

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

/** Etiqueta del tipo de requisito. «Con inversión» se distingue en ámbar porque implica riesgo. */
function EffortTag({ effort }: { effort: EffortKey }) {
  const tone = effort === "INVEST" ? "bg-accent-soft text-ink ring-1 ring-accent/50" : "bg-bg text-ink ring-1 ring-line";
  return <span className={`badge ${tone}`}>{EFFORT_TAGS[effort]}</span>;
}

export interface CompareControl {
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export function PromoCard({ p, compare }: { p: PromoCardData; compare?: CompareControl }) {
  const status = offerStatus(p);
  const expired = status.kind === "expired";
  const highlighted = p.featured && !expired;
  const steps = p.steps?.length ?? 0;
  const href = `/promo/${p.slug}`;

  return (
    <article
      className={`card group relative flex w-full flex-col gap-3 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:shadow-md ${
        highlighted ? "mt-2 border-accent ring-2 ring-accent/40 sm:mt-0" : ""
      } ${compare?.selected ? "ring-2 ring-brand" : ""}`}
    >
      {highlighted && (
        <span className="badge absolute -top-3 left-3 gap-1 bg-accent px-2.5 py-1 text-ink shadow-sm">
          <IconStar size={12} />
          Opción estrella
        </span>
      )}

      <div className="flex items-start gap-3">
        <EntityLogo name={p.entity.name} logoUrl={p.entity.logoUrl} color={p.entity.color} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-muted">{p.entity.name}</p>
          <h3 className={`font-display text-xl font-bold leading-tight ${expired ? "text-muted line-through" : "text-ink"}`}>{p.bonusText}</h3>
        </div>
        {compare && !expired && (
          <button
            type="button"
            onClick={compare.onToggle}
            disabled={compare.disabled && !compare.selected}
            aria-pressed={compare.selected}
            className={`relative z-10 inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              compare.selected ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand"
            }`}
            title={compare.disabled && !compare.selected ? "Puedes comparar hasta 3 ofertas" : undefined}
          >
            {compare.selected ? <IconCheck size={14} /> : <IconColumns size={14} />}
            {compare.selected ? "Comparando" : "Comparar"}
          </button>
        )}
      </div>

      {!expired && (
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-lg bg-bg px-3 py-2 text-sm">
          <dt className="text-xs text-muted">Qué haces</dt>
          <dt className="text-right text-xs text-muted">Pones tú</dt>
          <dd className="font-semibold leading-snug">{p.requirementText || (p.effort ? EFFORT_LABELS[p.effort] : "Consulta los requisitos")}</dd>
          <dd className="text-right font-semibold tabular-nums">{outlayText(p)}</dd>
        </dl>
      )}

      {!expired && (
        <ul className="flex flex-wrap items-center gap-1.5 text-xs" aria-label="Características">
          {p.effort && (
            <li>
              <EffortTag effort={p.effort} />
            </li>
          )}
          {p.rewardType && <li className="badge bg-bg text-ink ring-1 ring-line">Premio {REWARD_LABELS[p.rewardType].toLowerCase()}</li>}
          <li>
            <PayrollBadge requiresPayroll={p.requiresPayroll} />
          </li>
          {steps > 0 && <li className="badge bg-bg text-ink ring-1 ring-line">{steps} {steps === 1 ? "paso" : "pasos"}</li>}
          {p.risk && p.risk !== "NONE" && (
            <li>
              <RiskBadge risk={p.risk} />
            </li>
          )}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <ValidityLabel expiresAt={p.expiresAt} expired={expired} />
        {!expired && <ReviewLabel lastReviewedAt={p.lastReviewedAt} />}
        {!expired && p.workedCount ? <WorkedLabel count={p.workedCount} /> : null}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2">
        {/* «Ver requisitos» cubre toda la tarjeta; los demás controles quedan por encima. */}
        <Link
          href={href}
          className={`btn btn-ghost btn-sm after:absolute after:inset-0 after:rounded-xl ${expired ? "col-span-2" : ""}`}
          aria-label={`Ver requisitos de ${p.entity.name}`}
        >
          Ver requisitos
        </Link>
        {!expired && (
          <Link href={`${href}#codigo`} className="btn btn-primary btn-sm relative z-10" aria-label={`Conseguir la recompensa de ${p.entity.name}`}>
            Conseguir
            <IconArrowRight size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}
