import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TimerView } from './timer.view'
import type { useTimerModel } from './timer.model'

type TimerViewProps = ReturnType<typeof useTimerModel>

function criarProps(sobrescritas: Partial<TimerViewProps> = {}): TimerViewProps {
  return {
    tempo: '25:00',
    progresso: 0,
    fase: 'FASE DE FOCO',
    pontos: ['atual', 'pendente', 'pendente', 'pendente'],
    rotuloBotao: 'Iniciar Foco',
    legendaAtalhos: [
      { tecla: 'Space', descricao: 'Iniciar ou pausar' },
      { tecla: 'R', descricao: 'Reiniciar' },
      { tecla: '← →', descricao: 'Trocar modo' },
    ],
    presets: [
      { id: 'livre', rotulo: 'Livre', valorCurto: '∞', unidade: 'LIVRE' },
      { id: 'pomodoro', rotulo: 'Pomodoro Clássico', valorCurto: '25', unidade: 'MINUTOS' },
    ],
    presetSelecionadoId: 'pomodoro',
    selecionarPreset: vi.fn(),
    modoAnterior: vi.fn(),
    modoProximo: vi.fn(),
    atividades: [{ id: 'estudo', nome: 'Estudo', cor: '#8B5CF6' }],
    atividadeAtual: { id: 'estudo', nome: 'Estudo', cor: '#8B5CF6' },
    modalAtividadeAberta: false,
    abrirModalAtividade: vi.fn(),
    fecharModalAtividade: vi.fn(),
    trocarAtividade: vi.fn(),
    modalPresetAberta: false,
    novoPresetValor: '35',
    novoPresetErro: null,
    abrirModalPreset: vi.fn(),
    fecharModalPreset: vi.fn(),
    aoMudarNovoPresetValor: vi.fn(),
    confirmarNovoPreset: vi.fn(),
    meta: { valorPrincipal: '0m', valorMeta: 'de 4h', legenda: '0% concluído hoje • 0 ciclos', percentual: 0 },
    atalhos: { alternar: vi.fn(), reiniciar: vi.fn(), modoAnterior: vi.fn(), modoProximo: vi.fn() },
    titulo: null,
    alternar: vi.fn(),
    reiniciar: vi.fn(),
    ...sobrescritas,
  }
}

describe('TimerView', () => {
  it('mostra o tempo, a fase e o rótulo do botão principal', () => {
    render(<TimerView {...criarProps()} />)

    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', 'FASE DE FOCO, 25:00 restante')
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Foco' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Duração do temporizador' })).toBeInTheDocument()
  })

  it('mostra o rótulo de pausar quando o timer está rodando', () => {
    render(<TimerView {...criarProps({ rotuloBotao: 'Pausar Foco' })} />)

    expect(screen.getByRole('button', { name: 'Pausar Foco' })).toBeInTheDocument()
  })
})
