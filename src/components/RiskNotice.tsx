type Risk = "NONE" | "INVESTMENT" | "CRYPTO";

/** Aviso de riesgo visible en las fichas de inversión y criptomonedas. */
export function RiskNotice({ risk }: { risk: Risk }) {
  if (risk === "NONE") return null;
  return (
    <div role="note" className="flex gap-3 rounded-xl border-2 border-danger/30 bg-danger-soft p-4 text-sm text-ink">
      <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-danger font-black text-white">
        !
      </span>
      {risk === "CRYPTO" ? (
        <p>
          <strong>Aviso de riesgo:</strong> la inversión en criptoactivos no está regulada, puede no ser adecuada para inversores minoristas y
          perderse la totalidad del importe invertido. Más información en la{" "}
          <a href="https://www.cnmv.es" target="_blank" rel="noopener noreferrer" className="underline">
            web de la CNMV
          </a>
          .
        </p>
      ) : (
        <p>
          <strong>Aviso de riesgo:</strong> es un producto de inversión. Su valor puede bajar y podrías perder parte o todo el dinero que inviertas.
          Infórmate bien antes de invertir y no inviertas dinero que puedas necesitar.
        </p>
      )}
    </div>
  );
}

export function RiskBadge({ risk }: { risk: Risk }) {
  if (risk === "NONE") return null;
  return <span className="badge bg-danger-soft text-danger">{risk === "CRYPTO" ? "Cripto · riesgo alto" : "Inversión con riesgo"}</span>;
}
