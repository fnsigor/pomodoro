export interface Aba {
  id: string;
  rotulo: string;
}

export interface NavTabsProps {
  abas: Aba[];
  ativa: string;
  onSelecionar: (id: string) => void;
}

/** Pílula escura de navegação por abas; a aba ativa fica preenchida com --color-primary. */
export function NavTabs({ abas, ativa, onSelecionar }: NavTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Navegação"
      className="flex items-center gap-[3px] rounded-[28px] border border-border bg-panel-2 p-[6px] max-mobile:w-full max-mobile:justify-between"
    >
      {abas.map((aba) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => onSelecionar(aba.id)}
            className={`whitespace-nowrap rounded-[24px] px-6 py-[11px] font-sans text-base transition-colors motion-reduce:transition-none max-mobile:px-[14px] max-mobile:text-[13px] ${
              selecionada ? 'bg-primary font-semibold text-ink' : 'bg-transparent font-medium text-muted'
            }`}
          >
            {aba.rotulo}
          </button>
        );
      })}
    </div>
  );
}
