import type { EpochMs, Fase, Preset, Sessao, StatusSessao } from '../dominio'
import { PAUSA_CURTA_MIN, PAUSA_LONGA_MIN, SESSOES_POR_CICLO } from '../presets'

export type StatusTimer = 'ocioso' | 'rodando' | 'pausado'

export interface EstadoTimer {
  preset: Preset
  fase: Fase
  sessaoNoCiclo: 1 | 2 | 3 | 4
  status: StatusTimer
  /** Timestamp do último "iniciar/continuar"; `null` se não está rodando. */
  rodandoDesde: EpochMs | null
  /** Tempo já decorrido na fase atual, acumulado antes do `rodandoDesde` atual. */
  acumuladoMs: number
  /** Timestamp do primeiro "iniciar" desta fase — vira `Sessao.inicio` ao registrar. */
  inicioDaFase: EpochMs | null
}

export type EventoTimer =
  | { tipo: 'alternar' } // iniciar, pausar ou continuar, conforme o status
  | { tipo: 'reiniciar' }
  | { tipo: 'tick' } // não muda o status sozinho; permite detectar fim natural da fase
  | { tipo: 'trocarPreset'; preset: Preset }

export type EfeitoTimer =
  | { tipo: 'registrarSessao'; sessao: Pick<Sessao, 'presetId' | 'inicio' | 'fim' | 'duracaoSeg' | 'status'> }
  | { tipo: 'fimDeFase'; proxima: Fase }

interface Transicao {
  estado: EstadoTimer
  efeitos: EfeitoTimer[]
}

export function estadoInicial(preset: Preset): EstadoTimer {
  return {
    preset,
    fase: 'foco',
    sessaoNoCiclo: 1,
    status: 'ocioso',
    rodandoDesde: null,
    acumuladoMs: 0,
    inicioDaFase: null,
  }
}

export function transicionar(estado: EstadoTimer, evento: EventoTimer, agora: EpochMs): Transicao {
  switch (evento.tipo) {
    case 'alternar':
      return alternar(estado, agora)
    case 'reiniciar':
      return reiniciar(estado, agora)
    case 'tick':
      return tick(estado, agora)
    case 'trocarPreset':
      return trocarPreset(estado, evento.preset)
  }
}

// --- internos ---------------------------------------------------------

function duracaoFaseMsInterno(estado: EstadoTimer): number | null {
  if (estado.fase === 'foco') {
    return estado.preset.minutos === null ? null : estado.preset.minutos * 60_000
  }
  return (estado.fase === 'pausa-curta' ? PAUSA_CURTA_MIN : PAUSA_LONGA_MIN) * 60_000
}

function decorridoMsInterno(estado: EstadoTimer, agora: EpochMs): number {
  if (estado.status === 'rodando' && estado.rodandoDesde !== null) {
    return estado.acumuladoMs + (agora - estado.rodandoDesde)
  }
  return estado.acumuladoMs
}

/** Próxima fase/sessão do ciclo, usada no fim natural da fase. */
function avancarCiclo(estado: EstadoTimer): { fase: Fase; sessaoNoCiclo: 1 | 2 | 3 | 4 } {
  // NOTA: leitura aplicada (não 100% explícita no CLAUDE.md, confirmar com o Igor):
  // só o Pomodoro Clássico entra em fase de pausa. Os demais presets (Livre, Sprint,
  // Estendido, Deep Work) ficam sempre em `fase: 'foco'` — terminar o foco deles
  // não troca de fase, só reinicia um novo foco do zero.
  if (estado.preset.id !== 'pomodoro') {
    return { fase: 'foco', sessaoNoCiclo: 1 }
  }
  if (estado.fase === 'foco') {
    return estado.sessaoNoCiclo < SESSOES_POR_CICLO
      ? { fase: 'pausa-curta', sessaoNoCiclo: estado.sessaoNoCiclo }
      : { fase: 'pausa-longa', sessaoNoCiclo: estado.sessaoNoCiclo }
  }
  if (estado.fase === 'pausa-curta') {
    return { fase: 'foco', sessaoNoCiclo: (estado.sessaoNoCiclo + 1) as 1 | 2 | 3 | 4 }
  }
  // pausa-longa -> volta para o início do ciclo
  return { fase: 'foco', sessaoNoCiclo: 1 }
}

