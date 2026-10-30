import { Avatar, Brand, IconButton, IconeSino, NavTabs, StreakPill, Toast, Topbar } from '@focusflow/ui'
import AtividadesPage from '../(atividades)/AtividadesPage'
import HistoricoPage from '../(historico)/HistoricoPage'
import TimerPage from '../(timer)/TimerPage'
import type { useShellModel } from './shell.model'
import type { AbaId } from './shell.types'

type ShellViewProps = ReturnType<typeof useShellModel>

const ABAS: Array<{ id: AbaId; rotulo: string }> = [
  { id: 'timer', rotulo: 'Temporizador' },
  { id: 'historico', rotulo: 'Histórico' },
  { id: 'atividades', rotulo: 'Atividades' },
]

export function ShellView({ abaAtiva, selecionarAba, streak, toast, notificar, recarregarStreak }: ShellViewProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-10 py-7 max-tablet:px-6 max-mobile:px-4">
      <Topbar
        marca={<Brand />}
        navegacao={<NavTabs abas={ABAS} ativa={abaAtiva} onSelecionar={(id) => selecionarAba(id as AbaId)} />}
        ferramentas={
          <>
            <StreakPill dias={streak} />
            <IconButton icone={<IconeSino />} ariaLabel="Notificações" />
            <Avatar iniciais="FF" />
          </>
        }
      />

      {abaAtiva === 'timer' && <TimerPage notificar={notificar} aoRegistrarSessao={recarregarStreak} />}
      {abaAtiva === 'historico' && <HistoricoPage />}
      {abaAtiva === 'atividades' && <AtividadesPage />}

      <Toast mensagem={toast} />
    </div>
  )
}
