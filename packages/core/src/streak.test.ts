import { describe, expect, it } from 'vitest'
import { dayjs } from './data'
import { calcularStreak } from './streak'
import { chaveDoDia } from './tempo'

const hoje = dayjs('2026-10-29T20:00:00').valueOf()
const chaveHoje = chaveDoDia(hoje)
const chaveOntem = chaveDoDia(dayjs(hoje).subtract(1, 'day').valueOf())
const chaveAnteontem = chaveDoDia(dayjs(hoje).subtract(2, 'day').valueOf())

describe('calcularStreak', () => {
  it('hoje sem foco, ontem e anteontem com foco -> streak 2 (não zera só por o dia não ter terminado)', () => {
    expect(calcularStreak([chaveOntem, chaveAnteontem], hoje)).toBe(2)
  })

  it('hoje com foco, ontem sem -> streak 1', () => {
    expect(calcularStreak([chaveHoje], hoje)).toBe(1)
  })

  it('sem nenhum dia registrado -> streak 0', () => {
    expect(calcularStreak([], hoje)).toBe(0)
  })

  it('ignora duplicatas e ordem', () => {
    expect(calcularStreak([chaveOntem, chaveOntem, chaveAnteontem, chaveHoje], hoje)).toBe(3)
  })

  it('quebra a contagem em um buraco', () => {
    const chave3diasAtras = chaveDoDia(dayjs(hoje).subtract(3, 'day').valueOf())
    // ontem falta -> streak conta só a partir de hoje
    expect(calcularStreak([chaveHoje, chave3diasAtras], hoje)).toBe(1)
  })
})
