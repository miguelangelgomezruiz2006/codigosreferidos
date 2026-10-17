"use client";
import { addCodeAction } from "@/app/actions/user";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";

export function AddCodeForm({ promos, selected }: { promos: { id: string; label: string }[]; selected?: string }) {
  if (promos.length === 0) {
    return <p className="hint">Ya tienes un código en todas las promociones activas. ¡Gracias!</p>;
  }
  return (
    <ActionForm action={addCodeAction} resetOnSuccess>
      <div className="field">
        <label htmlFor="a-p">Promoción</label>
        <select id="a-p" name="promotionId" className="input" defaultValue={selected ?? ""} required>
          <option value="" disabled>
            Elige una…
          </option>
          {promos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="a-c">Tu código</label>
        <input id="a-c" name="code" className="input font-mono" maxLength={40} autoComplete="off" placeholder="Por ejemplo: JUAN2026" />
      </div>
      <div className="field">
        <label htmlFor="a-l">
          Tu enlace de invitación <span className="font-normal text-muted">(opcional)</span>
        </label>
        <input id="a-l" name="link" type="url" inputMode="url" className="input" placeholder="https://…" />
        <p className="hint">Tiene que ser de la web oficial de la entidad. Rellena al menos el código o el enlace.</p>
      </div>
      <SubmitButton pendingText="Guardando…">Añadir código</SubmitButton>
    </ActionForm>
  );
}
