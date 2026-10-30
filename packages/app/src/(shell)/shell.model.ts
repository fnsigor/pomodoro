import { useCallback, useEffect, useState } from 'react'
import { calcularStreak, type Relogio, type SessaoRepository } from '@focusflow/core'
import type { AbaId } from './shell.types'

export interface ShellModelProps {
  sessaoRepo: SessaoRepository
  relogio: Relogio
}

const DURACAO_TOAST_MS = 3000

export function useShellModel({ sessaoRepo, relogio }: ShellModelProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaId>('timer')
  const [streak, setStreak] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

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

  return {
    abaAtiva,
    selecionarAba: setAbaAtiva,
    streak,
    toast,
    notificar: setToast,
    recarregarStreak,
  }
}
