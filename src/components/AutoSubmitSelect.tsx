"use client";

/** Desplegable que envía su formulario al cambiar (sin JavaScript, el botón «Aplicar» hace lo mismo). */
export function AutoSubmitSelect({
  id,
  name,
  defaultValue,
  options,
  className,
}: {
  id: string;
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} className={className} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
