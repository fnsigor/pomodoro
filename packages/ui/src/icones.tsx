import type { SVGProps } from 'react';

type IconeProps = SVGProps<SVGSVGElement>;

/**
 * Ícones inline portados de design/home.html (paths/viewBox exatos do protótipo).
 * Cada um é "mudo" por padrão (aria-hidden="true") — o rótulo acessível vai no
 * botão que envolve o ícone, via `aria-label`.
 */

export function IconeRaio({ className, ...props }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
      <path d="M13.1 2.5 5.7 13a1 1 0 0 0 .8 1.6h4.1l-.7 6.1a.7.7 0 0 0 1.3.4L18.4 10a1 1 0 0 0-.8-1.6h-4.2l1-5a.7.7 0 0 0-1.3-.9Z" />
    </svg>
  );
}

export function IconeFogo({ className, ...props }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
      <path d="M13.5 1.7c.4 3.5-2.5 4.8-2.5 7.2 0 1.1.7 1.9 1.7 1.9 1.7 0 2.7-1.8 2.4-3.7 2.8 2.1 4.2 4.6 4.2 7.2a7.3 7.3 0 1 1-14.6 0c0-3.2 1.9-6.4 5.7-9.3-.3 2.4.1 3.6 1 3.6 1.2 0 2.5-3.1 2.1-6.9Z" />
    </svg>
  );
}

export function IconeSino({ className, ...props }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
      <path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2Zm7-5-1.7-2.1V10a5.3 5.3 0 0 0-4.3-5.2V4a1 1 0 0 0-2 0v.8A5.3 5.3 0 0 0 6.7 10v4.9L5 17a1 1 0 0 0 .8 1.6h12.4A1 1 0 0 0 19 17Z" />
    </svg>
  );
}

export function IconePlay({ className, ...props }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
      <path d="M7 4.8c0-.8.9-1.3 1.6-.9l11 7.1a1.2 1.2 0 0 1 0 2L8.6 20.1c-.7.4-1.6-.1-1.6-.9V4.8Z" />
    </svg>
  );
}

export function IconePause({ className, ...props }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

export function IconeReiniciar({ className, ...props }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M20 7v5h-5M19 12a7.5 7.5 0 1 1-2.2-5.3L20 10" />
    </svg>
  );
}

export function IconePular({ className, ...props }: IconeProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...props}>
      <path d="M5 5.8c0-1 1.1-1.6 2-1l9 7.2-9 7.2c-.9.6-2 .1-2-1V5.8ZM18 5h2v14h-2z" />
    </svg>
  );
}

export function IconeSetaEsquerda({ className, ...props }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.3}
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="m15 18-6-6 6-6M9 12h12" />
    </svg>
  );
}

export function IconeSetaDireita({ className, ...props }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.3}
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="m9 18 6-6-6-6m6 6H3" />
    </svg>
  );
}

/**
 * O protótipo usa o caractere Unicode "⌄" para o chevron da atividade (não há
 * SVG correspondente em design/home.html). Para manter o ícone acessível e
 * consistente com os demais (aria-hidden, className, cor via currentColor),
 * sintetizamos um chevron simples em vez de reaproveitar o glifo de texto.
 */
export function IconeChevron({ className, ...props }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
