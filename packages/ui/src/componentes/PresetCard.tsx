import { motion, useReducedMotion, type Transition } from 'motion/react';

export type PresetVariante = 'selecionado' | 'normal' | 'adicionar';

export interface PresetCardProps {
  rotulo: string;
  valorCurto: string;
  unidade?: string;
  variante: PresetVariante;
  ariaLabel?: string;
  onClick?: () => void;
}

const MOLA = { type: 'spring', stiffness: 460, damping: 36, mass: 0.7 } as const;

/**
 * Item individual do carrossel de presets. As medidas seguem o protótipo
 * (72px normal, 100px selecionado); a transição entre os dois estados usa
 * spring e `layout` do Motion para os cards vizinhos deslizarem junto.
 */
export function PresetCard({ rotulo, valorCurto, unidade, variante, ariaLabel, onClick }: PresetCardProps) {
  const selecionado = variante === 'selecionado';
  const adicionar = variante === 'adicionar';
  const reduzirMovimento = useReducedMotion();
  const transicao: Transition = reduzirMovimento ? { duration: 0 } : MOLA;
  const transicaoConteudo: Transition = reduzirMovimento
    ? { duration: 0 }
    : { duration: 0.18, ease: 'easeOut' };

  return (
    <motion.button
      layout
      transition={transicao}
      whileTap={adicionar || reduzirMovimento ? undefined : { scale: 0.97 }}
      type="button"
      role={adicionar ? undefined : 'radio'}
      aria-checked={adicionar ? undefined : selecionado}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center max-mobile:w-[58px] max-mobile:min-w-[58px] ${
        selecionado
          ? 'w-[100px] -mt-[14px] gap-[12px] text-primary max-mobile:w-[78px] max-mobile:min-w-[78px] max-mobile:-mt-[10px] max-mobile:gap-[8px]'
          : 'w-[72px] gap-2 text-disabled-ink'
      }`}
    >
      <motion.span
        layout
        transition={transicao}
        className={`font-display max-mobile:h-[58px] max-mobile:w-[58px] ${
          adicionar
            ? 'grid h-[72px] w-[72px] place-items-center rounded-[15px] border border-dashed border-panel-2 bg-panel-sunken text-2xl font-normal text-disabled-ink'
            : selecionado
              ? 'flex h-[100px] w-[100px] flex-col items-center justify-center rounded-[22px] border-2 border-primary bg-panel-2 text-primary shadow-[0_0_30px_var(--color-glow)] max-mobile:h-[78px] max-mobile:w-[78px] max-mobile:rounded-[18px]'
              : 'grid h-[72px] w-[72px] place-items-center rounded-[15px] border border-panel-2 bg-panel-sunken text-base font-bold text-disabled-ink'
        }`}
      >
        <motion.span
          key={selecionado ? 'selecionado' : 'normal'}
          initial={{ opacity: reduzirMovimento ? 1 : 0, scale: reduzirMovimento ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transicaoConteudo}
          className={selecionado ? 'flex flex-col items-center gap-[2px]' : 'text-base font-bold'}
        >
          {selecionado ? (
            <>
              <span className="text-[27px] leading-none font-bold max-mobile:text-[23px]">{valorCurto}</span>
              {unidade ? <span className="text-[9px] leading-none tracking-[0.8px] text-muted">{unidade}</span> : null}
            </>
          ) : (
            valorCurto
          )}
        </motion.span>
      </motion.span>
      <motion.span
        layout
        transition={transicao}
        className={`whitespace-nowrap max-mobile:text-[9px] ${
          selecionado
            ? 'text-[13px] font-semibold text-primary max-mobile:text-[10px]'
            : 'text-[11px] text-disabled-ink'
        }`}
      >
        {rotulo}
      </motion.span>
    </motion.button>
  );
}
