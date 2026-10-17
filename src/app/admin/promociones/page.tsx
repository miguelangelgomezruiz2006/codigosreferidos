import Link from "next/link";
import { expirePromotionAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { isPromoActive } from "@/lib/codes";
import { db } from "@/lib/db";
import { fmtShortDate } from "@/lib/format";

const LABEL = { DRAFT: "Borrador", ACTIVE: "Activa", EXPIRED: "Caducada" } as const;

export default async function AdminPromos() {
  const promos = await db.promotion.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { entity: true, _count: { select: { codes: { where: { status: "APPROVED" } } } } },
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Promociones</h1>
        <Link href="/admin/promociones/nueva" className="btn btn-primary btn-sm">+ Nueva promoción</Link>
      </div>
      <div className="card overflow-x-auto p-4">
        <table className="table">
          <thead>
            <tr>
              <th>Promoción</th>
              <th>Bono</th>
              <th>Estado</th>
              <th>Caduca</th>
              <th>Códigos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => {
              const expiredByDate = p.status === "ACTIVE" && !isPromoActive(p);
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/promociones/${p.id}`} className="font-semibold hover:underline">{p.entity.name}</Link>
                    <div className="text-xs text-muted">{p.title}</div>
                  </td>
                  <td className="whitespace-nowrap">{p.bonusText}</td>
                  <td>{expiredByDate ? "Caducada (fecha)" : LABEL[p.status]}</td>
                  <td className="whitespace-nowrap">{p.expiresAt ? fmtShortDate(p.expiresAt) : "—"}</td>
                  <td>{p._count.codes}</td>
                  <td className="whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link href={`/admin/promociones/${p.id}`} className="btn btn-ghost btn-sm">Editar</Link>
                      {p.status === "ACTIVE" && (
                        <form action={expirePromotionAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <SubmitButton className="btn btn-danger btn-sm" confirm="¿Marcar como caducada? Dejará de mostrarse.">
                            Caducar
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {promos.length === 0 && <p className="hint">No hay promociones. Crea la primera.</p>}
      </div>
    </div>
  );
}
