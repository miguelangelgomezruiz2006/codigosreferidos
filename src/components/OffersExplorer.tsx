"use client";
import { useEffect, useMemo, useState } from "react";
import { IconX } from "@/components/Icons";
import { PromoCard, type PromoCardData } from "@/components/PromoCard";
import { FILTER_GROUPS, matchesFilters, type FilterGroupKey, type FilterState, type FilterablePromo } from "@/lib/site";

export type OfferItem = PromoCardData &
  FilterablePromo & {
    id: string;
    bonusCents: number;
    steps: string[];
    featured: boolean;
  };

/** Los filtros rápidos que más ayudan a decidir. El tipo de entidad va aparte, en un desplegable. */
const QUICK: { label: string; group: FilterGroupKey; value: string }[] = [
  { label: "Sin ingresar dinero", group: "esf", value: "sin-ingreso" },
  { label: "Sin invertir", group: "esf", value: "sin-invertir" },
  { label: "En efectivo", group: "premio", value: "efectivo" },
];

const GROUPS = Object.keys(FILTER_GROUPS) as FilterGroupKey[];

/**
 * Lista de ofertas con filtros rápidos. Las ofertas llegan ya ordenadas del servidor
 * (opción estrella primero y después de mayor a menor recompensa).
 */
export function OffersExplorer({ offers, initial }: { offers: OfferItem[]; initial: FilterState }) {
  const [filters, setFilters] = useState<FilterState>(initial);

  // La URL refleja los filtros para poder compartirlos; sin recargar la página.
  useEffect(() => {
    const params = new URLSearchParams();
    for (const g of GROUPS) if (filters[g]) params.set(g, filters[g]!);
    const qs = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [filters]);

  const results = useMemo(() => offers.filter((o) => matchesFilters(o, filters)), [offers, filters]);
  const countWith = (group: FilterGroupKey, value: string | undefined) =>
    offers.filter((o) => matchesFilters(o, { ...filters, [group]: value })).length;

  const active = GROUPS.some((g) => filters[g]);
  const set = (group: FilterGroupKey, value: string | undefined) => setFilters((f) => ({ ...f, [group]: value }));

  return (
    <div>
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" onClick={() => setFilters({})} aria-pressed={!active} className={`chip shrink-0 ${!active ? "chip-on" : ""}`}>
          Todas
        </button>
        {QUICK.map((c) => {
          const on = filters[c.group] === c.value;
          // Un filtro que dejaría la lista vacía no se ofrece: solo confunde.
          if (!on && countWith(c.group, c.value) === 0) return null;
          return (
            <button
              key={c.value}
              type="button"
              aria-pressed={on}
              onClick={() => set(c.group, on ? undefined : c.value)}
              className={`chip shrink-0 ${on ? "chip-on" : ""}`}
            >
              {c.label}
            </button>
          );
        })}
        <label htmlFor="f-cat" className="sr-only">
          Tipo de entidad
        </label>
        <select
          id="f-cat"
          value={filters.cat ?? ""}
          onChange={(e) => set("cat", e.target.value || undefined)}
          className={`chip shrink-0 cursor-pointer pr-2 ${filters.cat ? "chip-on" : ""}`}
        >
          <option value="">Bancos y apps</option>
          {Object.entries(FILTER_GROUPS.cat.options).map(([value, opt]) => {
            const n = countWith("cat", value);
            return (
              <option key={value} value={value} disabled={n === 0 && filters.cat !== value}>
                {opt.label}
              </option>
            );
          })}
        </select>
      </div>

      <p aria-live="polite" className="mt-2 flex min-h-8 items-center gap-3 text-sm text-muted">
        <span>
          <strong className="text-ink">{results.length}</strong> {results.length === 1 ? "oferta" : "ofertas"}
        </span>
        {active && (
          <button type="button" onClick={() => setFilters({})} className="inline-flex min-h-8 items-center gap-1 font-semibold text-brand hover:underline">
            <IconX size={14} />
            Quitar filtros
          </button>
        )}
      </p>

      {results.length === 0 ? (
        <div className="card mt-2 flex flex-col items-center gap-3 p-8 text-center">
          <p className="font-semibold">Ninguna oferta cumple estos filtros.</p>
          <button type="button" onClick={() => setFilters({})} className="btn btn-primary btn-sm">
            Ver todas las ofertas
          </button>
        </div>
      ) : (
        <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((o) => (
            <li key={o.id} className="flex">
              <PromoCard p={o} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
