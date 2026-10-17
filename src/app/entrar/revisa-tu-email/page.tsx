import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Revisa tu email", robots: { index: false } };

export default function CheckEmailPage() {
  const testInbox = process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY;
  return (
    <div className="wrap mt-8 max-w-md">
      <div className="card flex flex-col gap-3 p-5">
        <h1 className="text-2xl font-extrabold">Revisa tu email</h1>
        <p>Te hemos enviado un enlace para entrar. Ábrelo en este mismo dispositivo. Caduca en 15 minutos.</p>
        <p className="hint">Si no lo ves, mira en la carpeta de correo no deseado.</p>
        {testInbox && (
          <p className="note note-warn">
            Modo de pruebas: los emails no salen de verdad todavía. Ábrelo desde el <Link href="/dev/buzon" className="underline">buzón de pruebas</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
