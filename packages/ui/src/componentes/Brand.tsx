import { IconeRaio } from '../icones';

/** Ícone de raio em quadrado violeta 40px + texto "FocusFlow". */
export function Brand() {
  return (
    <div className="flex items-center gap-[9px] font-display text-[22px] font-bold tracking-[-0.6px] text-primary max-mobile:text-[19px]">
      <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-primary text-ink max-mobile:h-[34px] max-mobile:w-[34px]">
        <IconeRaio className="h-[23px] w-[23px]" />
      </span>
      FocusFlow
    </div>
  );
}
