import { dayjs } from './data'
import type { EpochMs } from './dominio'

export function intervaloDoDia(agora: EpochMs): { inicio: EpochMs; fim: EpochMs } {
  const d = dayjs(agora)
  return {
    inicio: d.startOf('day').valueOf(),
    fim: d.endOf('day').valueOf(),
  }
}

export function chaveDoDia(t: EpochMs): string {
  return dayjs(t).format('YYYY-MM-DD')
}

/** Formata milissegundos como `MM:SS`. Não trava em 59 min — no modo Livre pode passar de 1h (ex. `75:00`). */
export function formatarMMSS(ms: number): string {
  const totalSeg = Math.max(0, Math.floor(ms / 1000))
  const min = Math.floor(totalSeg / 60)
  const seg = totalSeg % 60
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
}

/** Formata segundos como `2h 15m`, ou só `45m` se durar menos de 1h. */
export function formatarHorasMin(seg: number): string {
  const totalMin = Math.floor(seg / 60)
  const horas = Math.floor(totalMin / 60)
  const min = totalMin % 60
  if (horas === 0) return `${min}m`
  return `${horas}h ${min}m`
}

/** Formata segundos como `50 min` se < 60min, ou `1h 12m` se >= 1h. Usado na tabela do Histórico. */
export function formatarDuracaoCurta(seg: number): string {
  const totalMin = Math.floor(seg / 60)
  if (totalMin < 60) return `${totalMin} min`
  const horas = Math.floor(totalMin / 60)
  const min = totalMin % 60
  return `${horas}h ${min}m`
}
