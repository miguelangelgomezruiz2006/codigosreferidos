import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Administración", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const toReview = await db.referralCode.count({ where: { status: { in: ["PENDING", "HIDDEN"] }, kind: "COMMUNITY" } });
  const tabs = [
    ["/admin", "Resumen"],
    ["/admin/promociones", "Promociones"],
    ["/admin/codigos", "Mis códigos"],
    ["/admin/moderacion", toReview ? `Moderación (${toReview})` : "Moderación"],
    ["/admin/entidades", "Entidades"],
    ["/admin/ajustes", "Ajustes"],
  ];
  return (
    <div className="wrap mt-4">
      <nav aria-label="Administración" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {tabs.map(([href, label]) => (
          <Link key={href} href={href} className="chip shrink-0">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-4">{children}</div>
    </div>
  );
}
