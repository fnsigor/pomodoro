import { Brand, Modal, type Notificar, Topbar } from '@focusflow/ui'
import TimerPage from '../(timer)/TimerPage'
import type { useShellModel } from './shell.model'

type ShellViewProps = ReturnType<typeof useShellModel> & { notificar: Notificar }

export function ShellView({
  notificar,
  atualizacaoDisponivel,
  instalandoAtualizacao,
  instalarAtualizacao,
  dispensarAtualizacao,
}: ShellViewProps) {
  return (
    <div className="mx-auto flex h-screen max-w-400 flex-col overflow-x-hidden px-10 py-7 max-tablet:px-6 max-mobile:px-4">
      <Topbar marca={<Brand />} />

      <TimerPage notificar={notificar} />

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
