"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const LINKS = [
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/", label: "Promociones activas" },
  { href: "/caducadas", label: "Caducadas" },
];

/** Menú del móvil. Funciona sin JavaScript (<details>) y se cierra solo al cambiar de página o tocar fuera. */
export function MobileMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false;
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <details ref={ref} className="group relative sm:hidden">
      <summary
        className="grid size-11 cursor-pointer list-none place-items-center rounded-lg hover:bg-white/10 [&::-webkit-details-marker]:hidden"
        aria-label="Menú"
      >
        <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
          <path d="M6 6l12 12M18 6L6 18" className="hidden group-open:block" />
        </svg>
      </summary>
      <div className="absolute right-0 top-12 flex w-56 flex-col rounded-xl border border-line bg-white p-2 text-base text-ink shadow-lg">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-3 hover:bg-bg ${pathname === l.href ? "font-semibold text-brand-dark" : ""}`}
            aria-current={pathname === l.href ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
