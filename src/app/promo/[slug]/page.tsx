import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBox } from "@/components/CodeBox";
import { EntityLogo } from "@/components/EntityLogo";
import { ExpiryLabel } from "@/components/PromoCard";
import { isPromoActive } from "@/lib/codes";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { CATEGORY_LABELS, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const promo = await db.promotion.findUnique({
    where: { slug },
    include: { entity: true, _count: { select: { codes: { where: { status: "APPROVED" } } } } },
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

  return (
    <div className="wrap mt-4">
      <nav aria-label="Migas de pan" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Promociones</Link>
        <span aria-hidden> › </span>
        <Link href={`/?cat=${entity.category}`} className="hover:text-ink">{CATEGORY_LABELS[entity.category]}</Link>
        <span aria-hidden> › </span>
        <span className="text-ink">{entity.name}</span>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <header className="card p-5 lg:col-start-1">
            <div className="flex items-center gap-3">
              <EntityLogo name={entity.name} logoUrl={entity.logoUrl} color={entity.color} size={56} />
              <div>
                <p className="text-sm text-muted">{CATEGORY_LABELS[entity.category]}</p>
                <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">{promo.title}</h1>
              </div>
            </div>
            <p className={`mt-4 text-3xl font-extrabold sm:text-4xl ${active ? "text-brand" : "text-muted line-through"}`}>{promo.bonusText}</p>
            <div className="mt-2 text-sm">
              <ExpiryLabel expiresAt={promo.expiresAt} expired={!active} />
            </div>
            {promo.summary && <p className="mt-4 leading-relaxed">{promo.summary}</p>}
          </header>

        {/* En el móvil, el código va justo después de la cabecera; en el ordenador, fijo a la derecha. */}
        <aside className="lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <CodePanel promo={promo} active={active} />
        </aside>

        <div className="flex flex-col gap-6 lg:col-start-1">

          {promo.steps.length > 0 && (
            <section className="card p-5" aria-labelledby="pasos">
              <h2 id="pasos" className="text-lg font-bold">Qué tienes que hacer</h2>
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

          <section className="card flex flex-col gap-3 p-5 text-sm">
            <a href={promo.termsUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-ghost self-start">
              Ver condiciones oficiales en la web de {entity.name} ↗
            </a>
            {promo.lastReviewedAt && <p className="text-muted">Revisada por última vez el {fmtDate(promo.lastReviewedAt)}.</p>}
            <p className="text-muted">
              Las condiciones las fija {entity.name} y pueden cambiar sin aviso. Esto no es asesoramiento financiero. Los bonos de bienvenida
              suelen tributar en la declaración de la renta.
            </p>
          </section>

          {active && (
            <section className="card flex flex-col items-start gap-2 bg-accent-soft p-5">
              <h2 className="font-bold">¿Ya eres cliente de {entity.name}?</h2>
              <p className="text-sm">Comparte tu código de invitación. Lo mostraremos por turnos junto a los demás para que todos reciban visitas.</p>
              <Link href={`/mi-panel?promo=${promo.slug}`} className="btn btn-primary btn-sm">Añadir mi código</Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function CodePanel({ promo, active }: { promo: { id: string; entity: { name: string } }; active: boolean }) {
  return (
    <div className="card border-2 border-brand/30 p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold">Tu código de invitación</h2>
      {active ? (
        <CodeBox promotionId={promo.id} entityName={promo.entity.name} siteName={SITE_NAME} />
      ) : (
        <p className="note note-warn">Esta promoción ha caducado. Mira las <Link href="/" className="underline">promociones activas</Link>.</p>
      )}
    </div>
  );
}
