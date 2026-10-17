const STATUS = {
  PENDING: ["Pendiente de revisión", "bg-accent-soft text-ink"],
  APPROVED: ["Publicado", "bg-brand-soft text-brand-dark"],
  REJECTED: ["Rechazado", "bg-danger-soft text-danger"],
  HIDDEN: ["Oculto por avisos", "bg-danger-soft text-danger"],
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  const [label, cls] = STATUS[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
