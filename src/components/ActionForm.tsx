"use client";
import { createContext, startTransition, useActionState } from "react";
import type { FormState } from "@/app/actions/account";

/** Dice a los botones de envío que el servidor está respondiendo. */
export const FormPendingContext = createContext(false);

/**
 * Formulario que muestra el mensaje de éxito o error que devuelve el servidor.
 * Conserva lo escrito si hay un error (React lo borraría con un envío normal)
 * y, con `resetOnSuccess`, se vacía solo cuando todo ha ido bien.
 */
export function ActionForm({
  action,
  children,
  className = "flex flex-col gap-3",
  resetOnSuccess = false,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  return (
    <form
      key={resetOnSuccess ? (state?.nonce ?? 0) : undefined}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {state?.error && <p className="note note-err" role="alert">{state.error}</p>}
      {state?.ok && <p className="note note-ok" role="status">{state.ok}</p>}
      <FormPendingContext.Provider value={pending}>{children}</FormPendingContext.Provider>
    </form>
  );
}
