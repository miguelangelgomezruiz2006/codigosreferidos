"use client";
import { useActionState } from "react";
import { requestLoginLinkAction, type FormState } from "@/app/actions/account";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<FormState, FormData>(requestLoginLinkAction, null);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      {state?.error && <p className="note note-err" role="alert">{state.error}</p>}
      <div className="field">
        <label htmlFor="l-e">Tu email</label>
        <input id="l-e" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <p className="hint">Sin contraseñas: te enviamos un enlace para entrar. Caduca en 15 minutos.</p>
      <SubmitButton className="btn btn-primary w-full" pendingText="Enviando…">Enviarme el enlace</SubmitButton>
    </form>
  );
}
