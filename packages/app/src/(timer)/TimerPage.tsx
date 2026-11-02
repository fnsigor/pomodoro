import { atividadeRepo, presetRepo, sessaoRepo } from '@app/adapters'
import { relogioDoSistema } from '../infra/relogioDoSistema'
import { useAtalhosTeclado } from '../infra/useAtalhosTeclado'
import { useTituloDocumento } from '../infra/useTituloDocumento'
import { useTimerModel } from './timer.model'
import { TimerView } from './timer.view'

export interface TimerPageProps {
  notificar: (mensagem: string) => void
}

export default function TimerPage({ notificar }: TimerPageProps) {
  const methods = useTimerModel({
    sessaoRepo,
    atividadeRepo,
    presetRepo,
    relogio: relogioDoSistema,
    notificar,
  })

  useAtalhosTeclado(methods.atalhos)
  useTituloDocumento(methods.titulo)

  return <TimerView {...methods} />
}
