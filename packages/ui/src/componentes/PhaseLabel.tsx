export interface PhaseLabelProps {
  texto: string;
}

/** Rótulo da fase dentro do anel (ex.: "FASE DE FOCO"). */
export function PhaseLabel({ texto }: PhaseLabelProps) {
  return (
    <div className="mb-2 font-sans text-sm font-medium tracking-[3px] text-muted max-mobile:text-[11px] max-mobile:tracking-[2px]">
      {texto}
    </div>
  );
}
