import { dayjs } from './data'
import type { EpochMs } from './dominio'
import { chaveDoDia } from './tempo'

/**
 * Conta quantos dias consecutivos de foco terminam em "hoje". Se hoje ainda não
 * tem foco registrado, a contagem começa em ontem (o streak não zera só porque
 * o dia de hoje ainda não terminou).
 */
export function calcularStreak(diasComFoco: readonly string[], hoje: EpochMs): number {
  const dias = new Set(diasComFoco)

  let cursor = dayjs(hoje)
  if (!dias.has(chaveDoDia(cursor.valueOf()))) {
    cursor = cursor.subtract(1, 'day')
  }

  let streak = 0
  while (dias.has(chaveDoDia(cursor.valueOf()))) {
    streak += 1
    cursor = cursor.subtract(1, 'day')
  }

  return streak
}
