import { saveEntityAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/ActionForm";
import { EntityLogo } from "@/components/EntityLogo";
import { SubmitButton } from "@/components/SubmitButton";
import { db } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/site";

type EntityValues = {
  id: string;
  name: string;
  category: keyof typeof CATEGORY_LABELS;
  website: string;
  linkDomains: string[];
  logoUrl: string | null;
  color: string;
};

function EntityFields({ e }: { e?: EntityValues }) {
  const p = e?.id ?? "new";
  return (
    <>
      {e && <input type="hidden" name="id" value={e.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="field">
          <label htmlFor={`${p}-n`}>Nombre</label>
          <input id={`${p}-n`} name="name" className="input" defaultValue={e?.name} required />
        </div>
        <div className="field">
          <label htmlFor={`${p}-c`}>Tipo</label>
          <select id={`${p}-c`} name="category" className="input" defaultValue={e?.category ?? "BANCO"}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${p}-w`}>Web oficial</label>
          <input id={`${p}-w`} name="website" type="url" className="input" defaultValue={e?.website} placeholder="https://www.banco.es" required />
        </div>
        <div className="field">
          <label htmlFor={`${p}-d`}>Otros dominios de enlaces (separados por comas)</label>
          <input id={`${p}-d`} name="linkDomains" className="input" defaultValue={e?.linkDomains.join(", ")} placeholder="banco.onelink.me" />
        </div>
        <div className="field">
          <label htmlFor={`${p}-l`}>Logo (dirección https, opcional)</label>
          <input id={`${p}-l`} name="logoUrl" type="url" className="input" defaultValue={e?.logoUrl ?? ""} />
        </div>
        <div className="field">
          <label htmlFor={`${p}-col`}>Color (si no hay logo)</label>
          <input id={`${p}-col`} name="color" type="color" className="input h-11 p-1" defaultValue={e?.color ?? "#0E6B5C"} />
        </div>
      </div>
      <p className="hint">Solo se aceptan enlaces de invitación de la web oficial o de los dominios que indiques aquí.</p>
    </>
  );
}

export default async function AdminEntities() {
  const entities = await db.entity.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { promotions: true } } } });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Entidades</h1>
      <details className="card p-4" open={entities.length === 0}>
        <summary className="cursor-pointer font-bold">+ Nueva entidad</summary>
        <ActionForm action={saveEntityAction} resetOnSuccess className="mt-3 flex flex-col gap-3">
          <EntityFields />
          <SubmitButton className="btn btn-primary self-start">Crear entidad</SubmitButton>
        </ActionForm>
      </details>
      {entities.map((e) => (
        <details key={e.id} className="card p-4">
          <summary className="flex cursor-pointer items-center gap-3">
            <EntityLogo name={e.name} logoUrl={e.logoUrl} color={e.color} size={36} />
            <span className="font-semibold">{e.name}</span>
            <span className="text-sm text-muted">
              {CATEGORY_LABELS[e.category]} · {e._count.promotions} {e._count.promotions === 1 ? "promoción" : "promociones"}
            </span>
          </summary>
          <ActionForm action={saveEntityAction} className="mt-3 flex flex-col gap-3">
            <EntityFields e={e} />
            <SubmitButton className="btn btn-primary self-start">Guardar</SubmitButton>
          </ActionForm>
        </details>
      ))}
    </div>
  );
}
