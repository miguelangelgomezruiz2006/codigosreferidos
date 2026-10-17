"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconArrowRight, IconColumns, IconSearch, IconX } from "@/components/Icons";
import { PromoCard, type PromoCardData } from "@/components/PromoCard";
import {
  FILTER_GROUPS,
  SORT_OPTIONS,
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

const GROUPS = Object.keys(FILTER_GROUPS) as FilterGroupKey[];
const MAX_COMPARE = 3;
const COMPARE_KEY = "bonificados:comparar";

/** Normaliza para buscar sin tildes ni mayúsculas. */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

function sortOffers(list: OfferItem[], sort: SortKey): OfferItem[] {
  return [...list].sort((a, b) => {
    // La opción estrella va primero salvo que se pida otro orden explícito.
    if (sort === "bono" && a.featured !== b.featured) return a.featured ? -1 : 1;
    const byBonus = b.bonusCents - a.bonusCents;
    switch (sort) {
      case "desembolso": {
        // Las que no indican importe van al final: no se puede suponer cuánto piden.
        const ra = a.requiredCents ?? (a.effort === "NONE" ? 0 : null);
        const rb = b.requiredCents ?? (b.effort === "NONE" ? 0 : null);
        if (ra === null && rb === null) return byBonus;
        if (ra === null) return 1;
        if (rb === null) return -1;
        return ra - rb || byBonus;
      }
      case "facil":
        return a.steps.length - b.steps.length || byBonus;
      case "revisadas":
        return (b.lastReviewedAt?.getTime() ?? 0) - (a.lastReviewedAt?.getTime() ?? 0) || byBonus;
      case "caducan":
        return (a.expiresAt?.getTime() ?? Infinity) - (b.expiresAt?.getTime() ?? Infinity) || byBonus;
      default:
        return byBonus;
    }
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
  const [compare, setCompare] = useState<string[]>([]);

  // La selección para comparar se recuerda en este navegador (si se puede); nunca es imprescindible.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(COMPARE_KEY) ?? "[]");
      if (Array.isArray(saved)) {
        const valid = saved.filter((s): s is string => typeof s === "string" && offers.some((o) => o.slug === s)).slice(0, MAX_COMPARE);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee una sola vez al montar, tras hidratar
        setCompare(valid);
      }
    } catch {
      /* sin almacenamiento: se empieza vacío */
    }
  }, [offers]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(compare));
    } catch {
      /* sin almacenamiento */
    }
  }, [compare]);

  // La URL refleja la búsqueda, los filtros y el orden: se puede compartir o volver atrás sin perderlos.
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
  const matchesQuery = (o: OfferItem) => !q || norm(o.entity.name).includes(q) || norm(o.title).includes(q);

  const results = useMemo(
    () => sortOffers(offers.filter((o) => matchesQuery(o) && matchesFilters(o, filters)), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matchesQuery depende solo de q
    [offers, q, filters, sort],
  );

  // Cuántas ofertas quedarían al elegir cada opción, con el resto de filtros y la búsqueda actuales.
  const countFor = (group: FilterGroupKey, value?: string) =>
    offers.filter((o) => matchesQuery(o) && matchesFilters(o, { ...filters, [group]: value }, value ? undefined : group)).length;

  const activeCount = GROUPS.filter((g) => filters[g]).length + (q ? 1 : 0);
  const clearAll = () => {
    setQuery("");
    setFilters({});
  };

  const toggleCompare = (slug: string) =>
    setCompare((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= MAX_COMPARE ? cur : [...cur, slug]));

  return (
    <div>
      <div role="search" className="flex flex-col gap-3">
        <div className="relative">
          <label htmlFor="buscar" className="sr-only">
            Buscar por entidad
          </label>
          <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="buscar"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 60))}
            placeholder="Busca una entidad: Openbank, Revolut…"
            className="input pl-10"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GROUPS.map((g) => {
            const group = FILTER_GROUPS[g];
            return (
              <div key={g} className="field">
                <label htmlFor={`f-${g}`} className="!text-xs !font-semibold text-muted">
                  {group.label}
                </label>
                <select
                  id={`f-${g}`}
                  value={filters[g] ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, [g]: e.target.value || undefined }))}
                  className={`input ${filters[g] ? "border-brand font-semibold text-brand-dark" : ""}`}
                >
                  <option value="">
                    {group.all} ({countFor(g)})
                  </option>
                  {Object.entries(group.options).map(([value, opt]) => {
                    const n = countFor(g, value);
                    return (
                      <option key={value} value={value} disabled={n === 0 && filters[g] !== value}>
                        {opt.label} ({n})
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
          <div className="field">
            <label htmlFor="f-orden" className="!text-xs !font-semibold text-muted">
              Ordenar por
            </label>
            <select id="f-orden" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input">
              {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex min-h-9 flex-wrap items-center justify-between gap-2 text-sm">
          <p aria-live="polite" className="text-muted">
            <strong className="text-ink">{results.length}</strong> {results.length === 1 ? "oferta" : "ofertas"}
            {activeCount > 0 ? ` de ${offers.length}` : ""}
            {sort === "desembolso" && results.some((o) => o.requiredCents == null && o.effort !== "NONE")
              ? " · las que no indican importe van al final"
              : ""}
          </p>
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="btn btn-ghost btn-sm">
              <IconX size={14} />
              Borrar filtros
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card mt-2 flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-bg text-muted">
            <IconSearch size={22} />
          </span>
          <p className="font-semibold">Ninguna oferta cumple {q ? "esta búsqueda y " : ""}estos filtros.</p>
          <p className="hint">Prueba a quitar algún filtro o a buscar otra entidad.</p>
          <button type="button" onClick={clearAll} className="btn btn-primary btn-sm">
            Ver todas las ofertas
          </button>
        </div>
      ) : (
        <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((o) => (
            <li key={o.id} className="flex">
              <PromoCard
                p={o}
                compare={{
                  selected: compare.includes(o.slug),
                  disabled: compare.length >= MAX_COMPARE,
                  onToggle: () => toggleCompare(o.slug),
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Hueco para que la barra de comparar no tape lo último de la página. */}
      {compare.length > 0 && <div aria-hidden className="h-20" />}

      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="wrap flex min-h-16 items-center gap-3 py-2">
            <IconColumns size={20} className="hidden text-brand sm:block" />
            <p className="min-w-0 flex-1 text-sm">
              <strong>
                {compare.length} de {MAX_COMPARE}
              </strong>{" "}
              <span className="text-muted">
                {compare.length < 2 ? "· elige al menos otra para comparar" : "seleccionadas para comparar"}
              </span>
            </p>
            <button type="button" onClick={() => setCompare([])} className="btn btn-ghost btn-sm">
              Vaciar
            </button>
            {compare.length >= 2 ? (
              <Link href={`/comparar?o=${compare.join(",")}`} className="btn btn-primary btn-sm">
                Comparar
                <IconArrowRight size={14} />
              </Link>
            ) : (
              <span className="btn btn-primary btn-sm cursor-not-allowed opacity-50" aria-disabled="true">
                Comparar
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
