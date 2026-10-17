"use client";
import { useContext } from "react";
import { useFormStatus } from "react-dom";
import { FormPendingContext } from "@/components/ActionForm";

/** Botón de envío que se desactiva mientras el servidor responde (evita dobles clics). */
export function SubmitButton({
  children,
  className = "btn btn-primary",
  pendingText,
  confirm,
  ...rest
}: { children: React.ReactNode; className?: string; pendingText?: string; confirm?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const status = useFormStatus();
  const actionFormPending = useContext(FormPendingContext);
  const pending = status.pending || actionFormPending;
  return (
    <button
      type="submit"
      {...rest}
      className={className}
      disabled={pending || rest.disabled}
      aria-busy={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? (pendingText ?? "Un momento…") : children}
    </button>
  );
}
