import { useCallback, useEffect, useState } from 'react'
import type { Atualizacao, Atualizador } from '@focusflow/core'

export interface ShellModelProps {
  atualizador: Atualizador
}

const DURACAO_TOAST_MS = 3000

export function useShellModel({ atualizador }: ShellModelProps) {
  const [toast, setToast] = useState<string | null>(null)
  const [atualizacaoDisponivel, setAtualizacaoDisponivel] = useState<Atualizacao | null>(null)
  const [instalandoAtualizacao, setInstalandoAtualizacao] = useState(false)

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
    toast,
    notificar: setToast,
    atualizacaoDisponivel,
    instalandoAtualizacao,
    instalarAtualizacao,
    dispensarAtualizacao,
  }
}
