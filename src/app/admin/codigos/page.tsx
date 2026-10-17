import Link from "next/link";
import { db } from "@/lib/db";
import { adminHasUsesLeft } from "@/lib/rotation";

export default async function AdminCodes() {
  const codes = await db.referralCode.findMany({
    where: { kind: "ADMIN" },
    include: { promotion: { include: { entity: true } } },
    orderBy: [{ promotion: { entity: { name: "asc" } } }, { priority: "asc" }],
  });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Mis códigos</h1>
      <p className="hint -mt-2">Para añadir o cambiar límites, entra en la promoción.</p>
      <div className="card overflow-x-auto p-4">
        <table className="table">
          <thead>
            <tr>
              <th>Promoción</th>
              <th>Código</th>
              <th>Prioridad</th>
              <th>Usos / límite</th>
              <th>Copiado · enlace</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/promociones/${c.promotionId}`} className="font-semibold hover:underline">
                    {c.promotion.entity.name}
                  </Link>
                  <div className="text-xs text-muted">{c.promotion.bonusText}</div>
                </td>
                <td className="font-mono">{c.code ?? "Solo enlace"}</td>
                <td>{c.priority}</td>
                <td className="whitespace-nowrap">
                  {c.uses} / {c.maxUses ?? "∞"}
                </td>
                <td className="whitespace-nowrap">
                  {c.timesCopied} · {c.timesOpened}
                </td>
                <td>
                  {c.status !== "APPROVED" ? (
                    <span className="badge bg-line text-muted">Pausado</span>
                  ) : adminHasUsesLeft(c) ? (
                    <span className="badge bg-brand-soft text-brand-dark">En rotación</span>
                  ) : (
                    <span className="badge bg-accent-soft">Agotado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && <p className="hint">Aún no tienes códigos. Añádelos desde cada promoción.</p>}
      </div>
    </div>
  );
}
