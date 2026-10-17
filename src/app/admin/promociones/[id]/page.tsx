import Link from "next/link";
import { notFound } from "next/navigation";
import { addAdminCodeAction, moderateCodeAction, updateAdminCodeAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { db } from "@/lib/db";
import { adminHasUsesLeft } from "@/lib/rotation";
import { allowedDomains } from "@/lib/validation";
import { PromoForm } from "../PromoForm";

export default async function EditPromo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ creada?: string }> }) {
  const { id } = await params;
  const { creada } = await searchParams;
  const [promo, entities] = await Promise.all([
    db.promotion.findUnique({
      where: { id },
      include: {
        entity: true,
        codes: { orderBy: [{ kind: "asc" }, { priority: "asc" }, { createdAt: "asc" }], include: { user: { select: { email: true } } } },
      },
    }),
    db.entity.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!promo) notFound();
  const adminCodes = promo.codes.filter((c) => c.kind === "ADMIN");
  const community = promo.codes.filter((c) => c.kind === "COMMUNITY");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">
          {promo.entity.name} · {promo.bonusText}
        </h1>
        {promo.status !== "DRAFT" && (
          <Link href={`/promo/${promo.slug}`} className="btn btn-ghost btn-sm" target="_blank">
            Ver ficha pública ↗
          </Link>
        )}
      </div>
      {creada && <p className="note note-ok">Promoción creada. Ahora añade tus códigos aquí abajo.</p>}

      <section className="flex flex-col gap-3" aria-labelledby="mis-codigos">
        <h2 id="mis-codigos" className="text-lg font-bold">Tus códigos (se muestran primero)</h2>
        <p className="hint -mt-2">
          Se muestra el de menor prioridad hasta que llega a su límite de usos; entonces el siguiente y, al final, los de la comunidad. Un uso es un
          visitante distinto que copia el código o abre el enlace.
        </p>
        {adminCodes.length > 0 && (
          <div className="card overflow-x-auto p-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Código / enlace</th>
                  <th>Usos</th>
                  <th>Mostrado · copiado · enlace</th>
                  <th>Límite, prioridad y estado</th>
                </tr>
              </thead>
              <tbody>
                {adminCodes.map((c) => (
                  <tr key={c.id}>
                    <td className="max-w-56">
                      <div className="font-mono font-semibold">{c.code ?? "Solo enlace"}</div>
                      {c.link && <div className="text-xs break-all text-muted">{c.link}</div>}
                    </td>
                    <td className="whitespace-nowrap">
                      {c.uses}
                      {c.maxUses ? ` / ${c.maxUses}` : " (sin límite)"}
                      {c.status === "APPROVED" && !adminHasUsesLeft(c) && <div className="badge mt-1 bg-accent-soft">Agotado</div>}
                    </td>
                    <td className="whitespace-nowrap">
                      {c.timesShown} · {c.timesCopied} · {c.timesOpened}
                      {c.reportCount > 0 && <div className="text-xs text-danger">{c.reportCount} {c.reportCount === 1 ? "aviso" : "avisos"} de que no funciona</div>}
                    </td>
                    <td>
                      <ActionForm action={updateAdminCodeAction} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="id" value={c.id} />
                        <label className="field w-24">
                          <span className="text-xs">Límite</span>
                          <input name="maxUses" className="input" inputMode="numeric" defaultValue={c.maxUses ?? ""} placeholder="∞" />
                        </label>
                        <label className="field w-20">
                          <span className="text-xs">Prioridad</span>
                          <input name="priority" className="input" inputMode="numeric" defaultValue={c.priority} />
                        </label>
                        <label className="field">
                          <span className="text-xs">Estado</span>
                          <select name="status" className="input" defaultValue={c.status === "APPROVED" ? "ON" : "PAUSED"}>
                            <option value="ON">Activo</option>
                            <option value="PAUSED">Pausado</option>
                          </select>
                        </label>
                        <SubmitButton className="btn btn-ghost btn-sm">Guardar</SubmitButton>
                      </ActionForm>
                      <form action={moderateCodeAction} className="mt-2">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="decision" value="delete" />
                        <SubmitButton className="text-xs text-danger hover:underline" confirm="¿Borrar este código y sus estadísticas?">
                          Borrar código
                        </SubmitButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ActionForm action={addAdminCodeAction} resetOnSuccess className="card grid gap-3 p-4 sm:grid-cols-2">
          <input type="hidden" name="promotionId" value={promo.id} />
          <div className="field">
            <label htmlFor="ac-c">Código</label>
            <input id="ac-c" name="code" className="input font-mono" maxLength={40} />
          </div>
          <div className="field">
            <label htmlFor="ac-l">Enlace de invitación</label>
            <input id="ac-l" name="link" type="url" className="input" placeholder="https://…" />
          </div>
          <div className="field">
            <label htmlFor="ac-m">Límite de usos (vacío = sin límite)</label>
            <input id="ac-m" name="maxUses" className="input" inputMode="numeric" />
          </div>
          <div className="field">
            <label htmlFor="ac-p">Prioridad (menor = antes)</label>
            <input id="ac-p" name="priority" className="input" inputMode="numeric" defaultValue={adminCodes.length} />
          </div>
          <p className="hint sm:col-span-2">Dominios aceptados para el enlace: {allowedDomains(promo.entity).join(", ")}</p>
          <SubmitButton className="btn btn-primary sm:col-span-2 sm:justify-self-start">Añadir mi código</SubmitButton>
        </ActionForm>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="comunidad">
        <h2 id="comunidad" className="text-lg font-bold">Códigos de la comunidad ({community.length})</h2>
        {community.length === 0 ? (
          <p className="hint">Nadie ha añadido códigos todavía.</p>
        ) : (
          <div className="card overflow-x-auto p-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  <th>Mostrado · copiado · enlace</th>
                  <th>Avisos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {community.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono">{c.code ?? "Solo enlace"}</td>
                    <td className="text-xs">{c.user?.email}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="whitespace-nowrap">
                      {c.timesShown} · {c.timesCopied} · {c.timesOpened}
                    </td>
                    <td>{c.reportCount}</td>
                    <td>
                      <Link href="/admin/moderacion" className="text-sm text-brand hover:underline">Moderar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="datos">
        <h2 id="datos" className="text-lg font-bold">Datos de la promoción</h2>
        <PromoForm entities={entities} promo={promo} />
      </section>
    </div>
  );
}
