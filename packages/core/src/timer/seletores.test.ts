import { describe, expect, it } from 'vitest'
import type { Preset } from '../dominio'
import { PRESETS_FIXOS } from '../presets'
import { estadoInicial, transicionar } from './maquina'
import { progresso, rotuloFase } from './seletores'

const presetPorId = (id: string): Preset => {
  const p = PRESETS_FIXOS.find((p) => p.id === id)
  if (!p) throw new Error(`preset não encontrado: ${id}`)
  return p
}

const LIVRE = presetPorId('livre')
const POMODORO = presetPorId('pomodoro')
const MIN = 60_000
const T0 = Date.UTC(2026, 9, 29, 10, 0, 0)

describe('progresso', () => {
  it('no Livre, o dial dá a volta a cada 60 min', () => {
    let estado = estadoInicial(LIVRE)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    expect(progresso(estado, T0 + 30 * MIN)).toBeCloseTo(0.5)
    expect(progresso(estado, T0 + 60 * MIN)).toBeCloseTo(0) // completou a volta, recomeça
    expect(progresso(estado, T0 + 90 * MIN)).toBeCloseTo(0.5) // segunda volta
  })

  it('em presets com duração, vai de 0 a 1 e não ultrapassa', () => {
    let estado = estadoInicial(POMODORO)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    expect(progresso(estado, T0)).toBeCloseTo(0)
    expect(progresso(estado, T0 + 12.5 * MIN)).toBeCloseTo(0.5)
    expect(progresso(estado, T0 + 999 * MIN)).toBeCloseTo(1) // nunca passa de 1
  })
})

describe('rotuloFase', () => {
  it('mapeia cada fase para o rótulo exibido na UI', () => {
    expect(rotuloFase('foco')).toBe('FASE DE FOCO')
    expect(rotuloFase('pausa-curta')).toBe('PAUSA CURTA')
    expect(rotuloFase('pausa-longa')).toBe('PAUSA LONGA')
  })
})
