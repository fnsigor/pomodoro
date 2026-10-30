export interface AvatarProps {
  iniciais: string;
}

/**
 * Círculo 40px com borda primary. Sem imagem externa (decisão do CLAUDE.md):
 * renderiza as iniciais centralizadas em vez de carregar um avatar remoto.
 */
export function Avatar({ iniciais }: AvatarProps) {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-primary bg-panel-2 p-[2px]">
      <span className="font-display text-xs font-semibold text-ink">{iniciais}</span>
    </div>
  );
}
