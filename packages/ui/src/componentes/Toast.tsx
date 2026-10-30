export interface ToastProps {
  mensagem: string | null;
}

/**
 * Toast central inferior para confirmações. Em vez de `display:none` como no
 * protótipo, alternamos opacidade (mantendo o nó no DOM) para permitir
 * transição suave — desligada automaticamente por `prefers-reduced-motion`.
 */
export function Toast({ mensagem }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-border-strong bg-toast-bg px-[18px] py-3 font-sans text-ink shadow-[0_8px_30px_var(--color-shadow)] transition-opacity motion-reduce:transition-none ${
        mensagem ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {mensagem}
    </div>
  );
}
