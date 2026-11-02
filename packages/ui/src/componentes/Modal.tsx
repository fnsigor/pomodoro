import type { MouseEvent, ReactNode } from 'react';
import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';

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
 *
 * Entrada/saída usam Motion: o fundo faz fade e o card sobe/escapa com spring.
 * Com prefers-reduced-motion as durações vão a zero.
 */
export function Modal({ aberto, titulo, onFechar, children }: ModalProps) {
  const reduzirMovimento = useReducedMotion() ?? false;
  const transicaoFundo: Transition = reduzirMovimento
    ? { duration: 0 }
    : { duration: 0.18, ease: 'easeOut' };
  const transicaoCard: Transition = reduzirMovimento
    ? { duration: 0 }
    : { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 };

  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onFechar();
    }

    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  function aoClicarFundo(evento: MouseEvent<HTMLDivElement>) {
    if (evento.target === evento.currentTarget) onFechar();
  }

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transicaoFundo}
          className="fixed inset-0 z-50 grid place-items-center bg-overlay p-4"
          onMouseDown={aoClicarFundo}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={transicaoCard}
            className="w-full max-w-md rounded-[24px] border border-border bg-panel p-6 text-ink"
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
