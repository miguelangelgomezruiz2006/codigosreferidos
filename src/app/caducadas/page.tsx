import type { Metadata } from "next";
import { PromoCard } from "@/components/PromoCard";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Promociones caducadas",
  description: "Archivo de promociones bancarias que ya han terminado, por si vuelven.",
};
export const dynamic = "force-dynamic";

export default async function Expired() {
  const now = new Date();
  const promos = await db.promotion.findMany({
    where: { OR: [{ status: "EXPIRED" }, { status: "ACTIVE", expiresAt: { lte: now } }] },
    orderBy: [{ expiresAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
    include: { entity: true },
    take: 100,
  });
  return (
    <div className="wrap mt-6">
      <h1 className="text-2xl font-extrabold">Promociones caducadas</h1>
      <p className="hint mt-1">Ya no están disponibles. Las guardamos porque muchas entidades repiten sus promociones.</p>
      {promos.length === 0 ? (
        <p className="card mt-6 p-6 text-center text-muted">Todavía no hay promociones caducadas.</p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((p) => (
            <li key={p.id} className="flex">
              <PromoCard p={{ ...p, expired: true }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
