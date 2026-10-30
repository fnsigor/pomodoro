import type { ReactNode } from 'react';

export interface TopbarProps {
  marca: ReactNode;
  navegacao: ReactNode;
  ferramentas: ReactNode;
}

/**
 * Grid de 3 colunas (marca | navegação | ferramentas), altura ~54px.
 * Abaixo de 1051px (tablet) as ferramentas somem; abaixo de 621px (mobile)
 * o topbar vira flex com a navegação em largura total, como no protótipo.
 */
export function Topbar({ marca, navegacao, ferramentas }: TopbarProps) {
  return (
    <header className="grid h-[54px] grid-cols-[1fr_auto_1fr] items-center max-tablet:grid-cols-[1fr_auto] max-mobile:flex max-mobile:h-auto max-mobile:flex-wrap max-mobile:justify-between max-mobile:gap-[18px]">
      <div>{marca}</div>
      <nav
        aria-label="Navegação"
        className="justify-self-center max-tablet:justify-self-end max-mobile:order-3 max-mobile:w-full"
      >
        {navegacao}
      </nav>
      <div className="flex items-center justify-end gap-6 max-tablet:hidden">{ferramentas}</div>
    </header>
  );
}
