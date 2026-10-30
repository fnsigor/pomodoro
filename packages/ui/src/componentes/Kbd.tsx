import type { ReactNode } from 'react';

export interface KbdProps {
  children: ReactNode;
}

/** Tecla estilo ".key" do protótipo. */
export function Kbd({ children }: KbdProps) {
  return (
    <span className="grid h-[25px] min-w-[25px] place-items-center rounded-[4px] border border-border-strong bg-panel-2 px-[7px] font-display text-[11px] text-primary-soft max-mobile:min-w-[23px]">
      {children}
    </span>
  );
}
