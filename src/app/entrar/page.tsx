import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

const ERRORS: Record<string, string> = {
  Verification: "Ese enlace ha caducado o ya se usó. Pide uno nuevo.",
  AccessDenied: "No se ha podido entrar con ese enlace.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/mi-panel", error } = await searchParams;
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/mi-panel";
  if (await getCurrentUser()) redirect(safe);
  return (
    <div className="wrap mt-8 max-w-md">
      <div className="card p-5">
        <h1 className="text-2xl font-extrabold">Comparte tu código</h1>
        <p className="hint mt-1 mb-4">
          Para ver promociones y copiar códigos no hace falta cuenta. Solo la necesitas para añadir tu propio código y ver cuántas veces se copia.
        </p>
        {error && <p className="note note-err mb-3" role="alert">{ERRORS[error] ?? "No se ha podido entrar. Vuelve a intentarlo."}</p>}
        <LoginForm next={safe} />
      </div>
    </div>
  );
}
