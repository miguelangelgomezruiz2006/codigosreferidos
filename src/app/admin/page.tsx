import Link from "next/link";
import { db } from "@/lib/db";

async function countEvents(since: Date) {
  const rows = await db.codeEvent.groupBy({ by: ["type"], where: { createdAt: { gte: since } }, _count: true });
  const get = (t: string) => rows.find((r) => r.type === t)?._count ?? 0;
  return { reveal: get("REVEAL"), copy: get("COPY"), open: get("OPEN") };
}

function since(days: number) {
  return new Date(Date.now() - days * 24 * 3600e3);
}

export default async function AdminHome() {
  const [today, week, month, promos, topCodes] = await Promise.all([
    countEvents(since(1)),
    countEvents(since(7)),
    countEvents(since(30)),
    db.promotion.findMany({
      where: { status: { not: "DRAFT" } },
      include: { entity: true, codes: { select: { timesShown: true, timesCopied: true, timesOpened: true, uses: true, kind: true } } },
    }),
    db.referralCode.findMany({
      orderBy: [{ timesCopied: "desc" }, { timesOpened: "desc" }, { timesShown: "desc" }],
      take: 15,
      include: { promotion: { include: { entity: true } }, user: { select: { email: true } } },
    }),
  ]);

  const perPromo = promos
    .map((p) => ({
      id: p.id,
      name: `${p.entity.name} · ${p.bonusText}`,
      shown: p.codes.reduce((s, c) => s + c.timesShown, 0),
      copied: p.codes.reduce((s, c) => s + c.timesCopied, 0),
      opened: p.codes.reduce((s, c) => s + c.timesOpened, 0),
      adminUses: p.codes.filter((c) => c.kind === "ADMIN").reduce((s, c) => s + c.uses, 0),
    }))
    .sort((a, b) => b.copied + b.opened - (a.copied + a.opened));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Resumen</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Últimas 24 h", today],
          ["Últimos 7 días", week],
          ["Últimos 30 días", month],
        ].map(([label, s]) => {
          const v = s as Awaited<ReturnType<typeof countEvents>>;
          return (
            <div key={label as string} className="card p-4">
              <p className="text-sm text-muted">{label as string}</p>
              <p className="mt-1 text-3xl font-extrabold">{v.copy + v.open}</p>
              <p className="text-xs text-muted">
                copias y enlaces abiertos · {v.reveal} códigos mostrados
              </p>
            </div>
          );
        })}
      </div>

      <section className="card overflow-x-auto p-4">
        <h2 className="mb-2 font-bold">Por promoción</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Promoción</th>
              <th>Mostrado</th>
              <th>Copiado</th>
              <th>Enlace</th>
              <th>Usos de tus códigos</th>
            </tr>
          </thead>
          <tbody>
            {perPromo.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/promociones/${p.id}`} className="font-medium hover:underline">{p.name}</Link></td>
                <td>{p.shown}</td>
                <td>{p.copied}</td>
                <td>{p.opened}</td>
                <td>{p.adminUses}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {perPromo.length === 0 && <p className="hint">Aún no hay datos.</p>}
      </section>

      <section className="card overflow-x-auto p-4">
        <h2 className="mb-2 font-bold">Códigos más usados</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>De</th>
              <th>Promoción</th>
              <th>Mostrado</th>
              <th>Copiado</th>
              <th>Enlace</th>
            </tr>
          </thead>
          <tbody>
            {topCodes.map((c) => (
              <tr key={c.id}>
                <td className="font-mono">{c.code ?? "Solo enlace"}</td>
                <td>{c.kind === "ADMIN" ? "Tú" : c.user?.email}</td>
                <td>{c.promotion.entity.name}</td>
                <td>{c.timesShown}</td>
                <td>{c.timesCopied}</td>
                <td>{c.timesOpened}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
