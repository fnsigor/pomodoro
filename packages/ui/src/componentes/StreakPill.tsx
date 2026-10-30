import { IconeFogo } from '../icones';

export interface StreakPillProps {
  dias: number;
}

/** Pílula "N dias" com ícone de fogo, usada no cabeçalho. */
export function StreakPill({ dias }: StreakPillProps) {
  return (
    <div className="flex h-[42px] items-center gap-2 rounded-[24px] border border-border bg-panel-2 px-[15px] font-sans text-sm text-ink">
      <IconeFogo className="h-[17px] w-[17px] text-fire" />
      <span>{dias} dias</span>
    </div>
  );
}
