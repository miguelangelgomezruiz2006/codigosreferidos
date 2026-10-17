"use client";
import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap mt-10 max-w-xl text-center">
      <h1 className="text-2xl font-extrabold">Algo ha fallado</h1>
      <p className="hint mt-2">No es culpa tuya. Vuelve a intentarlo en unos segundos.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Reintentar
        </button>
        <Link href="/" className="btn btn-ghost">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
