import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBox } from "@/components/CodeBox";
import { EntityLogo } from "@/components/EntityLogo";
import { ExpiryLabel, WorkedLabel } from "@/components/PromoCard";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { Testimonios } from "@/components/Testimonios";
import { WorkedButton } from "@/components/WorkedButton";
import { testimoniosFor } from "@/lib/testimonios";
import { RiskNotice } from "@/components/RiskNotice";
import { isPromoActive } from "@/lib/codes";
import { db } from "@/lib/db";
import { daysLeft, fmtDate, fmtShortDate } from "@/lib/format";
import { guideFor } from "@/lib/signup-guides";
import { REWARD_LABELS, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const promo = await db.promotion.findUnique({
    where: { slug },
    include: { entity: true },
  });
  // Los borradores no existen para el público.
  if (!promo || promo.status === "DRAFT") return null;
  return promo;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const promo = await load((await params).slug);
  if (!promo) return { title: "Promoción no encontrada" };
  return {
    title: `Código promocional ${promo.entity.name}: ${promo.bonusText}`,
    description: `${promo.title}. Requisitos paso a paso y código de invitación de ${promo.entity.name} listo para copiar.`,
  };
}

export default async function PromoPage({ params }: Props) {
  const promo = await load((await params).slug);
  if (!promo) notFound();
  const active = isPromoActive(promo);
  const { entity } = promo;
  const reviews = await db.review.findMany({
    where: { promotionId: promo.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, name: true, text: true, createdAt: true },
  });

  return (
    <div className="wrap mt-4">
      <Link href="/#ofertas" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline">← Todas las ofertas</Link>

      <div className="mt-4 grid gap-4 sm:gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <header className="card p-4 sm:p-5 lg:col-start-1">
            <div className="flex items-center gap-3">
              <EntityLogo name={entity.name} logoUrl={entity.logoUrl} color={entity.color} size={56} />
              <div>
                <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">{entity.name}</h1>
                {promo.featured && active && <span className="badge mt-1 bg-accent text-ink">★ Opción estrella</span>}
              </div>
            </div>
            {active ? (
              <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-brand-soft p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-brand-dark">Te dan</dt>
                  <dd className="text-xl font-extrabold leading-tight text-brand">{promo.bonusText}</dd>
                </div>
                <div className="rounded-lg bg-bg p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Nómina</dt>
                  <dd className="text-lg font-bold leading-tight">{promo.requiresPayroll ? "Hay que domiciliarla" : "✓ No hace falta"}</dd>
                </div>
                <div className="rounded-lg bg-bg p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Plazo</dt>
                  <dd className="text-lg font-bold leading-tight">
                    {promo.expiresAt ? (
                      <>
                        Hasta el {fmtShortDate(promo.expiresAt)}
                        {daysLeft(promo.expiresAt) <= 7 && <span className="block text-sm text-danger">¡Quedan {daysLeft(promo.expiresAt)} días!</span>}
                      </>
                    ) : (
                      "Sin fecha límite"
                    )}
                  </dd>
                </div>
              </dl>
            ) : (
              <>
                <p className="mt-4 text-3xl font-extrabold text-muted line-through">{promo.bonusText}</p>
                <div className="mt-2 text-sm">
                  <ExpiryLabel expiresAt={promo.expiresAt} expired />
                </div>
              </>
            )}
            {active && (
              <div className="mt-3 flex flex-col gap-1 text-sm">
                {promo.requirementText && (
                  <p>
                    <span className="text-muted">Qué haces: </span>
                    <strong>{promo.requirementText}</strong>
                    {promo.rewardType !== "CASH" && <span className="text-muted"> · premio {REWARD_LABELS[promo.rewardType].toLowerCase()}</span>}
                  </p>
                )}
                <WorkedLabel count={promo.workedCount} />
              </div>
            )}
            {promo.risk !== "NONE" && (
              <div className="mt-4">
                <RiskNotice risk={promo.risk} />
              </div>
            )}
          </header>

        {/* En el móvil, el código va justo después de la cabecera; en el ordenador, fijo a la derecha. */}
        <aside className="lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <CodePanel promo={promo} active={active} />
        </aside>

        <div className="flex flex-col gap-6 lg:col-start-1">

          {promo.steps.length > 0 && (
            <section className="card p-4 sm:p-5" aria-labelledby="pasos">
              <h2 id="pasos" className="text-lg font-bold">
                {active ? "Paso 2 · Haz esto para cobrar" : "Qué había que hacer"}
              </h2>
              <ol className="mt-4 flex flex-col gap-4">
                {promo.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {active && (
            <section className="card p-4 sm:p-5">
              <WorkedButton promotionId={promo.id} entityName={entity.name} initialCount={promo.workedCount} />
            </section>
          )}

          {active && <Testimonios items={testimoniosFor(entity.slug)} title={`Opiniones sobre ${entity.name}`} narrow />}

          {reviews.length > 0 && <ReviewList items={reviews} narrow />}

          <details id="opinar" className="card scroll-mt-20 p-4 sm:p-5">
            <summary className="cursor-pointer font-bold">Deja tu opinión sobre {entity.name}</summary>
            <div className="mt-4">
              <ReviewForm promos={[{ id: promo.id, label: entity.name }]} />
            </div>
          </details>

          <section className="flex flex-col gap-2 text-sm text-muted">
            <a href={promo.termsUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-brand underline underline-offset-4">
              Condiciones oficiales de {entity.name} ↗
            </a>
            {promo.lastReviewedAt && <p>Revisada el {fmtDate(promo.lastReviewedAt)}.</p>}
            <p>
              Las condiciones las fija {entity.name} y pueden cambiar. No es asesoramiento financiero. Los bonos suelen tributar en la renta.
            </p>
            {active && (
              <p>
                ¿Ya eres cliente de {entity.name}?{" "}
                <Link href={`/mi-panel?promo=${promo.slug}`} className="font-semibold text-brand underline underline-offset-4">Comparte tu código</Link>
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function CodePanel({
  promo,
  active,
}: {
  promo: { id: string; entity: { slug: string; name: string; website: string } };
  active: boolean;
}) {
  return (
    <div id="codigo" className="card scroll-mt-20 border-2 border-brand/30 p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-bold">{active ? "Paso 1 · Copia tu código" : "Código de invitación"}</h2>
      {active && <p className="hint mb-3">Lo necesitarás al abrir la cuenta de {promo.entity.name} para que te den el regalo.</p>}
      {active ? (
        <CodeBox promotionId={promo.id} entityName={promo.entity.name} siteName={SITE_NAME} guide={guideFor(promo.entity)} />
      ) : (
        <p className="note note-warn">Esta promoción ha caducado. Mira las <Link href="/" className="underline">promociones activas</Link>.</p>
      )}
    </div>
  );
}
