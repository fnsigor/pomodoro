import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PRESETS_FIXOS,
  PRESET_PADRAO_ID,
  estadoInicial,
  formatarMMSS,
  formatarHorasMin,
  intervaloDoDia,
  novoId,
  progresso,
  progressoDaMeta,
  restanteMs,
  rotuloFase,
  transicionar,
  META_DIARIA_MIN,
  type Atividade,
  type AtividadeRepository,
  type EfeitoTimer,
  type EstadoTimer,
  type EventoTimer,
  type Preset,
  type PresetRepository,
  type Relogio,
  type ResumoDoDia,
  type Sessao,
  type SessaoRepository,
} from '@focusflow/core'
import type { Notificar } from '@focusflow/ui'
import type { AtalhosTimer } from '../infra/useAtalhosTeclado'
import { SchemaPresetPersonalizado } from './timer.schema'
import { TIMER_ATALHOS, TIMER_MENSAGENS, TIMER_ROTULO_BOTAO } from './timer.messages'
import type { PresetDaTela } from './timer.types'

export interface TimerModelProps {
  sessaoRepo: SessaoRepository
  atividadeRepo: AtividadeRepository
  presetRepo: PresetRepository
  relogio: Relogio
  notificar: Notificar
}

// PRESETS_FIXOS sempre tem ao menos o Pomodoro Clássico (constante do core) — invariante garantida.
const PRESET_PADRAO = PRESETS_FIXOS.find((p) => p.id === PRESET_PADRAO_ID) ?? PRESETS_FIXOS[0]!

function formatarPresetParaTela(preset: Preset): PresetDaTela {
  const valorCurto = preset.minutos === null ? '∞' : preset.minutos === 60 ? '1h' : String(preset.minutos)
  const unidade = preset.minutos === null ? 'LIVRE' : 'MINUTOS'
  return { id: preset.id, rotulo: preset.nome, valorCurto, unidade }
}

