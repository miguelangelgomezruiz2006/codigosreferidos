import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Buzón de pruebas", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Solo en el ordenador de desarrollo: muestra los emails que la web habría enviado. */
export default async function DevInbox() {
  if (process.env.NODE_ENV === "production") notFound();
  const emails = await db.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return (
    <div className="wrap mt-6 max-w-3xl">
      <h1 className="text-2xl font-extrabold">Buzón de pruebas</h1>
      <p className="note note-warn mt-2">Solo en desarrollo. Sin clave de Resend, los emails no salen: se guardan aquí.</p>
      {emails.length === 0 && <p className="hint mt-4">No hay emails.</p>}
      <div className="mt-4 flex flex-col gap-3">
        {emails.map((e, i) => (
          <details key={e.id} className="card p-4" open={i === 0}>
            <summary className="cursor-pointer">
              <b>{e.subject}</b> <span className="hint">· para {e.to} · {e.createdAt.toLocaleString("es-ES")} · {e.via}</span>
            </summary>
            <div className="mt-3 text-sm break-all whitespace-pre-wrap">
              {e.text.split(/(https?:\/\/\S+)/g).map((part, j) =>
                /^https?:\/\//.test(part) ? (
                  <a key={j} href={part} className="text-brand underline">Abrir enlace</a>
                ) : (
                  part
                ),
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
