import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card genérico (base do ".panel" do protótipo): borda 1px, raio 24px, fundo panel.
 * Só cuida da "caixa" — layout interno (flex row/column, altura) fica por
 * conta de quem usa (`DailyGoalCard`, `ShortcutsCard`, futuros cards do Histórico).
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-[24px] border border-border bg-panel px-6 py-[27px] max-mobile:rounded-[19px] max-mobile:px-[17px] max-mobile:py-5 ${className}`}
    >
      {children}
    </div>
  );
}
