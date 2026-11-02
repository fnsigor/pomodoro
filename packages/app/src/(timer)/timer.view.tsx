import {
  ActivitySelect,
  ControlButton,
 // DailyGoalCard,
  IconeReiniciar,
  IconePause,
  IconePlay,
  Modal,
  PhaseLabel,
  PresetSelector,
  PrimaryButton,
 // ShortcutsCard,
  TimeDisplay,
  TimerRing,
} from '@focusflow/ui'
import { TIMER_ROTULO_BOTAO } from './timer.messages'
import type { useTimerModel } from './timer.model'

type TimerViewProps = ReturnType<typeof useTimerModel>

export function TimerView(props: TimerViewProps) {
  const {
    tempo,
    progresso,
    fase,
    rotuloBotao,
   // legendaAtalhos,
    presets,
    presetSelecionadoId,
    selecionarPreset,
    atividades,
    atividadeAtual,
    modalAtividadeAberta,
    abrirModalAtividade,
    fecharModalAtividade,
    trocarAtividade,
    modalPresetAberta,
    novoPresetValor,
    novoPresetErro,
    abrirModalPreset,
    fecharModalPreset,
    aoMudarNovoPresetValor,
    confirmarNovoPreset,
  //  meta,
    alternar,
    reiniciar,
  } = props

  const presetAtual = presets.find((p) => p.id === presetSelecionadoId)
  const iconeBotao = rotuloBotao === TIMER_ROTULO_BOTAO.pausarFoco ? <IconePause /> : <IconePlay />

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-6 max-tablet:grid-cols-1 max-tablet:justify-items-center max-tablet:gap-[26px]">
        {/* Espaçador: mantém o seletor de presets na coluna central do grid. */}
        <div aria-hidden="true" className="max-tablet:hidden" />
        <PresetSelector
          presets={presets}
          selecionadoId={presetSelecionadoId}
          onSelecionar={selecionarPreset}
          onNovoPreset={abrirModalPreset}
        />
        <ActivitySelect
          rotulo="Atividade atual"
          nome={atividadeAtual?.nome ?? 'Carregando…'}
          corDot={atividadeAtual?.cor ?? 'var(--color-disabled-ink)'}
          onClick={abrirModalAtividade}
        />
      </div>

      <div className="mt-[10px] flex min-h-0 flex-1 flex-col items-center justify-center">
        <TimerRing progresso={progresso} ariaLabel={`${fase}, ${tempo} restante`}>
          <PhaseLabel texto={fase} />
          <TimeDisplay texto={tempo} />
          <div className="mt-[15px] font-sans text-lg text-muted max-mobile:mt-[15px] max-mobile:text-[15px]">
            {presetAtual?.rotulo ?? ''}
          </div>
        </TimerRing>

        <div className="mt-7 flex items-center gap-6 max-mobile:gap-4">
          <ControlButton icone={<IconeReiniciar />} ariaLabel="Reiniciar" title="Reiniciar (R)" onClick={reiniciar} />
          <PrimaryButton icone={iconeBotao} rotulo={rotuloBotao} onClick={alternar} />
          {/* Mantém o botão principal centralizado sob o anel agora que não há "pular fase". */}
          <div aria-hidden="true" className="h-14 w-14 max-mobile:h-12 max-mobile:w-12" />
        </div>
      </div>

      {/* <div className="mt-[10px] grid grid-cols-2 gap-6 max-tablet:grid-cols-1">
        <DailyGoalCard
          valorPrincipal={meta.valorPrincipal}
          valorMeta={meta.valorMeta}
          legenda={meta.legenda}
          percentual={meta.percentual}
        />
        <ShortcutsCard atalhos={[...legendaAtalhos]} />
      </div> */}

      <Modal aberto={modalAtividadeAberta} titulo="Selecionar atividade" onFechar={fecharModalAtividade}>
        <ul role="listbox" aria-label="Atividades" className="flex flex-col gap-2">
          {atividades.map((atividade) => (
            <li key={atividade.id}>
              <button
                type="button"
                role="option"
                aria-selected={atividade.id === atividadeAtual?.id}
                onClick={() => trocarAtividade(atividade.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-panel-2 px-4 py-3 text-left text-ink"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: atividade.cor }}
                />
                {atividade.nome}
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal aberto={modalPresetAberta} titulo="Novo preset personalizado" onFechar={fecharModalPreset}>
        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            void confirmarNovoPreset()
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-2 text-sm text-muted" htmlFor="novo-preset-minutos">
            Duração do foco em minutos
            <input
              id="novo-preset-minutos"
              type="number"
              min={1}
              max={240}
              value={novoPresetValor}
              onChange={(evento) => aoMudarNovoPresetValor(evento.target.value)}
              className="rounded-xl border border-border bg-panel-sunken px-4 py-3 text-ink"
            />
          </label>
          {novoPresetErro ? <p className="text-sm text-fire">{novoPresetErro}</p> : null}
          <PrimaryButton icone={<IconePlay />} rotulo="Criar preset" onClick={() => void confirmarNovoPreset()} />
        </form>
      </Modal>
    </div>
  )
}
