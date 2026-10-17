import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap mt-10 max-w-xl text-center">
      <h1 className="text-2xl font-extrabold">No encontramos esta página</h1>
      <p className="hint mt-2">Puede que la promoción ya no exista.</p>
      <Link href="/" className="btn btn-primary mt-6">Ver promociones activas</Link>
    </div>
  );
}
