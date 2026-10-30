import { useHistoricoModel } from './historico.model'
import { HistoricoView } from './historico.view'

export default function HistoricoPage() {
  const methods = useHistoricoModel()

  return <HistoricoView {...methods} />
}
