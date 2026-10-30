import type { useHistoricoModel } from './historico.model'

type HistoricoViewProps = ReturnType<typeof useHistoricoModel>

export function HistoricoView({ titulo, mensagem }: HistoricoViewProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">{titulo}</h1>
      <p className="text-sm text-muted">{mensagem}</p>
    </div>
  )
}
