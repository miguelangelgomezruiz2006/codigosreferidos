"use client";
import { reportOfferAction } from "@/app/actions/public";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { OFFER_REPORT_KINDS } from "@/lib/site";

/** Plegado al final de la ficha: avisar de que la oferta ha caducado o tiene datos incorrectos. */
export function OfferReportForm({ promotionId }: { promotionId: string }) {
  return (
    <details className="text-sm">
      <summary className="inline-flex min-h-10 cursor-pointer list-none items-center font-semibold text-danger underline underline-offset-2 [&::-webkit-details-marker]:hidden">
        ¿Esta oferta ha caducado o tiene algún dato mal? Avísanos
      </summary>
      <ActionForm action={reportOfferAction} resetOnSuccess className="mt-2 flex flex-col gap-3 rounded-lg border border-line bg-white p-3">
        <input type="hidden" name="promotionId" value={promotionId} />
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 font-semibold text-ink">¿Qué ocurre?</legend>
          {Object.entries(OFFER_REPORT_KINDS).map(([value, label], i) => (
            <label key={value} className="flex min-h-9 items-center gap-2 text-ink">
              <input type="radio" name="kind" value={value} defaultChecked={i === 0} className="size-4" /> {label}
            </label>
          ))}
        </fieldset>
        <div className="field">
          <label htmlFor="or-msg">Detalles <span className="font-normal text-muted">(opcional)</span></label>
          <textarea id="or-msg" name="message" maxLength={500} className="input min-h-20" placeholder="Por ejemplo: ahora dan 50 € en vez de 70 €" />
        </div>
        <SubmitButton className="btn btn-danger btn-sm self-start" pendingText="Enviando…">
          Enviar aviso
        </SubmitButton>
      </ActionForm>
    </details>
  );
}
