export interface StatusBadgeProps {
  texto: string;
}

/** Pílula tipo ".ready" do protótipo: ponto colorido + texto. */
export function StatusBadge({ texto }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2 rounded-[22px] border border-border bg-panel-2 px-[15px] py-[7px] font-sans text-xs text-muted">
      <span className="h-[10px] w-[10px] rounded-full bg-primary shadow-[0_0_0_3px_var(--color-glow)]" />
      {texto}
    </div>
  );
}
