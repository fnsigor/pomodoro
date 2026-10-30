import { useEffect } from 'react'

const TITULO_PADRAO = 'FocusFlow'

/** Mostra o tempo restante no título da aba enquanto o timer roda (`MM:SS — FocusFlow`). */
export function useTituloDocumento(titulo: string | null) {
  useEffect(() => {
    document.title = titulo ?? TITULO_PADRAO
  }, [titulo])

  useEffect(() => {
    return () => {
      document.title = TITULO_PADRAO
    }
  }, [])
}