function estadoAposFimDeFase(estado: EstadoTimer, proxima: { fase: Fase; sessaoNoCiclo: 1 | 2 | 3 | 4 }): EstadoTimer {
  return {
    preset: estado.preset,
    fase: proxima.fase,
    sessaoNoCiclo: proxima.sessaoNoCiclo,
    status: 'ocioso',
    rodandoDesde: null,
    acumuladoMs: 0,
    inicioDaFase: null,
  }
}

function efeitoRegistrar(
  estado: EstadoTimer,
  agora: EpochMs,
  duracaoSeg: number,
  status: StatusSessao,
  fim: EpochMs,
): EfeitoTimer {
  return {
    tipo: 'registrarSessao',
    sessao: {
      presetId: estado.preset.id,
      inicio: estado.inicioDaFase ?? agora,
      fim,
      duracaoSeg,
      status,
    },
  }
}

function alternar(estado: EstadoTimer, agora: EpochMs): Transicao {
  if (estado.status === 'ocioso') {
    return {
      estado: {
        ...estado,
        status: 'rodando',
        rodandoDesde: agora,
        inicioDaFase: estado.inicioDaFase ?? agora,
      },
      efeitos: [],
    }
  }
  if (estado.status === 'rodando') {
    const rodandoDesde = estado.rodandoDesde ?? agora // invariante: sempre setado quando rodando
    return {
      estado: {
        ...estado,
        status: 'pausado',
        acumuladoMs: estado.acumuladoMs + (agora - rodandoDesde),
        rodandoDesde: null,
      },
      efeitos: [],
    }
  }
  // pausado -> rodando
  return {
    estado: { ...estado, status: 'rodando', rodandoDesde: agora },
    efeitos: [],
  }
}

function reiniciarFaseAtual(estado: EstadoTimer): EstadoTimer {
  return {
    ...estado,
    status: 'ocioso',
    rodandoDesde: null,
    acumuladoMs: 0,
    inicioDaFase: null,
  }
}

/**
 * Regra do CLAUDE.md ("Status da sessão"): reiniciar durante o foco com ≥ 1 min
 * decorrido registra CANCELADO, sem avançar o ciclo (a fase/sessão do ciclo
 * permanecem as mesmas, só o progresso zera).
 */
function reiniciar(estado: EstadoTimer, agora: EpochMs): Transicao {
  const efeitos: EfeitoTimer[] = []
  if (estado.fase === 'foco') {
    const decorrido = decorridoMsInterno(estado, agora)
    const duracaoSeg = Math.floor(decorrido / 1000)
    if (duracaoSeg >= 60) {
      efeitos.push(efeitoRegistrar(estado, agora, duracaoSeg, 'cancelada', agora))
    }
  }
  return { estado: reiniciarFaseAtual(estado), efeitos }
}

function tick(estado: EstadoTimer, agora: EpochMs): Transicao {
  if (estado.status !== 'rodando') return { estado, efeitos: [] }

  const duracao = duracaoFaseMsInterno(estado)
  if (duracao === null) return { estado, efeitos: [] } // Livre: sem fim natural

  const decorrido = decorridoMsInterno(estado, agora)
  if (decorrido < duracao) return { estado, efeitos: [] }

  const duracaoSeg = Math.floor(duracao / 1000)
  const fim = (estado.inicioDaFase ?? agora) + duracao
  const efeitos: EfeitoTimer[] = []

  // pausa não é sessão — só foco gera registro.
  if (estado.fase === 'foco' && duracaoSeg >= 60) {
    efeitos.push(efeitoRegistrar(estado, agora, duracaoSeg, 'concluida', fim))
  }

  const proxima = avancarCiclo(estado)
  efeitos.push({ tipo: 'fimDeFase', proxima: proxima.fase })

  return { estado: estadoAposFimDeFase(estado, proxima), efeitos }
}

function trocarPreset(estado: EstadoTimer, preset: Preset): Transicao {
  if (estado.status !== 'ocioso') return { estado, efeitos: [] } // ignora troca durante execução
  return { estado: estadoInicial(preset), efeitos: [] }
}
