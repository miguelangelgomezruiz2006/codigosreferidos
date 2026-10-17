import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";
import "./globals.css";

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
    <html lang="es">
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Saltar al contenido
        </a>
        <header className="sticky top-0 z-20 border-b border-brand-dark/20 bg-brand text-white">
          <div className="wrap flex min-h-14 items-center gap-2 sm:gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
              <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-sm font-black text-ink">€</span>
              {SITE_NAME}
            </Link>
            <nav aria-label="Principal" className="ml-auto flex items-center gap-1 text-sm font-medium">
              <Link href="/como-funciona" className="hidden rounded-md px-2 py-2 hover:bg-white/10 sm:block">
                Cómo funciona
              </Link>
              <Link href="/caducadas" className="hidden rounded-md px-2 py-2 hover:bg-white/10 sm:block">
                Caducadas
              </Link>
              {user?.role === "ADMIN" && (
                <Link href="/admin" className="rounded-md px-2 py-2 hover:bg-white/10">
                  Admin
                </Link>
              )}
              <Link href="/mi-panel" className="whitespace-nowrap rounded-lg bg-white/15 px-3 py-2 hover:bg-white/25">
                {user ? "Mis códigos" : "Comparte tu código"}
              </Link>
              <MobileMenu />
            </nav>
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="mt-12 border-t border-line bg-white">
          <div className="wrap grid gap-4 py-8 text-sm text-muted">
            <p>
              <strong className="text-ink">{SITE_NAME}</strong> recopila promociones públicas de entidades financieras. No es un banco ni da
              asesoramiento financiero: lee siempre las condiciones oficiales antes de contratar. Algunos códigos son del propietario de la web,
              que puede recibir una recompensa si los usas.
            </p>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/como-funciona" className="hover:text-ink">Cómo funciona y cómo ganamos dinero</Link>
              <Link href="/caducadas" className="hover:text-ink">Promociones caducadas</Link>
              <Link href="/aviso-legal" className="hover:text-ink">Aviso legal</Link>
              <Link href="/privacidad" className="hover:text-ink">Privacidad</Link>
              <Link href="/cookies" className="hover:text-ink">Cookies</Link>
              {settings.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-ink">
                  Contacto
                </a>
              )}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
