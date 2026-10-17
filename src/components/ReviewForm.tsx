"use client";
import { submitReviewAction } from "@/app/actions/public";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";

/** Formulario de opinión. Con una sola oferta, la elige solo; con varias, muestra un desplegable. */
export function ReviewForm({ promos }: { promos: { id: string; label: string }[] }) {
  const single = promos.length === 1;
  return (
    <ActionForm action={submitReviewAction} resetOnSuccess className="flex flex-col gap-4">
      {single ? (
        <input type="hidden" name="promotionId" value={promos[0].id} />
      ) : (
        <div className="field">
          <label htmlFor="r-promo">¿Qué oferta has usado?</label>
          <select id="r-promo" name="promotionId" className="input" defaultValue="" required>
            <option value="" disabled>
              Elige la oferta…
            </option>
            {promos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="field">
        <label htmlFor="r-name">Tu nombre o apodo</label>
        <input id="r-name" name="name" className="input" maxLength={40} autoComplete="given-name" placeholder="Por ejemplo: Lucía G." required />
        <p className="hint">Se publicará tal cual. No pongas tu nombre completo si no quieres.</p>
      </div>
      <div className="field">
        <label htmlFor="r-text">¿Cómo te fue?</label>
        <textarea
          id="r-text"
          name="text"
          className="input min-h-28"
          maxLength={600}
          placeholder="Cuánto te dieron, cuánto tardaron en pagarte y si tuviste algún problema."
          required
        />
      </div>
      {/* Campo trampa para robots: oculto a las personas. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="r-web">No rellenes este campo</label>
        <input id="r-web" name="web" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" className="mt-0.5 size-5 shrink-0" required />
        <span>He usado esta oferta y acepto que mi nombre y mi opinión se publiquen en la web.</span>
      </label>
      <SubmitButton className="btn btn-primary self-start" pendingText="Enviando…">
        Enviar opinión
      </SubmitButton>
      <p className="hint">Revisamos cada opinión antes de publicarla.</p>
    </ActionForm>
  );
}
