import type { ReactNode } from 'react';

export interface PrimaryButtonProps {
  icone: ReactNode;
  rotulo: string;
  onClick?: () => void;
  disabled?: boolean;
}

/** Botão principal ("go"): pílula de 68px, ícone + rótulo, glow leve, hover translateY. */
export function PrimaryButton({ icone, rotulo, onClick, disabled }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[68px] min-w-[226px] items-center justify-center gap-[13px] rounded-[17px] bg-primary px-[30px] font-sans text-[17px] font-semibold text-ink shadow-[0_8px_18px_var(--color-glow)] transition-[transform,background-color] duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-px motion-reduce:transition-none max-mobile:h-[58px] max-mobile:w-[175px] max-mobile:min-w-0 max-mobile:px-[15px] max-mobile:text-sm"
    >
      {icone}
      <span>{rotulo}</span>
    </button>
  );
}
