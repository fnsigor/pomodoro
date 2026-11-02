import type { ReactNode } from 'react';

export interface ControlButtonProps {
  icone: ReactNode;
  ariaLabel: string;
  title?: string;
  onClick?: () => void;
}

/** Botão quadrado 56px (ações secundárias, como reiniciar). */
export function ControlButton({ icone, ariaLabel, title, onClick }: ControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
      className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-panel text-muted max-mobile:h-12 max-mobile:w-12 [&_svg]:size-[21px] [&_svg]:shrink-0"
    >
      {icone}
    </button>
  );
}
