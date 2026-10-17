import type { Metadata } from "next";
import Link from "next/link";
import { ReviewForm } from "@/components/ReviewForm";
import { db } from "@/lib/db";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cuéntanos cómo te fue",
  description: `Deja tu opinión sobre la oferta que has usado con ${SITE_NAME}.`,
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function OpinarPage() {
  const promos = await db.promotion.findMany({
    where: { status: { in: ["ACTIVE", "EXPIRED"] } },
    orderBy: [{ status: "asc" }, { bonusCents: "desc" }],
    select: { id: true, bonusText: true, entity: { select: { name: true } } },
  });
  return (
    <div className="wrap mt-6 max-w-xl">
      <h1 className="text-[26px] font-extrabold leading-tight sm:text-3xl">¿Ya has cobrado? Cuéntanos cómo te fue</h1>
      <p className="mt-2 leading-relaxed text-muted">
        Tu opinión ayuda a otras personas a animarse. Tardas un minuto y no hace falta registrarte.
      </p>
      <div className="card mt-5 p-4 sm:p-5">
        {promos.length > 0 ? (
          <ReviewForm promos={promos.map((p) => ({ id: p.id, label: `${p.entity.name} · ${p.bonusText}` }))} />
        ) : (
          <p className="hint">Ahora mismo no hay ofertas.</p>
        )}
      </div>
      <p className="mt-6">
        <Link href="/" className="font-semibold text-brand underline-offset-2 hover:underline">← Ver las ofertas</Link>
      </p>
    </div>
  );
}
