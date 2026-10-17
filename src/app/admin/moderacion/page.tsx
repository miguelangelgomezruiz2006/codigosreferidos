import Link from "next/link";
import { moderateCodeAction, moderateReviewAction } from "@/app/actions/admin";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { db } from "@/lib/db";
import { fmtShortDate } from "@/lib/format";

function Decision({ id, decision, label, className, confirm }: { id: string; decision: string; label: string; className: string; confirm?: string }) {
  return (
    <form action={moderateCodeAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <SubmitButton className={className} confirm={confirm}>
        {label}
      </SubmitButton>
    </form>
  );
}

function ReviewDecision({ id, decision, label, className, confirm }: { id: string; decision: string; label: string; className: string; confirm?: string }) {
  return (
    <form action={moderateReviewAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <SubmitButton className={className} confirm={confirm}>
        {label}
      </SubmitButton>
    </form>
  );
}

export default async function Moderation() {
  const include = {
    promotion: { include: { entity: true } },
    user: { select: { email: true } },
    reports: { orderBy: { createdAt: "desc" as const }, take: 5 },
  };
  const reviewInclude = { promotion: { include: { entity: true } } };
  const [pendingReviews, publishedReviews] = await Promise.all([
    db.review.findMany({ where: { status: "PENDING" }, include: reviewInclude, orderBy: { createdAt: "asc" } }),
    db.review.findMany({ where: { status: "APPROVED" }, include: reviewInclude, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const [pending, flagged] = await Promise.all([
    db.referralCode.findMany({ where: { status: "PENDING" }, include, orderBy: { createdAt: "asc" } }),
    db.referralCode.findMany({
      where: { OR: [{ status: "HIDDEN", kind: "COMMUNITY" }, { status: "APPROVED", reportCount: { gt: 0 } }] },
      include,
      orderBy: { reportCount: "desc" },
    }),
  ]);

  const Item = ({ c, mode }: { c: (typeof pending)[number]; mode: "pending" | "flagged" }) => (
    <li className="card flex flex-col gap-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/admin/promociones/${c.promotionId}`} className="font-semibold hover:underline">
          {c.promotion.entity.name} · {c.promotion.bonusText}
        </Link>
        <StatusBadge status={c.status} />
      </div>
      <p className="font-mono text-lg break-all">{c.code ?? "Solo enlace"}</p>
      {c.link && (
        <a href={c.link} target="_blank" rel="noopener noreferrer nofollow" className="text-sm break-all text-brand underline">
          {c.link}
        </a>
      )}
      <p className="text-xs text-muted">
        {c.kind === "ADMIN" ? "Tu código" : c.user?.email} · añadido el {fmtShortDate(c.createdAt)}
      </p>
      {c.reportCount > 0 && (
        <div className="rounded-lg bg-danger-soft p-2 text-sm">
          <p className="font-semibold text-danger">
            {c.reportCount} {c.reportCount === 1 ? "aviso" : "avisos"} de que no funciona
          </p>
          <ul className="mt-1 list-disc pl-5">
            {c.reports.map((r) => (
              <li key={r.id}>
                {fmtShortDate(r.createdAt)}: {r.reason || <span className="text-muted">sin comentario</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Decision id={c.id} decision="approve" label={mode === "pending" ? "Aprobar" : "Funciona: reactivar y borrar avisos"} className="btn btn-primary btn-sm" />
        {c.kind === "COMMUNITY" && <Decision id={c.id} decision="reject" label="Rechazar" className="btn btn-danger btn-sm" />}
        <Decision id={c.id} decision="delete" label="Borrar" className="btn btn-ghost btn-sm" confirm="¿Borrar este código definitivamente?" />
      </div>
    </li>
  );

  const ReviewItem = ({ r, published }: { r: (typeof pendingReviews)[number]; published?: boolean }) => (
    <li className="card flex flex-col gap-2 p-4">
      <p className="font-semibold">
        {r.promotion.entity.name} · {r.promotion.bonusText}
      </p>
      <p className="leading-relaxed whitespace-pre-line">«{r.text}»</p>
      <p className="text-xs text-muted">
        {r.name} · {fmtShortDate(r.createdAt)}
      </p>
      <div className="flex flex-wrap gap-2">
        {!published && <ReviewDecision id={r.id} decision="approve" label="Publicar" className="btn btn-primary btn-sm" />}
        {!published && <ReviewDecision id={r.id} decision="reject" label="Rechazar" className="btn btn-danger btn-sm" />}
        <ReviewDecision id={r.id} decision="delete" label="Borrar" className="btn btn-ghost btn-sm" confirm="¿Borrar esta opinión definitivamente?" />
      </div>
    </li>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Moderación</h1>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Opiniones pendientes ({pendingReviews.length})</h2>
        <p className="hint">
          Llegan desde el formulario de cada ficha y desde la página /opinar. Publica solo las que sean de personas que han usado la oferta.
        </p>
        {pendingReviews.length === 0 ? (
          <p className="hint">No hay opiniones pendientes.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {pendingReviews.map((r) => (
              <ReviewItem key={r.id} r={r} />
            ))}
          </ul>
        )}
      </section>
      {publishedReviews.length > 0 && (
        <details className="card p-4">
          <summary className="cursor-pointer font-bold">Opiniones publicadas ({publishedReviews.length})</summary>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {publishedReviews.map((r) => (
              <ReviewItem key={r.id} r={r} published />
            ))}
          </ul>
        </details>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Códigos pendientes de aprobar ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="hint">No hay códigos pendientes.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {pending.map((c) => (
              <Item key={c.id} c={c} mode="pending" />
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Códigos con avisos u ocultos ({flagged.length})</h2>
        {flagged.length === 0 ? (
          <p className="hint">Ningún código tiene avisos.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {flagged.map((c) => (
              <Item key={c.id} c={c} mode="flagged" />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
