import { IconeSetaDireita, IconeSetaEsquerda } from '../icones';
import { PresetCard } from './PresetCard';

export interface Preset {
  id: string;
  rotulo: string;
  valorCurto: string;
  unidade: string;
}

export interface PresetSelectorProps {
  presets: Preset[];
  selecionadoId: string;
  onSelecionar: (id: string) => void;
  onAnterior: () => void;
  onProximo: () => void;
  onNovoPreset: () => void;
}

/**
 * Carrossel horizontal de presets de duração. Abaixo de 621px (mobile) as
 * setas somem e a lista vira scroll horizontal, como no protótipo.
 */
export function PresetSelector({
  presets,
  selecionadoId,
  onSelecionar,
  onAnterior,
  onProximo,
  onNovoPreset,
}: PresetSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Duração do temporizador"
      className="flex items-start gap-6 max-tablet:gap-3 max-mobile:w-full max-mobile:gap-2 max-mobile:overflow-x-auto max-mobile:px-1 max-mobile:pb-2 max-mobile:pt-6"
    >
      <button
        type="button"
        aria-label="Opções anteriores"
        onClick={onAnterior}
        className="mt-[17px] grid h-[72px] w-8 shrink-0 place-items-center text-muted max-mobile:hidden"
      >
        <IconeSetaEsquerda className="h-5 w-5" />
      </button>
      {presets.map((preset) => (
        <PresetCard
          key={preset.id}
          rotulo={preset.rotulo}
          valorCurto={preset.valorCurto}
          unidade={preset.id === selecionadoId ? preset.unidade : undefined}
          variante={preset.id === selecionadoId ? 'selecionado' : 'normal'}
          onClick={() => onSelecionar(preset.id)}
        />
      ))}
      <PresetCard
        rotulo="Novo"
        valorCurto="+"
        variante="adicionar"
        ariaLabel="Adicionar novo preset personalizado"
        onClick={onNovoPreset}
      />
      <button
        type="button"
        aria-label="Próximas opções"
        onClick={onProximo}
        className="mt-[17px] grid h-[72px] w-8 shrink-0 place-items-center text-muted max-mobile:hidden"
      >
        <IconeSetaDireita className="h-5 w-5" />
      </button>
    </div>
  );
}
