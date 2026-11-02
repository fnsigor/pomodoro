import { useCallback, useEffect, useState } from 'react'
import type { Atualizacao, Atualizador } from '@focusflow/core'

export interface ShellModelProps {
  atualizador: Atualizador
}

export function useShellModel({ atualizador }: ShellModelProps) {
  const [atualizacaoDisponivel, setAtualizacaoDisponivel] = useState<Atualizacao | null>(null)
  const [instalandoAtualizacao, setInstalandoAtualizacao] = useState(false)

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
    atualizacaoDisponivel,
    instalandoAtualizacao,
    instalarAtualizacao,
    dispensarAtualizacao,
  }
}
