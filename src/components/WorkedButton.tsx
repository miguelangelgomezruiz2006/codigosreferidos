"use client";
import { useState, useTransition } from "react";
import { workedAction } from "@/app/actions/public";

export function WorkedButton({ promotionId, entityName, initialCount }: { promotionId: string; entityName: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function vote() {
    start(async () => {
      const res = await workedAction(promotionId);
      setMessage(res.message);
      if (typeof res.count === "number") setCount(res.count);
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <h2 className="font-bold">¿Ya has cobrado el bono de {entityName}?</h2>
      <p className="text-sm">
        {count > 0
          ? `${count} ${count === 1 ? "persona ha confirmado" : "personas han confirmado"} que les ha funcionado.`
          : "Sé el primero en confirmar que funciona."}
      </p>
      {message ? (
        <p className="note note-ok" role="status">{message}</p>
      ) : (
        <button type="button" className="btn btn-primary btn-sm" onClick={vote} disabled={pending}>
          {pending ? "Enviando…" : "Sí, me ha funcionado"}
        </button>
      )}
    </div>
  );
}
