import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/actions/account";
import { deleteMyCodeAction } from "@/app/actions/user";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { activePromoWhere } from "@/lib/codes";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { AddCodeForm } from "./AddCodeForm";

export const metadata: Metadata = { title: "Mis códigos", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MyPanel({ searchParams }: { searchParams: Promise<{ promo?: string }> }) {
  const { promo: promoSlug } = await searchParams;
  const user = await requireUser(promoSlug ? `/mi-panel?promo=${encodeURIComponent(promoSlug)}` : "/mi-panel");

  const [codes, promos] = await Promise.all([
    db.referralCode.findMany({
      where: { userId: user.id },
      include: { promotion: { include: { entity: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.promotion.findMany({ where: activePromoWhere(), include: { entity: true }, orderBy: { bonusCents: "desc" } }),
  ]);
  const used = new Set(codes.map((c) => c.promotionId));
  const available = promos.filter((p) => !used.has(p.id));
  const selected = available.find((p) => p.slug === promoSlug)?.id;

  return (
    <div className="wrap mt-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Mis códigos</h1>
          <p className="hint">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button className="btn btn-ghost btn-sm">Cerrar sesión</button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="card p-5" aria-labelledby="mis">
          <h2 id="mis" className="text-lg font-bold">Tus códigos publicados</h2>
          {codes.length === 0 ? (
            <p className="hint mt-2">Todavía no has añadido ningún código. Usa el formulario para compartir el primero.</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-line">
              {codes.map((c) => (
                <li key={c.id} className="flex flex-col gap-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/promo/${c.promotion.slug}`} className="font-semibold hover:underline">
                      {c.promotion.entity.name} · {c.promotion.bonusText}
                    </Link>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="font-mono text-sm break-all">{c.code ?? "Solo enlace"}</p>
                  {c.link && <p className="text-xs break-all text-muted">{c.link}</p>}
                  <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                    {[
                      ["Mostrado", c.timesShown],
                      ["Copiado", c.timesCopied],
                      ["Enlace abierto", c.timesOpened],
                    ].map(([label, n]) => (
                      <div key={label} className="rounded-lg bg-bg px-2 py-2">
                        <dt className="text-xs text-muted">{label}</dt>
                        <dd className="text-lg font-bold">{n}</dd>
                      </div>
                    ))}
                  </dl>
                  {c.status === "HIDDEN" && (
                    <p className="note note-warn">Varias personas han avisado de que no funciona. Compruébalo; si es correcto, lo revisaremos.</p>
                  )}
                  <form action={deleteMyCodeAction} className="self-end">
                    <input type="hidden" name="id" value={c.id} />
                    <SubmitButton className="btn btn-danger btn-sm" confirm="¿Borrar este código? Perderás sus estadísticas.">
                      Borrar
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5" aria-labelledby="nuevo">
          <h2 id="nuevo" className="mb-3 text-lg font-bold">Añadir un código</h2>
          <p className="hint mb-3">Uno por promoción. Se muestra por turnos con los de los demás: siempre el que menos visitas lleva.</p>
          <AddCodeForm promos={available.map((p) => ({ id: p.id, label: `${p.entity.name} · ${p.bonusText}` }))} selected={selected} />
        </section>
      </div>
    </div>
  );
}
