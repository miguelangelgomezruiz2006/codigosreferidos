import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen que aparece al compartir un enlace de la web (WhatsApp, redes, etc.).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0e6b5c", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: 22, background: "#f2b33d", color: "#13261f", fontSize: 64, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>€</div>
          <div style={{ fontSize: 72, fontWeight: 900 }}>{SITE_NAME}</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 52, fontWeight: 800, lineHeight: 1.15 }}>Gana dinero con las promociones de bancos y fintechs</div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#f2b33d" }}>Códigos de invitación listos para copiar · Sin registrarte</div>
      </div>
    ),
    size,
  );
}
