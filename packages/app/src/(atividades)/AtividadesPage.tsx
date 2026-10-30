import { useAtividadesModel } from './atividades.model'
import { AtividadesView } from './atividades.view'

export default function AtividadesPage() {
  const methods = useAtividadesModel()

  return <AtividadesView {...methods} />
}
