import { atualizador } from '@app/adapters'
import { useShellModel } from './shell.model'
import { ShellView } from './shell.view'

export default function ShellPage() {
  const methods = useShellModel({ atualizador })

  return <ShellView {...methods} />
}
