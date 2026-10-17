"use client";
import { useState } from "react";
import { IconCheck, IconShare } from "@/components/Icons";

/** Comparte el enlace directo de la oferta: menú del sistema en el móvil o copiar al portapapeles. */
export function ShareButton({ title, path }: { title: string; path: string }) {
  const [msg, setMsg] = useState<string | null>(null);

  async function share() {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMsg("Enlace copiado");
    } catch (e) {
      // Cancelar el menú de compartir no es un error.
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMsg("No se pudo copiar. Copia la dirección de la barra del navegador.");
    }
    window.setTimeout(() => setMsg(null), 3000);
  }

  return (
    <span className="relative shrink-0">
      <button type="button" onClick={share} className="btn btn-ghost btn-sm" title="Compartir el enlace de esta oferta">
        {msg === "Enlace copiado" ? <IconCheck size={16} /> : <IconShare size={16} />}
        {msg === "Enlace copiado" ? "Copiado" : "Compartir"}
      </button>
      {/* El aviso se lee en voz alta; si falla, también se ve. */}
      <span role="status" aria-live="polite" className={msg && msg !== "Enlace copiado" ? "absolute right-0 top-full z-10 mt-1 w-56 rounded-lg bg-ink p-2 text-xs text-white" : "sr-only"}>
        {msg}
      </span>
    </span>
  );
}
