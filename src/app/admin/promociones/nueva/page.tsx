import Link from "next/link";
import { db } from "@/lib/db";
import { PromoForm } from "../PromoForm";

export default async function NewPromo() {
  const entities = await db.entity.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Nueva promoción</h1>
      {entities.length === 0 ? (
        <p className="note note-warn">
          Primero crea la entidad (banco o fintech) en <Link href="/admin/entidades" className="underline">Entidades</Link>.
        </p>
      ) : (
        <PromoForm entities={entities} />
      )}
    </div>
  );
}
