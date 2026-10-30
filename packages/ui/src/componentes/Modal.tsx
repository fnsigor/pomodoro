import type { MouseEvent, ReactNode } from 'react';
import { useEffect } from 'react';

export interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

/**
 * Modal/popover genérico e acessível (fundo escurecido, card central,
 * role="dialog", fecha com Esc e clique fora). Reusável para o popover de
 * criar preset personalizado e para o menu de atividades.
 */
export function Modal({ aberto, titulo, onFechar, children }: ModalProps) {
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onFechar();
    }

    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  function aoClicarFundo(evento: MouseEvent<HTMLDivElement>) {
    if (evento.target === evento.currentTarget) onFechar();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-overlay p-4" onMouseDown={aoClicarFundo}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-md rounded-[24px] border border-border bg-panel p-6 text-ink"
      >
        {children}
      </div>
    </div>
  );
}
