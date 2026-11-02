import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './Carousel';
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
  onNovoPreset: () => void;
}

/**
 * Carrossel horizontal de presets. As setas movem apenas a lista; a seleção
 * acontece clicando no card (animação do Motion) ou pelos atalhos de teclado.
 * Abaixo de 621px as setas somem e o arraste horizontal assume.
 */
export function PresetSelector({ presets, selecionadoId, onSelecionar, onNovoPreset }: PresetSelectorProps) {
  const [api, setApi] = useState<CarouselApi>();
  const reduzirMovimento = useReducedMotion() ?? false;
  const indiceSelecionado = presets.findIndex((preset) => preset.id === selecionadoId);

  useEffect(() => {
    if (!api || indiceSelecionado < 0) return;
    const slide = api.slideNodes()[indiceSelecionado];
    if (!slide) return;
    const slideRect = slide.getBoundingClientRect();
    if (slideRect.width === 0) return;
    const containerRect = api.containerNode().getBoundingClientRect();
    const naBorda =
      slideRect.left < containerRect.left + 24 || slideRect.right > containerRect.right - 24;
    if (naBorda) api.scrollTo(indiceSelecionado, reduzirMovimento);
  }, [api, indiceSelecionado, reduzirMovimento]);

  return (
    <div role="radiogroup" aria-label="Duração do temporizador" className="w-[620px] max-w-full">
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', watchSlides: true }}
        className="flex w-full items-center gap-6 max-mobile:gap-2"
      >
        <CarouselPrevious />
        <CarouselContent>
          {presets.map((preset) => (
            <CarouselItem key={preset.id}>
              <PresetCard
                rotulo={preset.rotulo}
                valorCurto={preset.valorCurto}
                unidade={preset.id === selecionadoId ? preset.unidade : undefined}
                variante={preset.id === selecionadoId ? 'selecionado' : 'normal'}
                onClick={() => onSelecionar(preset.id)}
              />
            </CarouselItem>
          ))}
          <CarouselItem>
            <PresetCard
              rotulo="Novo"
              valorCurto="+"
              variante="adicionar"
              ariaLabel="Adicionar novo preset personalizado"
              onClick={onNovoPreset}
            />
          </CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    </div>
  );
}
