import { Card } from './Card';
import { ProgressBar } from './ProgressBar';

export interface DailyGoalCardProps {
  valorPrincipal: string;
  valorMeta: string;
  legenda: string;
  percentual: number;
}

/** Card "Meta Diária": valor + barra de progresso com legenda. */
export function DailyGoalCard({ valorPrincipal, valorMeta, legenda, percentual }: DailyGoalCardProps) {
  return (
    <Card className="flex min-h-[111px] items-center justify-between gap-4 max-tablet:h-auto max-tablet:min-h-[105px]">
      <div>
        <div className="mb-2 font-sans text-sm text-muted">Meta Diária</div>
        <div className="font-display text-[22px] font-bold tracking-[-0.5px] max-mobile:text-[19px]">
          {valorPrincipal}{' '}
          <small className="font-sans text-xs font-normal tracking-normal text-muted">{valorMeta}</small>
        </div>
      </div>
      <div className="w-[200px] text-right max-mobile:w-[120px]">
        <div className="mb-[9px]">
          <ProgressBar percentual={percentual} />
        </div>
        <div className="font-sans text-[10px] text-muted">{legenda}</div>
      </div>
    </Card>
  );
}