/** `formatarHorasMin` do core sempre mostra os minutos (ex. "4h 0m"); a meta precisa de "4h". */
function formatarMetaCurta(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}m`
}

export function useTimerModel({
  sessaoRepo,
  atividadeRepo,
  presetRepo,
  relogio,
  notificar,
}: TimerModelProps) {
  const [estado, setEstado] = useState<EstadoTimer>(() => estadoInicial(PRESET_PADRAO))
  // Mantido em dia só por `despachar` (nunca no corpo do render) — único
  // ponto que muda `estado`, então a ref nunca fica desatualizada.
  const estadoRef = useRef(estado)

  // Força recomputar tempo/progresso por timestamp a cada tick, independente
  // de `estado` ter mudado (ver seletores do core — o restante nunca é contado).
  const [agora, setAgora] = useState(() => relogio.agora())

  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [atividadeAtual, setAtividadeAtual] = useState<Atividade | null>(null)
  // Mesma lógica: atualizada nos dois pontos que chamam `setAtividadeAtual`, nunca no render.
  const atividadeAtualRef = useRef(atividadeAtual)

  const [presetsPersonalizados, setPresetsPersonalizados] = useState<Preset[]>([])
  const [resumoDoDia, setResumoDoDia] = useState<ResumoDoDia>({ totalSeg: 0, ciclos: 0 })

  const [modalAtividadeAberta, setModalAtividadeAberta] = useState(false)
  const [modalPresetAberta, setModalPresetAberta] = useState(false)
  const [novoPresetValor, setNovoPresetValor] = useState('35')
  const [novoPresetErro, setNovoPresetErro] = useState<string | null>(null)

  const carregarResumoDoDia = useCallback(async () => {
    const resumo = await sessaoRepo.resumoDoDia(intervaloDoDia(relogio.agora()))
    setResumoDoDia(resumo)
  }, [sessaoRepo, relogio])

  useEffect(() => {
    let cancelado = false

    async function carregarDadosIniciais() {
      const [listaAtividades, atividadeAtiva, listaPresets, resumo] = await Promise.all([
        atividadeRepo.listar(),
        atividadeRepo.obterAtiva(),
        presetRepo.listar(),
        sessaoRepo.resumoDoDia(intervaloDoDia(relogio.agora())),
      ])
      if (cancelado) return
      setAtividades(listaAtividades)
      setAtividadeAtual(atividadeAtiva)
      atividadeAtualRef.current = atividadeAtiva
      setPresetsPersonalizados(listaPresets)
      setResumoDoDia(resumo)
    }

    carregarDadosIniciais()

    return () => {
      cancelado = true
    }
  }, [atividadeRepo, presetRepo, sessaoRepo, relogio])

  const salvarSessao = useCallback(
    async (dados: Pick<Sessao, 'presetId' | 'inicio' | 'fim' | 'duracaoSeg' | 'status'>) => {
      const atividade = atividadeAtualRef.current
      if (!atividade) return
      const sessao: Sessao = { id: novoId(), atividadeId: atividade.id, ...dados }
      await sessaoRepo.salvar(sessao)
      await carregarResumoDoDia()
    },
    [sessaoRepo, carregarResumoDoDia],
  )

  const processarEfeitos = useCallback(
    (efeitos: EfeitoTimer[]) => {
      const registro = efeitos.find(
        (e): e is Extract<EfeitoTimer, { tipo: 'registrarSessao' }> => e.tipo === 'registrarSessao',
      )
      const fimDeFase = efeitos.find(
        (e): e is Extract<EfeitoTimer, { tipo: 'fimDeFase' }> => e.tipo === 'fimDeFase',
      )

      if (registro) void salvarSessao(registro.sessao)

      // Som de fim de fase: decisão de produto em aberto no CLAUDE.md (liga/
      // desliga ainda não existe na tela) — por enquanto só o toast abaixo.
      if (registro?.sessao.status === 'concluida') {
        notificar(TIMER_MENSAGENS.sessaoConcluida, 'success')
      } else if (fimDeFase) {
        notificar(TIMER_MENSAGENS.pausaEncerrada)
      }
    },
    [salvarSessao, notificar],
  )

  const despachar = useCallback(
    (evento: EventoTimer) => {
      const t = relogio.agora()
      const { estado: novoEstado, efeitos } = transicionar(estadoRef.current, evento, t)
      estadoRef.current = novoEstado
      setEstado(novoEstado)
      if (efeitos.length > 0) processarEfeitos(efeitos)
    },
    [relogio, processarEfeitos],
  )

  useEffect(() => {
    const id = setInterval(() => {
      setAgora(relogio.agora())
      despachar({ tipo: 'tick' })
    }, 250)
    return () => clearInterval(id)
  }, [relogio, despachar])

  const alternar = useCallback(() => despachar({ tipo: 'alternar' }), [despachar])

  const reiniciar = useCallback(() => {
    despachar({ tipo: 'reiniciar' })
    notificar(TIMER_MENSAGENS.reiniciado)
  }, [despachar, notificar])

  const presetsCombinados = useMemo<Preset[]>(
    () => [...PRESETS_FIXOS, ...presetsPersonalizados],
    [presetsPersonalizados],
  )

  const presetsParaTela = useMemo<PresetDaTela[]>(
    () => presetsCombinados.map(formatarPresetParaTela),
    [presetsCombinados],
  )

  const selecionarPreset = useCallback(
    (id: string) => {
      const preset = presetsCombinados.find((p) => p.id === id)
      if (preset) despachar({ tipo: 'trocarPreset', preset })
    },
    [presetsCombinados, despachar],
  )

  const navegarPreset = useCallback(
    (direcao: 1 | -1) => {
      const indiceAtual = presetsCombinados.findIndex((p) => p.id === estadoRef.current.preset.id)
      const total = presetsCombinados.length
      const proximoIndice = (indiceAtual + direcao + total) % total
      // `proximoIndice` é sempre o resultado de um módulo por `total` — nunca fora dos limites.
      despachar({ tipo: 'trocarPreset', preset: presetsCombinados[proximoIndice]! })
    },
    [presetsCombinados, despachar],
  )

  const modoAnterior = useCallback(() => navegarPreset(-1), [navegarPreset])
  const modoProximo = useCallback(() => navegarPreset(1), [navegarPreset])

  const abrirModalAtividade = useCallback(() => setModalAtividadeAberta(true), [])
  const fecharModalAtividade = useCallback(() => setModalAtividadeAberta(false), [])

  const trocarAtividade = useCallback(
    async (id: string) => {
      await atividadeRepo.definirAtiva(id)
      const atividade = atividades.find((a) => a.id === id) ?? (await atividadeRepo.obterAtiva())
      setAtividadeAtual(atividade)
      atividadeAtualRef.current = atividade
      setModalAtividadeAberta(false)
      if (atividade) notificar(TIMER_MENSAGENS.atividadeTrocada(atividade.nome), 'success')
    },
    [atividadeRepo, atividades, notificar],
  )

  const abrirModalPreset = useCallback(() => {
    setNovoPresetValor('35')
    setNovoPresetErro(null)
    setModalPresetAberta(true)
  }, [])
  const fecharModalPreset = useCallback(() => setModalPresetAberta(false), [])

  const aoMudarNovoPresetValor = useCallback((valor: string) => {
    setNovoPresetValor(valor)
    setNovoPresetErro(null)
  }, [])

  const confirmarNovoPreset = useCallback(async () => {
    const resultado = SchemaPresetPersonalizado.safeParse({ minutos: novoPresetValor })
    if (!resultado.success) {
      setNovoPresetErro(TIMER_MENSAGENS.presetPersonalizadoInvalido)
      return
    }
    const preset: Preset = {
      id: novoId(),
      nome: 'Personalizado',
      minutos: resultado.data.minutos,
      personalizado: true,
    }
    await presetRepo.salvar(preset)
    setPresetsPersonalizados((atual) => [...atual, preset])
    despachar({ tipo: 'trocarPreset', preset })
    setModalPresetAberta(false)
    notificar(TIMER_MENSAGENS.presetPersonalizadoCriado, 'success')
  }, [novoPresetValor, presetRepo, despachar, notificar])

  const restante = restanteMs(estado, agora)
  const tempo = formatarMMSS(restante)
  const progressoAtual = progresso(estado, agora)
  const fase = rotuloFase(estado.fase)

  const rotuloBotao =
    estado.status === 'pausado'
      ? TIMER_ROTULO_BOTAO.continuar
      : estado.status === 'rodando'
        ? TIMER_ROTULO_BOTAO.pausarFoco
        : estado.fase === 'foco'
          ? TIMER_ROTULO_BOTAO.iniciarFoco
          : TIMER_ROTULO_BOTAO.iniciarPausa

  const metaProgresso = progressoDaMeta(resumoDoDia.totalSeg)
  const meta = {
    valorPrincipal: formatarHorasMin(resumoDoDia.totalSeg),
    valorMeta: `de ${formatarMetaCurta(META_DIARIA_MIN)}`,
    legenda: `${metaProgresso.percentual}% concluído hoje • ${resumoDoDia.ciclos} ciclos`,
    percentual: metaProgresso.percentual,
  }

  const titulo = estado.status === 'rodando' ? `${tempo} — FocusFlow` : null

  const atalhos: AtalhosTimer = { alternar, reiniciar, modoAnterior, modoProximo }

  return {
    tempo,
    progresso: progressoAtual,
    fase,
    rotuloBotao,
    legendaAtalhos: TIMER_ATALHOS,
    presets: presetsParaTela,
    presetSelecionadoId: estado.preset.id,
    selecionarPreset,
    modoAnterior,
    modoProximo,
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
    meta,
    atalhos,
    titulo,
    alternar,
    reiniciar,
  }
}
