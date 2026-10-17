import "server-only";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { SITE_NAME } from "@/lib/site";

export interface EmailMessage {
  to: string;
  subject: string;
  paragraphs: string[];
  action?: { label: string; url: string };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function renderEmail(msg: EmailMessage): { html: string; text: string } {
  const body = msg.paragraphs.map((p) => `<p style="margin:0 0 14px">${escapeHtml(p)}</p>`).join("");
  const button = msg.action
    ? `<p style="margin:22px 0"><a href="${escapeHtml(msg.action.url)}" style="background:#0E6B5C;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">${escapeHtml(msg.action.label)}</a></p>`
    : "";
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#F3F6F4;font-family:Arial,sans-serif;color:#13261F">
<div style="max-width:560px;margin:0 auto;padding:24px">
<p style="font-size:22px;font-weight:800;color:#0E6B5C;margin:0 0 18px">${escapeHtml(SITE_NAME)}</p>
<div style="background:#fff;border:1px solid #D7E2DC;border-radius:10px;padding:22px">${body}${button}</div>
</div></body></html>`;
  const text = [...msg.paragraphs, msg.action ? `${msg.action.label}: ${msg.action.url}` : ""].filter(Boolean).join("\n\n");
  return { html, text };
}

/**
 * Envía un email. Con RESEND_API_KEY se envía de verdad; sin ella se guarda en
 * el buzón de pruebas (/dev/buzon en local). Siempre queda registro en EmailLog.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const { html, text } = renderEmail(msg);
  const apiKey = process.env.RESEND_API_KEY;
  let via = "buzon";
  if (apiKey) {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || `${SITE_NAME} <no-reply@example.com>`,
      to: msg.to,
      subject: msg.subject,
      html,
      text,
    });
    if (error) {
      console.error("No se pudo enviar el email:", error.message);
      via = "error";
    } else {
      via = "resend";
    }
  }
  await db.emailLog.create({ data: { to: msg.to.toLowerCase(), subject: msg.subject, html, text, via } });
}
