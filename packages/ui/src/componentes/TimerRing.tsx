import type { CSSProperties, ReactNode } from 'react';

export interface TimerRingProps {
  /** Progresso de 0 a 1. */
  progresso: number;
  /** Tamanho máximo em px (default 368, como no protótipo). Encolhe para caber em 100vh e, abaixo de 621px, vira min(82vw,330px). */
  tamanho?: number;
  /**
   * Cor do traço de progresso, como valor CSS (ex.: "var(--color-primary)").
   * Default primary; preparado para a futura cor de pausa (decisão em aberto
   * no CLAUDE.md), mas a troca de cor em si não é implementada aqui.
   */
  cor?: string;
  ariaLabel: string;
  children?: ReactNode;
}

const RAIO = 180;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

/**
 * Altura ocupada por paddings, topbar, presets e controles em volta do anel,
 * mais ~40px de folga para o anel não encostar na lista de presets.
 * O anel encolhe para caber em 100vh: viewport - reservado, limitado a `tamanho`.
 * Ajustar se o layout vertical da tela do timer mudar.
 */
const ALTURA_RESERVADA_PX = 388;

/** Anel SVG grande do Temporizador: trilho + progresso, começando no topo. */
export function TimerRing({ progresso, tamanho = 368, cor, ariaLabel, children }: TimerRingProps) {
  const proporcao = Math.min(1, Math.max(0, progresso));
  const offset = CIRCUNFERENCIA * (1 - proporcao);

  return (
    <div
      role="timer"
      aria-label={ariaLabel}
      className="relative grid h-[var(--tamanho-anel)] w-[var(--tamanho-anel)] shrink-0 place-items-center max-mobile:h-[min(82vw,330px,41vh)] max-mobile:w-[min(82vw,330px,41vh)]"
      style={{ '--tamanho-anel': `clamp(160px, calc(100vh - ${ALTURA_RESERVADA_PX}px), ${tamanho}px)` } as CSSProperties}
    >
      <svg viewBox="0 0 368 368" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90 overflow-visible">
        <circle cx="184" cy="184" r={RAIO} strokeWidth={8} className="fill-none stroke-track" />
        <circle
          cx="184"
          cy="184"
          r={RAIO}
          fill="none"
          stroke={cor ?? 'var(--color-primary)'}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none"
        />
      </svg>
      <div className="z-[1] mt-[2px] flex flex-col items-center">{children}</div>
    </div>
  );
}
