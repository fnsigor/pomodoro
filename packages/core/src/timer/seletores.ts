import type { EpochMs, Fase } from '../dominio'
import { PAUSA_CURTA_MIN, PAUSA_LONGA_MIN } from '../presets'
import type { EstadoTimer } from './maquina'

/** Duração nominal da fase atual, em ms. `null` só no modo Livre (sem fim). */
export function duracaoDaFaseMs(estado: EstadoTimer): number | null {
  if (estado.fase === 'foco') {
    return estado.preset.minutos === null ? null : estado.preset.minutos * 60_000
  }
  return (estado.fase === 'pausa-curta' ? PAUSA_CURTA_MIN : PAUSA_LONGA_MIN) * 60_000
}

/** Tempo decorrido na fase atual, calculado por timestamp (não por contagem de ticks). */
export function decorridoMs(estado: EstadoTimer, agora: EpochMs): number {
  if (estado.status === 'rodando' && estado.rodandoDesde !== null) {
    return estado.acumuladoMs + (agora - estado.rodandoDesde)
  }
  return estado.acumuladoMs
}

/** No Livre, devolve o próprio decorrido — é um cronômetro crescente, não regressivo. */
export function restanteMs(estado: EstadoTimer, agora: EpochMs): number {
  const decorrido = decorridoMs(estado, agora)
  const duracao = duracaoDaFaseMs(estado)
  if (duracao === null) return decorrido
  return Math.max(0, duracao - decorrido)
}

const UMA_HORA_MS = 60 * 60_000

/** 0..1. No Livre, o dial dá a volta a cada 60 min: `(decorrido % 1h) / 1h`. */
export function progresso(estado: EstadoTimer, agora: EpochMs): number {
  const duracao = duracaoDaFaseMs(estado)
  const decorrido = decorridoMs(estado, agora)
  if (duracao === null) {
    return (decorrido % UMA_HORA_MS) / UMA_HORA_MS
  }
  if (duracao === 0) return 0
  return Math.min(1, decorrido / duracao)
}

export function rotuloFase(fase: Fase): 'FASE DE FOCO' | 'PAUSA CURTA' | 'PAUSA LONGA' {
  if (fase === 'foco') return 'FASE DE FOCO'
  if (fase === 'pausa-curta') return 'PAUSA CURTA'
  return 'PAUSA LONGA'
}
