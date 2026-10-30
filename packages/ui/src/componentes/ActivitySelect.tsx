import { IconeChevron } from '../icones';

export interface ActivitySelectProps {
  rotulo: string;
  nome: string;
  /** Cor do chip da atividade — dado do usuário, não token de tema (CLAUDE.md). */
  corDot: string;
  onClick?: () => void;
}

/**
 * Botão/card que mostra a atividade atual e abre o seletor. O menu suspenso
 * em si (listbox/option) fica para um consumidor deste componente junto com
 * `Modal` — ver TODO abaixo.
 */
export function ActivitySelect({ rotulo, nome, corDot, onClick }: ActivitySelectProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[78px] w-[200px] rounded-[17px] border border-border bg-panel px-4 py-[15px] text-left text-muted max-tablet:hidden"
    >
      <small className="mb-2 block text-xs">{rotulo}</small>
      <span aria-hidden="true" className="mr-[9px] inline-block h-2 w-2 rounded-full" style={{ backgroundColor: corDot }} />
      <strong className="text-[15px] font-semibold text-ink">{nome}</strong>
      <span className="absolute bottom-[22px] right-[15px] text-muted">
        <IconeChevron className="h-3 w-3" />
      </span>
      {/* TODO: o menu de atividades (role="listbox"/"option") que este botão abre
          ainda não existe aqui — monte-o com o componente `Modal` em packages/app. */}
    </button>
  );
}
