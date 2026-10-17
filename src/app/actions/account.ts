"use server";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { hitRateLimit } from "@/lib/ratelimit";
import { ipFingerprint } from "@/lib/visitor";

export type FormState = { ok?: string; error?: string; nonce?: number } | null;

/** Solo se permiten rutas internas como destino tras entrar. */
function safeNext(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/mi-panel";
}

export async function requestLoginLinkAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = z.string().trim().toLowerCase().email().max(160).safeParse(form.get("email"));
  if (!email.success) return { error: "Escribe un email válido." };
  const okEmail = await hitRateLimit(`login:${email.data}`, 5, 15 * 60_000);
  const okIp = await hitRateLimit(`login-ip:${await ipFingerprint()}`, 20, 15 * 60_000);
  if (!okEmail || !okIp) return { error: "Has pedido demasiados enlaces. Espera 15 minutos y vuelve a probar." };
  // signIn redirige a «revisa tu email» (lanza una redirección: no hay que capturarla).
  await signIn("email", { email: email.data, redirectTo: safeNext(String(form.get("next") ?? "/mi-panel")) });
  return null;
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
