import { Card } from './Card';
import { Kbd } from './Kbd';

export interface Atalho {
  tecla: string;
  descricao: string;
}

export interface ShortcutsCardProps {
  atalhos: Atalho[];
}

/** Card "Atalhos rápidos": lista de teclas (Kbd) + descrição. */
export function ShortcutsCard({ atalhos }: ShortcutsCardProps) {
  return (
    <Card className="flex min-h-[111px] flex-col items-start justify-center gap-4 max-tablet:h-auto max-tablet:min-h-[105px]">
      <div className="font-sans text-sm text-muted">Atalhos rápidos</div>
      <div className="flex flex-wrap items-center gap-[30px] font-sans text-xs text-muted max-mobile:gap-3 max-mobile:text-[11px]">
        {atalhos.map((atalho) => (
          <div key={`${atalho.tecla}-${atalho.descricao}`} className="flex items-center gap-[11px] max-mobile:gap-[7px]">
            <Kbd>{atalho.tecla}</Kbd>
            <span>{atalho.descricao}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
