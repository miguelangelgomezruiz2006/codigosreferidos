"use client";
import { useState, useTransition } from "react";
import { reportAction, revealAction, trackAction } from "@/app/actions/public";
import type { RevealedCode } from "@/lib/codes";

export function CodeBox({ promotionId, entityName, siteName }: { promotionId: string; entityName: string; siteName: string }) {
  const [code, setCode] = useState<RevealedCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function reveal(another = false) {
    setError(null);
    setCopied(false);
    setReporting(false);
    setReportMsg(null);
    start(async () => {
      const res = await revealAction(promotionId, another);
      if (res.ok) setCode(res.code);
      else setError(res.error);
    });
  }

  async function copy() {
    if (!code?.code) return;
    try {
      await navigator.clipboard.writeText(code.code);
    } catch {
      // Navegadores sin portapapeles: el código queda seleccionado para copiarlo a mano.
      const el = document.getElementById("code-value");
      if (el) window.getSelection()?.selectAllChildren(el);
    }
    setCopied(true);
    void trackAction(code.id, "COPY");
  }

  function sendReport() {
    if (!code) return;
    start(async () => {
      const res = await reportAction(code.id, reason);
      setReportMsg(res.message);
      setReporting(false);
    });
  }

  if (!code) {
    return (
      <div className="flex flex-col gap-3">
        <button type="button" className="btn btn-accent w-full text-base" onClick={() => reveal()} disabled={pending}>
          {pending ? "Buscando código…" : "Ver código de invitación"}
        </button>
        {error && <p className="note note-err" role="alert">{error}</p>}
        <p className="hint text-center">Gratis y sin registrarte.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {code.kind === "ADMIN" ? `Código de ${siteName}` : "Código de la comunidad"}
      </p>

      {code.code && (
        <div className="flex items-stretch gap-2">
          <span
            id="code-value"
            className="flex min-h-12 flex-1 items-center justify-center rounded-lg border-2 border-dashed border-brand bg-brand-soft px-3 font-mono text-lg font-bold tracking-wider break-all text-brand-dark select-all"
          >
            {code.code}
          </span>
          <button type="button" className="btn btn-primary" onClick={copy}>
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
      )}

      {code.link && (
        <a
          href={code.link}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className={`btn w-full ${code.code ? "btn-ghost" : "btn-primary"}`}
          onClick={() => void trackAction(code.id, "OPEN")}
        >
          Abrir enlace de invitación de {entityName} ↗
        </a>
      )}

      {reportMsg && <p className="note note-ok">{reportMsg}</p>}
      {error && <p className="note note-err" role="alert">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => reveal(true)} disabled={pending}>
          {pending ? "Buscando…" : "Dame otro código"}
        </button>
        {!reporting && !reportMsg && (
          <button type="button" className="text-sm text-danger underline-offset-2 hover:underline" onClick={() => setReporting(true)}>
            Este código no funciona
          </button>
        )}
      </div>

      {reporting && (
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-3">
          <label htmlFor="report-reason" className="text-sm font-semibold">
            ¿Qué ha pasado? <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input
            id="report-reason"
            className="input"
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Por ejemplo: la app dice que el código no existe"
          />
          <div className="flex gap-2">
            <button type="button" className="btn btn-danger btn-sm" onClick={sendReport} disabled={pending}>
              Enviar aviso
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReporting(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
