"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/actions/account";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { allowedDomains, isAllowedLink, isValidCode, normalizeCode, parseEurosToCents, slugify } from "@/lib/validation";

// Todas las acciones comprueban en el servidor que quien llama es el administrador.

const httpsUrl = z
  .string()
  .trim()
  .url("Escribe una dirección web completa.")
  .refine((u) => u.startsWith("https://"), "La dirección debe empezar por https://");

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

/* ---------- Entidades ---------- */

const entitySchema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre.").max(80),
  category: z.enum(["BANCO", "NEOBANCO", "BROKER", "INVERSION"]),
  website: httpsUrl,
  linkDomains: z.string().max(400),
  logoUrl: z.union([z.literal(""), httpsUrl]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color no válido."),
});

export async function saveEntityAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = entitySchema.safeParse({
    name: str(form, "name"),
    category: str(form, "category"),
    website: str(form, "website"),
    linkDomains: str(form, "linkDomains"),
    logoUrl: str(form, "logoUrl"),
    color: str(form, "color") || "#0E6B5C",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const data = {
    name: d.name,
    category: d.category,
    website: d.website,
    linkDomains: d.linkDomains
      .split(/[\s,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)),
    logoUrl: d.logoUrl || null,
    color: d.color,
  };
  const id = str(form, "id");
  if (id) {
    await db.entity.update({ where: { id }, data });
  } else {
    const slug = slugify(d.name);
    if (await db.entity.findUnique({ where: { slug } })) return { error: "Ya existe una entidad con ese nombre." };
    await db.entity.create({ data: { ...data, slug } });
  }
  revalidatePath("/admin/entidades");
  return { ok: id ? "Entidad guardada." : "Entidad creada.", nonce: Date.now() };
}

/* ---------- Promociones ---------- */

const promoSchema = z.object({
  entityId: z.string().min(1, "Elige la entidad."),
  title: z.string().trim().min(4, "Escribe un título.").max(140),
  bonusText: z.string().trim().min(2, "Escribe la bonificación, por ejemplo «20 € al abrir cuenta».").max(80),
  summary: z.string().trim().max(1000),
  termsUrl: httpsUrl,
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED"]),
  risk: z.enum(["NONE", "INVESTMENT", "CRYPTO"]),
});

export async function savePromotionAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = promoSchema.safeParse({
    entityId: str(form, "entityId"),
    title: str(form, "title"),
    bonusText: str(form, "bonusText"),
    summary: str(form, "summary"),
    termsUrl: str(form, "termsUrl"),
    status: str(form, "status"),
    risk: str(form, "risk") || "NONE",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const bonusCents = parseEurosToCents(str(form, "bonusEuros") || "0");
  if (bonusCents === null) return { error: "La cantidad del bono debe ser un número, por ejemplo 20 o 20,50." };
  const steps = str(form, "steps")
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*(\d+[.)-]|[-•*])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 20);
  const expiresRaw = str(form, "expiresAt");
  // La promoción acaba al final del día indicado (hora de Madrid aproximada).
  const expiresAt = expiresRaw ? new Date(`${expiresRaw}T23:59:59+02:00`) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) return { error: "Fecha de caducidad no válida." };

  const data = {
    ...parsed.data,
    bonusCents,
    steps,
    expiresAt,
    featured: form.get("featured") === "on",
    requiresPayroll: form.get("requiresPayroll") === "on",
    ...(form.get("reviewed") ? { lastReviewedAt: new Date() } : {}),
  };
  const id = str(form, "id");
  if (id) {
    await db.promotion.update({ where: { id }, data });
    revalidatePath(`/admin/promociones/${id}`);
    return { ok: "Promoción guardada." };
  }
  const entity = await db.entity.findUnique({ where: { id: parsed.data.entityId } });
  if (!entity) return { error: "Elige la entidad." };
  let slug = slugify(str(form, "slug") || `${entity.name} ${parsed.data.title}`);
  if (await db.promotion.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const created = await db.promotion.create({ data: { ...data, slug } });
  redirect(`/admin/promociones/${created.id}?creada=1`);
}

