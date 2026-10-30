import { Avatar, Brand, IconButton, IconeSino, Modal, NavTabs, StreakPill, Toast, Topbar } from '@focusflow/ui'
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

export function ShellView({
  abaAtiva,
  selecionarAba,
  streak,
  toast,
  notificar,
  recarregarStreak,
  atualizacaoDisponivel,
  instalandoAtualizacao,
  instalarAtualizacao,
  dispensarAtualizacao,
}: ShellViewProps) {
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

      <Modal
        aberto={atualizacaoDisponivel !== null}
        titulo="Atualização disponível"
        onFechar={dispensarAtualizacao}
      >
        {atualizacaoDisponivel && (
          <div className="flex flex-col gap-4">
            <p className="font-sans text-sm text-muted">
              Uma nova versão do FocusFlow está disponível: <strong className="text-ink">{atualizacaoDisponivel.versao}</strong>
            </p>
            {atualizacaoDisponivel.notas && (
              <p className="whitespace-pre-line font-sans text-sm text-muted">{atualizacaoDisponivel.notas}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={dispensarAtualizacao}
                disabled={instalandoAtualizacao}
                className="rounded-[15px] border border-border px-4 py-2 font-sans text-sm font-medium text-ink transition-colors hover:bg-panel-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Depois
              </button>
              <button
                type="button"
                onClick={instalarAtualizacao}
                disabled={instalandoAtualizacao}
                className="rounded-[15px] bg-primary px-4 py-2 font-sans text-sm font-semibold text-ink transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {instalandoAtualizacao ? 'Atualizando…' : 'Atualizar agora'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
