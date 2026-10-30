export type PontoEstado = 'feito' | 'atual' | 'pendente';

export interface CycleDotsProps {
  pontos: PontoEstado[];
}

/**
 * Indicador de 4 pontos do ciclo Pomodoro. O protótipo só diferencia "atual"
 * (roxo) de "pendente" (cinza); como não há um terceiro tom definido para
 * "feito", usamos --color-primary-soft para distingui-lo visualmente de
 * "atual" (--color-primary cheio) — decisão de design não especificada.
 */
export function CycleDots({ pontos }: CycleDotsProps) {
  return (
    <div className="mb-[19px] flex gap-[6px]">
      {pontos.map((estado, indice) => (
        <span
          key={indice}
          className={`h-2 w-2 rounded-full ${
            estado === 'pendente' ? 'bg-track' : estado === 'atual' ? 'bg-primary' : 'bg-primary-soft'
          }`}
        />
      ))}
    </div>
  );
}
