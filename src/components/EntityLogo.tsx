/* eslint-disable @next/next/no-img-element -- los logos que ponga el administrador pueden venir de cualquier dirección */
import Image from "next/image";

/** Iconos que se sirven a través de la propia web (optimizador de Next): ver images.remotePatterns en next.config.ts. */
const PROXIED = /^https:\/\/www\.google\.com\/s2\/favicons\?/;

/** Logo de la entidad o, si no hay, sus iniciales sobre su color. Decorativo: el nombre siempre va al lado. */
export function EntityLogo({ name, logoUrl, color, size = 48 }: { name: string; logoUrl: string | null; color: string; size?: number }) {
  const box = "shrink-0 rounded-xl border border-line bg-white object-contain";
  const pad = Math.round(size * 0.14);
  if (logoUrl && PROXIED.test(logoUrl)) {
    return <Image src={logoUrl} alt="" width={size} height={size} className={box} style={{ width: size, height: size, padding: pad }} />;
  }
  if (logoUrl) {
    return <img src={logoUrl} alt="" width={size} height={size} loading="lazy" className={box} style={{ width: size, height: size, padding: pad }} />;
  }
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl font-extrabold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
