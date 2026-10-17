import { savePromotionAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { toDateInput } from "@/lib/format";

interface PromoValues {
  id: string;
  entityId: string;
  title: string;
  bonusText: string;
  bonusCents: number;
  summary: string;
  steps: string[];
  termsUrl: string;
  expiresAt: Date | null;
  status: "DRAFT" | "ACTIVE" | "EXPIRED";
  risk: "NONE" | "INVESTMENT" | "CRYPTO";
  featured: boolean;
  requiresPayroll: boolean;
}

const STEPS_PLACEHOLDER = [
  "Descarga la app y abre la cuenta con el código",
  "Haz una compra con la tarjeta antes de 30 días",
  "Recibe el bono en tu cuenta",
].join("\n");

export function PromoForm({ entities, promo }: { entities: { id: string; name: string }[]; promo?: PromoValues }) {
  return (
    <ActionForm action={savePromotionAction} className="card flex flex-col gap-4 p-5">
      {promo && <input type="hidden" name="id" value={promo.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="p-e">Entidad</label>
          <select id="p-e" name="entityId" className="input" defaultValue={promo?.entityId ?? ""} required>
            <option value="" disabled>
              Elige…
            </option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="p-s">Estado</label>
          <select id="p-s" name="status" className="input" defaultValue={promo?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Activa (visible)</option>
            <option value="DRAFT">Borrador (oculta)</option>
            <option value="EXPIRED">Caducada</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="p-t">Título</label>
        <input id="p-t" name="title" className="input" defaultValue={promo?.title} placeholder="Cuenta online sin comisiones" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <div className="field">
          <label htmlFor="p-b">Bonificación (texto que se ve)</label>
          <input id="p-b" name="bonusText" className="input" defaultValue={promo?.bonusText} placeholder="20 € al abrir cuenta" required />
        </div>
        <div className="field">
          <label htmlFor="p-be">Cantidad en €</label>
          <input
            id="p-be"
            name="bonusEuros"
            className="input"
            inputMode="decimal"
            defaultValue={promo ? String(promo.bonusCents / 100).replace(".", ",") : ""}
            placeholder="20"
          />
        </div>
      </div>
      <p className="hint -mt-2">La cantidad en € sirve para ordenar de mayor a menor bono.</p>
      <div className="field">
        <label htmlFor="p-su">Resumen</label>
        <textarea id="p-su" name="summary" className="input min-h-20" defaultValue={promo?.summary} maxLength={1000} />
      </div>
      <div className="field">
        <label htmlFor="p-st">Requisitos paso a paso (uno por línea)</label>
        <textarea id="p-st" name="steps" className="input min-h-36" defaultValue={promo?.steps.join("\n")} placeholder={STEPS_PLACEHOLDER} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div className="field">
          <label htmlFor="p-u">Enlace a las condiciones oficiales</label>
          <input id="p-u" name="termsUrl" type="url" className="input" defaultValue={promo?.termsUrl} placeholder="https://…" required />
        </div>
        <div className="field">
          <label htmlFor="p-x">Caduca el (opcional)</label>
          <input id="p-x" name="expiresAt" type="date" className="input" defaultValue={toDateInput(promo?.expiresAt)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="p-r">Aviso de riesgo en la ficha</label>
        <select id="p-r" name="risk" className="input" defaultValue={promo?.risk ?? "NONE"}>
          <option value="NONE">Ninguno (cuentas bancarias)</option>
          <option value="INVESTMENT">Inversión: puedes perder dinero</option>
          <option value="CRYPTO">Criptomonedas (aviso de la CNMV)</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="requiresPayroll" defaultChecked={promo?.requiresPayroll ?? false} className="size-4" /> Pide domiciliar la nómina (si no se marca, se muestra «Sin nómina»)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={promo?.featured ?? false} className="size-4" /> Opción estrella (sale la primera y destacada en la portada)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="reviewed" defaultChecked className="size-4" /> He revisado las condiciones oficiales hoy
      </label>
      <SubmitButton className="btn btn-primary self-start" pendingText="Guardando…">
        {promo ? "Guardar cambios" : "Crear promoción"}
      </SubmitButton>
    </ActionForm>
  );
}
