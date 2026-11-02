export interface TimeDisplayProps {
  texto: string;
}

/** Tempo grande no centro do anel, com dígitos de largura fixa (tabular-nums). */
export function TimeDisplay({ texto }: TimeDisplayProps) {
  return (
    <div className="font-display text-[clamp(65px,13vh,100px)] font-medium leading-none tracking-[-5px] tabular-nums max-mobile:text-[clamp(65px,19vw,88px)] max-mobile:tracking-[-4px]">
      {texto}
    </div>
  );
}
