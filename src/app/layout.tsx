import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";
import "./globals.css";

// Tipografía propia para titulares e importes; el texto corrido usa la del sistema (rápida y legible).
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });

const DESCRIPTION =
  "Promociones de bienvenida de bancos, brokers y fintechs en España, con los requisitos explicados paso a paso y códigos de invitación que funcionan.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: SITE_NAME,
  openGraph: { type: "website", locale: "es_ES", siteName: SITE_NAME, title: `${SITE_NAME} · ${SITE_TAGLINE}`, description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
  title: { default: `${SITE_NAME} · ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
};

export const viewport: Viewport = { themeColor: "#0e6b5c", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  return (
    <html lang="es" className={display.variable}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Saltar al contenido
        </a>
        <header className="sticky top-0 z-20 border-b border-brand-dark/20 bg-brand text-white">
          <div className="wrap flex min-h-14 items-center gap-2 sm:gap-3">
            <Link href="/" className="font-display flex shrink-0 items-center gap-2 text-base font-bold sm:text-lg">
              <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-sm font-black text-ink">€</span>
              {SITE_NAME}
            </Link>
            <nav aria-label="Principal" className="ml-auto flex items-center gap-0.5 text-sm font-semibold sm:gap-2">
              <Link href="/como-funciona" className="whitespace-nowrap rounded-md px-1.5 py-2 hover:bg-white/10 sm:px-2">
                Cómo funciona
              </Link>
              {user?.role === "ADMIN" && (
                <Link href="/admin" className="hidden rounded-md px-2 py-2 hover:bg-white/10 sm:block">
                  Admin
                </Link>
              )}
              <Link href="/#ofertas" className="btn btn-accent btn-sm whitespace-nowrap">
                <span className="sm:hidden">Ofertas</span>
                <span className="hidden sm:inline">Explorar ofertas</span>
              </Link>
            </nav>
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="mt-16 border-t border-line bg-white">
          <div className="wrap grid gap-4 py-8 text-sm text-muted">
            <p className="max-w-3xl">
              {SITE_NAME} recopila promociones públicas de bancos y apps. No es una entidad financiera ni da asesoramiento: lee las condiciones
              oficiales antes de contratar. Algunos códigos son del propietario de la web, que puede recibir una recompensa si los usas.
            </p>
            <nav aria-label="Más enlaces" className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/como-funciona" className="inline-flex min-h-10 items-center hover:text-ink">Cómo funciona</Link>
              <Link href="/caducadas" className="inline-flex min-h-10 items-center hover:text-ink">Ofertas caducadas</Link>
              <Link href="/mi-panel" className="inline-flex min-h-10 items-center hover:text-ink">{user ? "Mis códigos" : "Comparte tu código"}</Link>
              <Link href="/opinar" className="inline-flex min-h-10 items-center hover:text-ink">Deja tu opinión</Link>
              {user?.role === "ADMIN" && (
                <Link href="/admin" className="inline-flex min-h-10 items-center hover:text-ink sm:hidden">Admin</Link>
              )}
              {settings.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="inline-flex min-h-10 items-center hover:text-ink">
                  Contacto
                </a>
              )}
            </nav>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <Link href="/aviso-legal" className="inline-flex min-h-10 items-center hover:text-ink">Aviso legal</Link>
              <Link href="/privacidad" className="inline-flex min-h-10 items-center hover:text-ink">Privacidad</Link>
              <Link href="/cookies" className="inline-flex min-h-10 items-center hover:text-ink">Cookies</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
