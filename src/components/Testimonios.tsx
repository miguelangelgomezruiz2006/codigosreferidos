import { entityNames, type Testimonio } from "@/lib/testimonios";
import { SITE_NAME } from "@/lib/site";

/** Opiniones de personas que han cobrado. Se indica que son amigos del propietario. */
export function Testimonios({
  items,
  title,
  className = "",
  narrow = false,
}: {
  items: Testimonio[];
  title: string;
  className?: string;
  /** En la columna estrecha de la ficha: como mucho dos por fila. */
  narrow?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="opiniones" className={className}>
      <h2 id="opiniones" className="text-xl font-extrabold">{title}</h2>
      <ul className={`mt-3 grid gap-3 sm:grid-cols-2 ${narrow ? "" : "lg:grid-cols-3"}`}>
        {items.map((t) => (
          <li key={t.name}>
            <figure className="card flex h-full flex-col gap-3 p-4">
              <blockquote className="leading-relaxed">«{t.text}»</blockquote>
              <figcaption className="mt-auto flex items-center gap-3 text-sm">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand-dark">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <strong className="block text-ink">{t.name}</strong>
                  <span className="text-muted">Ha hecho {entityNames(t)}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="hint mt-2">Son amigos del propietario de {SITE_NAME} que han usado estas ofertas y nos han contado su experiencia.</p>
    </section>
  );
}
