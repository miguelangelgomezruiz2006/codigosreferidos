"use client";
import { useEffect, useMemo, useState } from "react";
import { IconSearch, IconX } from "@/components/Icons";
import { PromoCard, type PromoCardData } from "@/components/PromoCard";
import {
  FILTER_GROUPS,
  SORT_OPTIONS,
  knownOutlayCents,
  matchesFilters,
  type FilterGroupKey,
  type FilterState,
  type FilterablePromo,
  type SortKey,
} from "@/lib/site";

export type OfferItem = PromoCardData &
  FilterablePromo & {
    id: string;
    bonusCents: number;
    steps: string[];
    featured: boolean;
  };

/** Atajos para los filtros que más ayudan a decidir. El resto, en los desplegables. */
const QUICK: { label: string; group: FilterGroupKey; value: string }[] = [
  { label: "Sin invertir", group: "inversion", value: "sin-invertir" },
  { label: "Hasta 100 €", group: "dinero", value: "hasta-100" },
  { label: "En efectivo", group: "premio", value: "efectivo" },
];
const SELECTS: FilterGroupKey[] = ["dinero", "premio", "cat"];
const GROUPS = Object.keys(FILTER_GROUPS) as FilterGroupKey[];

/** Normaliza para buscar sin tildes ni mayúsculas. */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

function sortOffers(list: OfferItem[], sort: SortKey): OfferItem[] {
  if (sort !== "capital") return list; // Ya llegan del servidor: opción estrella y después mayor recompensa.
  return [...list].sort((a, b) => {
    const ca = knownOutlayCents(a);
    const cb = knownOutlayCents(b);
    // Las que no indican importe van al final: no se puede suponer cuánto piden.
    if (ca === null && cb === null) return b.bonusCents - a.bonusCents;
    if (ca === null) return 1;
    if (cb === null) return -1;
    return ca - cb || b.bonusCents - a.bonusCents;
  });
}

export function OffersExplorer({
  offers,
  initial,
}: {
  offers: OfferItem[];
  initial: { q: string; sort: SortKey; filters: FilterState };
}) {
  const [query, setQuery] = useState(initial.q);
  const [sort, setSort] = useState<SortKey>(initial.sort);
  const [filters, setFilters] = useState<FilterState>(initial.filters);

  // La URL refleja búsqueda, filtros y orden para poder compartirlos; sin recargar la página.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      for (const g of GROUPS) if (filters[g]) params.set(g, filters[g]!);
      if (sort !== "bono") params.set("orden", sort);
      const qs = params.toString();
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
    }, 250);
    return () => window.clearTimeout(id);
  }, [query, filters, sort]);

  const q = norm(query);
  const results = useMemo(() => {
    const byQuery = (o: OfferItem) => !q || norm(o.entity.name).includes(q) || norm(o.title).includes(q);
    return sortOffers(
      offers.filter((o) => byQuery(o) && matchesFilters(o, filters)),
      sort,
    );
  }, [offers, q, filters, sort]);

  /** Cuántas ofertas quedarían al elegir una opción (con la búsqueda y el resto de filtros actuales). */
  const countWith = (group: FilterGroupKey, value: string | undefined) =>
    offers.filter((o) => (!q || norm(o.entity.name).includes(q) || norm(o.title).includes(q)) && matchesFilters(o, { ...filters, [group]: value }))
      .length;

  const active = GROUPS.some((g) => filters[g]) || q.length > 0;
  const set = (group: FilterGroupKey, value: string | undefined) => setFilters((f) => ({ ...f, [group]: value }));
  const clearAll = () => {
    setFilters({});
    setQuery("");
  };
  const unknownOutlay = sort === "capital" && results.some((o) => knownOutlayCents(o) === null);

  return (
    <div>
      <div role="search" className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="buscar" className="sr-only">
              Buscar por entidad
            </label>
            <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="buscar"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 60))}
              placeholder="Buscar entidad"
              className="input pl-10"
              autoComplete="off"
            />
          </div>
          <label htmlFor="orden" className="sr-only">
            Ordenar por
          </label>
          <select id="orden" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input w-auto max-w-[46%] text-sm">
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" onClick={() => setFilters({})} aria-pressed={!GROUPS.some((g) => filters[g])} className={`chip shrink-0 ${!GROUPS.some((g) => filters[g]) ? "chip-on" : ""}`}>
            Todas
          </button>
          {QUICK.map((c) => {
            const on = filters[c.group] === c.value;
            if (!on && countWith(c.group, c.value) === 0) return null; // Un atajo que vaciaría la lista solo confunde.
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
          {SELECTS.map((g) => {
            const group = FILTER_GROUPS[g];
            return (
              <span key={g} className="shrink-0">
                <label htmlFor={`f-${g}`} className="sr-only">
                  {group.label}
                </label>
                <select
                  id={`f-${g}`}
                  value={filters[g] ?? ""}
                  onChange={(e) => set(g, e.target.value || undefined)}
                  className={`chip cursor-pointer pr-2 ${filters[g] ? "chip-on" : ""}`}
                >
                  <option value="">{group.all}</option>
                  {Object.entries(group.options).map(([value, opt]) => {
                    const n = countWith(g, value);
                    return (
                      <option key={value} value={value} disabled={n === 0 && filters[g] !== value}>
                        {opt.label} ({n})
                      </option>
                    );
                  })}
                </select>
              </span>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-2 flex min-h-8 flex-wrap items-center gap-x-3 text-sm text-muted">
        <span>
          <strong className="text-ink">{results.length}</strong> {results.length === 1 ? "oferta" : "ofertas"}
          {unknownOutlay ? " · las que no indican importe van al final" : ""}
        </span>
        {active && (
          <button type="button" onClick={clearAll} className="inline-flex min-h-8 items-center gap-1 font-semibold text-brand hover:underline">
            <IconX size={14} />
            Quitar filtros
          </button>
        )}
      </p>

      {results.length === 0 ? (
        <div className="card mt-2 flex flex-col items-center gap-3 p-8 text-center">
          <p className="font-semibold">Ninguna oferta cumple {q ? "esta búsqueda y " : ""}estos filtros.</p>
          <p className="hint">Prueba a quitar algún filtro.</p>
          <button type="button" onClick={clearAll} className="btn btn-primary btn-sm">
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
