import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const promos = await db.promotion.findMany({ where: { status: { not: "DRAFT" } }, select: { slug: true, updatedAt: true } });
  return [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/como-funciona"), changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/caducadas"), changeFrequency: "weekly", priority: 0.3 },
    ...promos.map((p) => ({ url: siteUrl(`/promo/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
