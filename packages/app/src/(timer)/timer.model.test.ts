import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { criarRepositoriosEmMemoria } from '@focusflow/core/testing'
import { useTimerModel } from './timer.model'

async function flush() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('useTimerModel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completa 25 min de Pomodoro Clássico: registra sessão concluída e entra em pausa curta', async () => {
    const t0 = 1_700_000_000_000
    let agora = t0
    const relogio = { agora: () => agora }

    const { sessaoRepo, atividadeRepo, presetRepo, sessoes } = criarRepositoriosEmMemoria({
      atividades: [{ id: 'estudo', nome: 'Estudo', cor: '#8B5CF6' }],
    })

    const notificar = vi.fn()

    const { result } = renderHook(() =>
      useTimerModel({ sessaoRepo, atividadeRepo, presetRepo, relogio, notificar }),
    )

    await flush()

    expect(result.current.atividadeAtual?.id).toBe('estudo')
    expect(result.current.rotuloBotao).toBe('Iniciar Foco')

    act(() => {
      result.current.alternar()
    })

    expect(result.current.rotuloBotao).toBe('Pausar Foco')

    agora = t0 + 25 * 60_000

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })
    await flush()

    expect(sessoes).toHaveLength(1)
    expect(sessoes[0]).toMatchObject({
      atividadeId: 'estudo',
      presetId: 'pomodoro',
      status: 'concluida',
      duracaoSeg: 25 * 60,
    })
    expect(notificar).toHaveBeenCalledWith('Sessão concluída! Excelente trabalho.')
    expect(result.current.fase).toBe('PAUSA CURTA')
    expect(result.current.rotuloBotao).toBe('Iniciar Pausa')
    expect(result.current.meta.valorPrincipal).toBe('25m')
  })
})
