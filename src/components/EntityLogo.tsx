/* eslint-disable @next/next/no-img-element -- los logos pueden venir de cualquier dirección que ponga el administrador */

/** Logo de la entidad o, si no hay, sus iniciales sobre su color. */
export function EntityLogo({ name, logoUrl, color, size = 48 }: { name: string; logoUrl: string | null; color: string; size?: number }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo de ${name}`}
        width={size}
        height={size}
        className="shrink-0 rounded-lg border border-line bg-white object-contain p-1"
        style={{ width: size, height: size }}
      />
    );
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
      className="grid shrink-0 place-items-center rounded-lg font-extrabold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
