export type PresetVariante = 'selecionado' | 'normal' | 'adicionar';

export interface PresetCardProps {
  rotulo: string;
  valorCurto: string;
  unidade?: string;
  variante: PresetVariante;
  ariaLabel?: string;
  onClick?: () => void;
}

/**
 * Item individual do carrossel de presets. Replica as medidas exatas do
 * protótipo: 72px normal, 112px selecionado (que cresce e sobe margin-top:-25px).
 * A variante "adicionar" (tracejada) não participa do radiogroup como opção
 * selecionável, por isso não recebe role="radio".
 */
export function PresetCard({ rotulo, valorCurto, unidade, variante, ariaLabel, onClick }: PresetCardProps) {
  const selecionado = variante === 'selecionado';
  const adicionar = variante === 'adicionar';

  return (
    <button
      type="button"
      role={adicionar ? undefined : 'radio'}
      aria-checked={adicionar ? undefined : selecionado}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center transition-[width,margin,gap] motion-reduce:transition-none max-mobile:w-[58px] max-mobile:min-w-[58px] ${
        selecionado
          ? 'w-[100px] -mt-[14px] gap-[12px] text-primary max-mobile:w-[78px] max-mobile:min-w-[78px] max-mobile:-mt-[10px] max-mobile:gap-[8px]'
          : 'w-[72px] gap-2 text-disabled-ink'
      }`}
    >
      <span
        className={`font-display max-mobile:h-[58px] max-mobile:w-[58px] ${
          adicionar
            ? 'grid h-[72px] w-[72px] place-items-center rounded-[15px] border border-dashed border-panel-2 bg-panel-sunken text-2xl font-normal text-disabled-ink'
            : selecionado
              ? 'flex h-[100px] w-[100px] flex-col items-center justify-center gap-[2px] rounded-[22px] border-2 border-primary bg-panel-2 text-primary shadow-[0_0_30px_var(--color-glow)] max-mobile:h-[78px] max-mobile:w-[78px] max-mobile:rounded-[18px]'
              : 'grid h-[72px] w-[72px] place-items-center rounded-[15px] border border-panel-2 bg-panel-sunken text-base font-bold text-disabled-ink'
        }`}
      >
        {selecionado ? (
          <>
            <span className="text-[27px] leading-none font-bold max-mobile:text-[23px]">{valorCurto}</span>
            {unidade ? <span className="text-[9px] leading-none tracking-[0.8px] text-muted">{unidade}</span> : null}
          </>
        ) : (
          valorCurto
        )}
      </span>
      <span
        className={`whitespace-nowrap max-mobile:text-[9px] ${
          selecionado
            ? 'text-[13px] font-semibold text-primary max-mobile:text-[10px]'
            : 'text-[11px] text-disabled-ink'
        }`}
      >
        {rotulo}
      </span>
    </button>
  );
}
