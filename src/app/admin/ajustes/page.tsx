import { saveSettingsAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getSettings } from "@/lib/settings";

export default async function AdminSettings() {
  const s = await getSettings();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Ajustes</h1>
      <ActionForm action={saveSettingsAction} className="card flex max-w-2xl flex-col gap-4 p-5">
        <h2 className="font-bold">Comunidad</h2>
        <div className="field">
          <label htmlFor="s-t">Avisos de «no funciona» para ocultar un código de la comunidad</label>
          <input id="s-t" name="reportThreshold" type="number" min={1} max={100} className="input w-32" defaultValue={s.reportThreshold} />
          <p className="hint">Cuenta un aviso por conexión. Tus propios códigos nunca se ocultan solos: los verás en Moderación.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requireApproval" defaultChecked={s.requireApproval} className="size-4" />
          Revisar los códigos nuevos antes de publicarlos
        </label>

        <h2 className="mt-2 font-bold">Datos legales del titular</h2>
        <p className="hint -mt-2">Aparecen en el aviso legal y en la privacidad. Si faltan, se muestra «[PENDIENTE]».</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="s-n">Nombre o razón social</label>
            <input id="s-n" name="ownerName" className="input" defaultValue={s.ownerName} />
          </div>
          <div className="field">
            <label htmlFor="s-nif">NIF</label>
            <input id="s-nif" name="ownerNif" className="input" defaultValue={s.ownerNif} />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="s-a">Domicilio</label>
            <input id="s-a" name="ownerAddress" className="input" defaultValue={s.ownerAddress} />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="s-e">Email de contacto</label>
            <input id="s-e" name="contactEmail" type="email" className="input" defaultValue={s.contactEmail} />
          </div>
        </div>
        <SubmitButton className="btn btn-primary self-start">Guardar ajustes</SubmitButton>
      </ActionForm>
    </div>
  );
}
