export interface ProgressBarProps {
  /** Já deve vir limitado a 100 por quem chama; aqui só garantimos que não passe visualmente. */
  percentual: number;
}

/** Barra de progresso: trilho --color-track, preenchimento --color-primary. */
export function ProgressBar({ percentual }: ProgressBarProps) {
  const largura = Math.min(100, Math.max(0, percentual));

  return (
    <div className="h-2 overflow-hidden rounded-[9px] bg-track">
      <div className="h-full bg-primary" style={{ width: `${largura}%` }} />
    </div>
  );
}
