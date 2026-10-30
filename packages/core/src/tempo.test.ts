import { describe, expect, it } from 'vitest'
import { dayjs } from './data'
import { chaveDoDia, formatarDuracaoCurta, formatarHorasMin, formatarMMSS, intervaloDoDia } from './tempo'

describe('formatarMMSS', () => {
  it('formata minutos e segundos com dois dígitos', () => {
    expect(formatarMMSS(25 * 60 * 1000)).toBe('25:00')
    expect(formatarMMSS(5 * 1000)).toBe('00:05')
  })

  it('não trava em 59 min — no modo Livre pode passar de 1h', () => {
    expect(formatarMMSS(75 * 60 * 1000)).toBe('75:00')
  })

  it('nunca fica negativo', () => {
    expect(formatarMMSS(-5000)).toBe('00:00')
  })
})

describe('intervaloDoDia', () => {
  it('cobre o dia certo perto da virada (23:59 vs 00:01)', () => {
    const antesDaMeiaNoite = dayjs('2026-10-29T23:59:00').valueOf()
    const depoisDaMeiaNoite = dayjs('2026-10-30T00:01:00').valueOf()

    const diaA = intervaloDoDia(antesDaMeiaNoite)
    const diaB = intervaloDoDia(depoisDaMeiaNoite)

    expect(dayjs(diaA.inicio).format('YYYY-MM-DD')).toBe('2026-10-29')
    expect(dayjs(diaA.fim).format('YYYY-MM-DD')).toBe('2026-10-29')
    expect(dayjs(diaB.inicio).format('YYYY-MM-DD')).toBe('2026-10-30')

    expect(antesDaMeiaNoite).toBeLessThanOrEqual(diaA.fim)
    expect(antesDaMeiaNoite).toBeGreaterThanOrEqual(diaA.inicio)
    expect(depoisDaMeiaNoite).toBeGreaterThanOrEqual(diaB.inicio)
  })
})

describe('chaveDoDia', () => {
  it('formata como YYYY-MM-DD', () => {
    expect(chaveDoDia(dayjs('2026-01-05T10:00:00').valueOf())).toBe('2026-01-05')
  })
})

describe('formatarHorasMin', () => {
  it('mostra só minutos quando < 1h', () => {
    expect(formatarHorasMin(45 * 60)).toBe('45m')
  })

  it('mostra horas e minutos quando >= 1h', () => {
    expect(formatarHorasMin(2 * 3600 + 15 * 60)).toBe('2h 15m')
  })
})

describe('formatarDuracaoCurta', () => {
  it('mostra "N min" quando < 60min', () => {
    expect(formatarDuracaoCurta(50 * 60)).toBe('50 min')
  })

  it('mostra "NhMm" quando >= 1h', () => {
    expect(formatarDuracaoCurta(72 * 60)).toBe('1h 12m')
  })
})
