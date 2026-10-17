"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/actions/account";
import { isPromoActive } from "@/lib/codes";
import { db } from "@/lib/db";
import { hitRateLimit } from "@/lib/ratelimit";
import { requireUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { allowedDomains, isAllowedLink, isValidCode, normalizeCode } from "@/lib/validation";

export async function addCodeAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!(await hitRateLimit(`add-code:${user.id}`, 20, 24 * 60 * 60 * 1000))) {
    return { error: "Has añadido muchos códigos hoy. Vuelve a probar mañana." };
  }
  const promotionId = z.string().min(1).max(40).safeParse(form.get("promotionId"));
  if (!promotionId.success) return { error: "Elige una promoción." };
  const code = normalizeCode(String(form.get("code") ?? ""));
  const link = String(form.get("link") ?? "").trim();

  if (!code && !link) return { error: "Escribe tu código, tu enlace de invitación o los dos." };
  if (code && !isValidCode(code)) return { error: "El código solo puede tener letras, números, puntos y guiones (2 a 40 caracteres)." };

  const promo = await db.promotion.findUnique({ where: { id: promotionId.data }, include: { entity: true } });
  if (!promo || !isPromoActive(promo)) return { error: "Esa promoción ya no está activa." };
  if (link && !isAllowedLink(link, allowedDomains(promo.entity))) {
    return { error: `El enlace tiene que empezar por https:// y ser de la web oficial de ${promo.entity.name}.` };
  }

  const existing = await db.referralCode.findFirst({ where: { promotionId: promo.id, userId: user.id } });
  if (existing) return { error: "Ya tienes un código en esta promoción. Bórralo si quieres cambiarlo." };
  if (code) {
    const dup = await db.referralCode.findFirst({ where: { promotionId: promo.id, code: { equals: code, mode: "insensitive" } } });
    if (dup) return { error: "Ese código ya está publicado en esta promoción." };
  }

  const { requireApproval } = await getSettings();
  await db.referralCode.create({
    data: {
      promotionId: promo.id,
      userId: user.id,
      kind: "COMMUNITY",
      code: code || null,
      link: link || null,
      status: requireApproval ? "PENDING" : "APPROVED",
    },
  });
  revalidatePath("/mi-panel");
  return {
    ok: requireApproval ? "¡Gracias! Revisaremos tu código y lo publicaremos en cuanto lo aprobemos." : "¡Listo! Tu código ya entra en la rotación.",
    nonce: Date.now(),
  };
}

export async function deleteMyCodeAction(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id") ?? "");
  // Solo se borra si el código es del usuario conectado.
  await db.referralCode.deleteMany({ where: { id, userId: user.id, kind: "COMMUNITY" } });
  revalidatePath("/mi-panel");
}
