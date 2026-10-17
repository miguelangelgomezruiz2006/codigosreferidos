import Link from "next/link";
import { moderateCodeAction } from "@/app/actions/admin";
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

export default async function Moderation() {
  const include = {
    promotion: { include: { entity: true } },
    user: { select: { email: true } },
    reports: { orderBy: { createdAt: "desc" as const }, take: 5 },
  };
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Moderación</h1>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Pendientes de aprobar ({pending.length})</h2>
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
        <h2 className="text-lg font-bold">Con avisos u ocultos ({flagged.length})</h2>
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
