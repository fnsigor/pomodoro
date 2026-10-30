import { atualizador, sessaoRepo } from '@app/adapters'
import { relogioDoSistema } from '../infra/relogioDoSistema'
import { useShellModel } from './shell.model'
import { ShellView } from './shell.view'

export default function ShellPage() {
  const methods = useShellModel({ sessaoRepo, relogio: relogioDoSistema, atualizador })

  return <ShellView {...methods} />
}
