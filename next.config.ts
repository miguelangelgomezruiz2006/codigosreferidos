import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  images: {
    // Logos de las entidades: se piden al servicio público de iconos de Google y se sirven desde esta web,
    // así el navegador del visitante no se conecta a terceros.
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons" },
      { protocol: "https", hostname: "*.gstatic.com", pathname: "/faviconV2" },
    ],
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];
    if (process.env.NODE_ENV === "production") {
      security.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
    }
    return [{ source: "/:path*", headers: security }];
  },
};

export default config;
