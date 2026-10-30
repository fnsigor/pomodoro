import type { ReactNode } from 'react';

export interface IconButtonProps {
  icone: ReactNode;
  ariaLabel: string;
  title?: string;
  onClick?: () => void;
  /** Quando presente, o botão vira um toggle (`aria-pressed`) — ex.: som do Temporizador. */
  pressed?: boolean;
}

/** Botão redondo 40px, só com ícone — sempre exige `ariaLabel`. */
export function IconButton({ icone, ariaLabel, title, onClick, pressed }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      title={title}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-panel-2 text-muted transition-colors motion-reduce:transition-none"
    >
      {icone}
    </button>
  );
}
