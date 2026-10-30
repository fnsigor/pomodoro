import { useCallback, useEffect, useState } from 'react'
import { calcularStreak, type Atualizacao, type Atualizador, type Relogio, type SessaoRepository } from '@focusflow/core'
import type { AbaId } from './shell.types'

export interface ShellModelProps {
  sessaoRepo: SessaoRepository
  relogio: Relogio
  atualizador: Atualizador
}

const DURACAO_TOAST_MS = 3000

export function useShellModel({ sessaoRepo, relogio, atualizador }: ShellModelProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaId>('timer')
  const [streak, setStreak] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [atualizacaoDisponivel, setAtualizacaoDisponivel] = useState<Atualizacao | null>(null)
  const [instalandoAtualizacao, setInstalandoAtualizacao] = useState(false)

  const recarregarStreak = useCallback(async () => {
    const dias = await sessaoRepo.listarDiasComFoco()
    setStreak(calcularStreak(dias, relogio.agora()))
  }, [sessaoRepo, relogio])

  useEffect(() => {
    let cancelado = false
    sessaoRepo.listarDiasComFoco().then((dias) => {
      if (cancelado) return
      setStreak(calcularStreak(dias, relogio.agora()))
    })
    return () => {
      cancelado = true
    }
  }, [sessaoRepo, relogio])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), DURACAO_TOAST_MS)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    let cancelado = false
    atualizador.verificar().then((atualizacao) => {
      if (!cancelado && atualizacao) setAtualizacaoDisponivel(atualizacao)
    })
    return () => {
      cancelado = true
    }
  }, [atualizador])

  const instalarAtualizacao = useCallback(async () => {
    setInstalandoAtualizacao(true)
    try {
      await atualizador.instalar()
    } finally {
      setInstalandoAtualizacao(false)
    }
  }, [atualizador])

  const dispensarAtualizacao = useCallback(() => setAtualizacaoDisponivel(null), [])

  return {
    abaAtiva,
    selecionarAba: setAbaAtiva,
    streak,
    toast,
    notificar: setToast,
    recarregarStreak,
    atualizacaoDisponivel,
    instalandoAtualizacao,
    instalarAtualizacao,
    dispensarAtualizacao,
  }
}
