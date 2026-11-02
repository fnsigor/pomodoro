import { useEffect, useRef } from 'react'

export interface AtalhosTimer {
  alternar: () => void
  reiniciar: () => void
  modoAnterior: () => void
  modoProximo: () => void
}

/**
 * Espaço inicia/pausa, R reinicia, ← → trocam de modo. Ignorados com foco em
 * input/textarea; Espaço não dispara em cima de um botão (evita disparar duas
 * vezes quando o foco está no próprio botão principal).
 */
export function useAtalhosTeclado(atalhos: AtalhosTimer) {
  const atalhosRef = useRef(atalhos)

  useEffect(() => {
    atalhosRef.current = atalhos
  })

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      const alvo = evento.target as HTMLElement | null
      const tag = alvo?.tagName

      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (evento.code === 'Space') {
        if (tag === 'BUTTON') return
        evento.preventDefault()
        atalhosRef.current.alternar()
        return
      }

      switch (evento.key) {
        case 'r':
        case 'R':
          atalhosRef.current.reiniciar()
          break
        case 'ArrowLeft':
          atalhosRef.current.modoAnterior()
          break
        case 'ArrowRight':
          atalhosRef.current.modoProximo()
          break
      }
    }

    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])
}
