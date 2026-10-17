"use client";
import { useState, useTransition } from "react";
import { reportAction, revealAction, trackAction } from "@/app/actions/public";
import type { RevealedCode } from "@/lib/codes";
import type { SignupGuide } from "@/lib/signup-guides";
import { IconExternal } from "@/components/Icons";

function StepNum({ n }: { n: number }) {
  return <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{n}</span>;
}

export function CodeBox({
  promotionId,
  entityName,
  siteName,
  guide,
}: {
  promotionId: string;
  entityName: string;
  siteName: string;
  guide: SignupGuide;
}) {
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
          {pending ? "Buscando código…" : "Ver mi código"}
        </button>
        {error && <p className="note note-err" role="alert">{error}</p>}
        <p className="hint text-center">Gratis y sin registrarte.</p>
      </div>
    );
  }

  const codeValue = code.code && (
    <div className="flex items-stretch gap-2">
      <span
        id="code-value"
        className="flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-lg border-2 border-dashed border-brand bg-brand-soft px-3 font-mono text-lg font-bold tracking-wider break-all text-brand-dark select-all"
      >
        {code.code}
      </span>
      <button type="button" className="btn btn-primary shrink-0" onClick={copy}>
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {code.kind === "ADMIN" ? `Código de ${siteName}` : "Código de la comunidad"}
      </p>

      {code.code && !code.link ? (
        // Solo código: guía en tres pasos para saber a dónde ir y cuándo pegarlo.
        <ol className="flex flex-col gap-4">
          <li className="flex gap-3">
            <StepNum n={1} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="pt-0.5 font-semibold">Copia el código</p>
              {codeValue}
            </div>
          </li>
          <li className="flex gap-3">
            <StepNum n={2} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="pt-0.5 font-semibold">Abre tu cuenta en {entityName}</p>
              <p className="hint">{guide.where}</p>
              <a href={guide.signupUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-primary w-full">
                {guide.signupLabel}
                <IconExternal size={16} />
              </a>
            </div>
          </li>
          <li className="flex gap-3">
            <StepNum n={3} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="pt-0.5 font-semibold">Pega el código durante el alta</p>
              <p className="text-sm leading-relaxed">{guide.codeMoment}</p>
              <p className="note note-warn">
                <strong>Importante:</strong> mételo antes de terminar el registro. Si te lo saltas, la entidad puede no pagarte el bono.
              </p>
            </div>
          </li>
        </ol>
      ) : (
        <>
          {code.code && codeValue}
          {code.link && (
            <a
              href={code.link}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className={`btn w-full ${code.code ? "btn-ghost" : "btn-primary"}`}
              onClick={() => void trackAction(code.id, "OPEN")}
            >
              Ir a la promoción de {entityName}
              <IconExternal size={16} />
            </a>
          )}
          <p className="hint">
            {code.code
              ? "El enlace ya lleva el código dentro. Si durante el alta te lo piden, pega el de arriba."
              : "Haz todo el registro desde este enlace, sin salir, para que la invitación cuente. En el móvil, ábrelo y te llevará a la app."}
          </p>
        </>
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
