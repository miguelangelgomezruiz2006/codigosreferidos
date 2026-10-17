import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBox } from "@/components/CodeBox";
import { EntityLogo } from "@/components/EntityLogo";
import { OfferReportForm } from "@/components/OfferReportForm";
import { ExpiryLabel, StatusLabel, ValidityLabel, outlayText } from "@/components/PromoCard";
import { ShareButton } from "@/components/ShareButton";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { Testimonios } from "@/components/Testimonios";
import { WorkedButton } from "@/components/WorkedButton";
import { testimoniosFor } from "@/lib/testimonios";
import { RiskNotice } from "@/components/RiskNotice";
import { isPromoActive } from "@/lib/codes";
import { db } from "@/lib/db";
import { guideFor } from "@/lib/signup-guides";
import { REWARD_LABELS, SITE_NAME, offerStatus } from "@/lib/site";

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
  const title = `Código amigo ${promo.entity.name}: ${promo.bonusText}`;
  const description = `${promo.title}.${promo.requirementText ? ` Qué hay que hacer: ${promo.requirementText.toLowerCase()}.` : ""} Requisitos paso a paso, condiciones oficiales y código de invitación listo para copiar.`;
  return {
    title,
    description,
    alternates: { canonical: `/promo/${promo.slug}` },
    openGraph: { title, description, url: `/promo/${promo.slug}`, type: "article" },
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

  const status = offerStatus(promo);

  return (
    <div className="wrap mt-3">
      <Link href="/#ofertas" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline">
        ← Todas las ofertas
      </Link>

      <div className="mt-2 grid gap-4 sm:gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <header className="card p-4 sm:p-6 lg:col-start-1">
          <div className="flex items-start gap-3">
            <EntityLogo name={entity.name} logoUrl={entity.logoUrl} color={entity.color} size={48} />
            <h1 className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-muted">{entity.name}</span>
              <span className={`block text-2xl font-bold leading-tight sm:text-3xl ${active ? "text-ink" : "text-muted line-through"}`}>
                {promo.bonusText}
              </span>
            </h1>
            {active && <ShareButton title={`${entity.name}: ${promo.bonusText}`} path={`/promo/${promo.slug}`} />}
          </div>

          {active ? (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
              <div className="col-span-2">
                <dt className="text-muted">Qué haces</dt>
                <dd className="font-semibold">{promo.requirementText || "Consulta los pasos"}</dd>
              </div>
              <div>
                <dt className="text-muted">Pones tú</dt>
                <dd className="font-semibold tabular-nums">{outlayText(promo)}</dd>
              </div>
              <div>
                <dt className="text-muted">Recibes</dt>
                <dd className="font-semibold">{REWARD_LABELS[promo.rewardType]}</dd>
              </div>
              <div>
                <dt className="text-muted">Plazo</dt>
                <dd className="font-semibold">
                  <ValidityLabel expiresAt={promo.expiresAt} />
                </dd>
              </div>
              <div>
                <dt className="text-muted">Nómina</dt>
                <dd className="font-semibold">{promo.requiresPayroll ? "Hay que domiciliarla" : "No hace falta"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm">
              <ExpiryLabel expiresAt={promo.expiresAt} expired />
            </p>
          )}
          {promo.summary && <p className="mt-4 leading-relaxed text-muted">{promo.summary}</p>}
          {promo.risk !== "NONE" && (
            <div className="mt-4">
              <RiskNotice risk={promo.risk} />
            </div>
          )}
        </header>

        {/* En el móvil, la acción principal va justo después de la cabecera; en el ordenador, fija a la derecha. */}
        <aside className="lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <CodePanel promo={promo} active={active} />
        </aside>

        <div className="flex flex-col gap-6 lg:col-start-1">
          {promo.steps.length > 0 && (
            <section className="card p-4 sm:p-6" aria-labelledby="pasos">
              <h2 id="pasos" className="text-lg font-bold">
                {active ? "Qué tienes que hacer" : "Qué había que hacer"}
              </h2>
              <ol className="mt-4 flex flex-col gap-4">
                {promo.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-dark">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="rounded-xl border border-line bg-white/60 p-4 text-sm sm:p-6" aria-labelledby="ten-en-cuenta">
            <h2 id="ten-en-cuenta" className="text-base font-bold">
              Ten en cuenta
            </h2>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 leading-relaxed text-muted">
              <li>Solo cobras si cumples todos los pasos y plazos. Si falta alguno, {entity.name} puede no pagar la recompensa.</li>
              <li>
                Quién puede participar, los plazos exactos y cuándo pagan están en las{" "}
                <a href={promo.termsUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-brand underline underline-offset-2">
                  condiciones oficiales
                </a>
                .
              </li>
              <li>Las recompensas suelen tributar en la renta. Esto no es asesoramiento financiero.</li>
            </ul>
            <p className="mt-3 text-xs">
              <StatusLabel status={status.kind === "soon" ? (promo.lastReviewedAt ? { kind: "reviewed", date: promo.lastReviewedAt } : { kind: "unverified" }) : status} />
              {!promo.lastReviewedAt && <span className="text-muted"> · Comprueba las condiciones oficiales antes de empezar.</span>}
            </p>
          </section>

          {active && (testimoniosFor(entity.slug).length > 0 || reviews.length > 0) && (
            <div className="flex flex-col gap-3">
              <Testimonios items={testimoniosFor(entity.slug)} title={`Opiniones sobre ${entity.name}`} narrow />
              {reviews.length > 0 && <ReviewList items={reviews} narrow />}
            </div>
          )}

          {active && (
            <section className="card flex flex-col gap-4 p-4 sm:p-6">
              <WorkedButton promotionId={promo.id} entityName={entity.name} initialCount={promo.workedCount} />
              <div className="flex flex-col gap-1 border-t border-line pt-3">
                <details id="opinar" className="scroll-mt-20 text-sm">
                  <summary className="inline-flex min-h-10 cursor-pointer list-none items-center font-semibold text-brand underline underline-offset-2 [&::-webkit-details-marker]:hidden">
                    Cuenta cómo te fue
                  </summary>
                  <div className="mt-2">
                    <ReviewForm promos={[{ id: promo.id, label: entity.name }]} />
                  </div>
                </details>
                <OfferReportForm promotionId={promo.id} />
                <p className="text-sm text-muted">
                  ¿Ya eres cliente de {entity.name}?{" "}
                  <Link href={`/mi-panel?promo=${promo.slug}`} className="font-semibold text-brand underline underline-offset-2">
                    Comparte tu código
                  </Link>
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function CodePanel({
  promo,
  active,
}: {
  promo: { id: string; termsUrl: string; entity: { slug: string; name: string; website: string } };
  active: boolean;
}) {
  return (
    <div id="codigo" className="card scroll-mt-20 border-2 border-brand/40 p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-bold">{active ? "Conseguir la recompensa" : "Código de invitación"}</h2>
      {active ? (
        <>
          <p className="hint mb-3 mt-1">
            Necesitas el código al abrir la cuenta. Antes, revisa las{" "}
            <a href={promo.termsUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-brand underline underline-offset-2">
              condiciones oficiales
            </a>
            .
          </p>
          <CodeBox promotionId={promo.id} entityName={promo.entity.name} siteName={SITE_NAME} guide={guideFor(promo.entity)} />
        </>
      ) : (
        <p className="note note-warn mt-2">
          Esta oferta ha terminado. Mira las <Link href="/#ofertas" className="underline">ofertas activas</Link>.
        </p>
      )}
    </div>
  );
}
