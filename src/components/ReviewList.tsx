import { fmtShortDate } from "@/lib/format";

export interface ReviewItem {
  id: string;
  name: string;
  text: string;
  createdAt: Date;
  entityName?: string;
}

/** Opiniones aprobadas de usuarios de la web. */
export function ReviewList({ items, narrow = false }: { items: ReviewItem[]; narrow?: boolean }) {
  if (items.length === 0) return null;
  return (
    <ul className={`grid gap-3 sm:grid-cols-2 ${narrow ? "" : "lg:grid-cols-3"}`}>
      {items.map((r) => (
        <li key={r.id}>
          <figure className="card flex h-full flex-col gap-3 p-4">
            <blockquote className="leading-relaxed whitespace-pre-line">«{r.text}»</blockquote>
            <figcaption className="mt-auto flex items-center gap-3 text-sm">
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft font-bold text-ink">
                {r.name.charAt(0).toUpperCase()}
              </span>
              <span>
                <strong className="block text-ink">{r.name}</strong>
                <span className="text-muted">
                  {r.entityName ? `${r.entityName} · ` : ""}
                  {fmtShortDate(r.createdAt)}
                </span>
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