export async function expirePromotionAction(form: FormData) {
  await requireAdmin();
  await db.promotion.update({ where: { id: str(form, "id") }, data: { status: "EXPIRED" } });
  revalidatePath("/admin/promociones");
}

/* ---------- Códigos del administrador ---------- */

function parseLimit(raw: string): number | null | "error" {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 && n <= 1_000_000 ? n : "error";
}

export async function addAdminCodeAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const promo = await db.promotion.findUnique({ where: { id: str(form, "promotionId") }, include: { entity: true } });
  if (!promo) return { error: "Promoción no encontrada." };
  const code = normalizeCode(str(form, "code"));
  const link = str(form, "link");
  if (!code && !link) return { error: "Escribe el código, el enlace o los dos." };
  if (code && !isValidCode(code)) return { error: "El código solo puede tener letras, números, puntos y guiones." };
  if (link && !isAllowedLink(link, allowedDomains(promo.entity))) {
    return { error: `El enlace debe ser https y de un dominio de ${promo.entity.name}. Puedes añadir dominios extra en Entidades.` };
  }
  const maxUses = parseLimit(str(form, "maxUses"));
  if (maxUses === "error") return { error: "El límite de usos debe ser un número entero mayor que 0, o vacío para sin límite." };
  const priority = Number(str(form, "priority") || "0");
  await db.referralCode.create({
    data: {
      promotionId: promo.id,
      kind: "ADMIN",
      code: code || null,
      link: link || null,
      maxUses,
      priority: Number.isInteger(priority) ? priority : 0,
      status: "APPROVED",
    },
  });
  revalidatePath(`/admin/promociones/${promo.id}`);
  return { ok: "Código añadido. Ya se muestra el primero mientras le queden usos.", nonce: Date.now() };
}

export async function updateAdminCodeAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(form, "id");
  const maxUses = parseLimit(str(form, "maxUses"));
  if (maxUses === "error") return { error: "Límite no válido." };
  const priority = Number(str(form, "priority") || "0");
  const status = str(form, "status") === "PAUSED" ? "HIDDEN" : "APPROVED";
  const code = await db.referralCode.update({
    where: { id, kind: "ADMIN" },
    data: { maxUses, priority: Number.isInteger(priority) ? priority : 0, status },
  });
  revalidatePath(`/admin/promociones/${code.promotionId}`);
  return { ok: "Guardado." };
}

/* ---------- Moderación (sirve para cualquier código) ---------- */

export async function moderateCodeAction(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const decision = str(form, "decision");
  if (decision === "delete") {
    await db.referralCode.delete({ where: { id } });
  } else if (decision === "approve") {
    // Aprobar o reactivar borra los avisos anteriores: el código empieza de cero.
    await db.$transaction([
      db.codeReport.deleteMany({ where: { codeId: id } }),
      db.referralCode.update({ where: { id }, data: { status: "APPROVED", reportCount: 0 } }),
    ]);
  } else if (decision === "reject") {
    await db.referralCode.update({ where: { id }, data: { status: "REJECTED" } });
    await db.assignment.deleteMany({ where: { codeId: id } });
  }
  revalidatePath("/admin", "layout");
}

/* ---------- Ajustes ---------- */

export async function saveSettingsAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const threshold = Number(str(form, "reportThreshold"));
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 100) return { error: "El número de avisos debe estar entre 1 y 100." };
  const data = {
    reportThreshold: threshold,
    requireApproval: form.get("requireApproval") === "on",
    ownerName: str(form, "ownerName").slice(0, 160),
    ownerNif: str(form, "ownerNif").slice(0, 20),
    ownerAddress: str(form, "ownerAddress").slice(0, 300),
    contactEmail: str(form, "contactEmail").slice(0, 160),
  };
  await db.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/", "layout");
  return { ok: "Ajustes guardados." };
}
