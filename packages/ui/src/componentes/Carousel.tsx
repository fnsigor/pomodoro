import * as React from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { IconeSetaDireita, IconeSetaEsquerda } from '../icones';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
}

interface CarouselContextProps extends CarouselProps {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within a <Carousel />');
  return context;
}

/**
 * Carousel do shadcn/ui sobre o Embla. Diferente do original, não trata setas
 * do teclado: no FocusFlow ←/→ são atalhos globais para trocar o preset, e o
 * carrossel é movido apenas pelos botões laterais e pelo arraste.
 */
export function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    // Sincroniza o estado inicial do Embla com os botões; não há outra fonte
    // para `canScrollPrev/Next` antes do primeiro evento de scroll.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api?.off('reInit', onSelect);
      api?.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{ carouselRef, api, opts, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        className={className}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel();
  // A margem negativa + padding compensam: o conteúdo fica no mesmo lugar, mas
  // a área de recorte sobe o suficiente para não cortar o card selecionado e o glow.
  const sangria = orientation === 'horizontal' ? '-mt-12 pt-12' : '-ml-12 pl-12';
  // Fade curto nas laterais: evita o corte seco do glow dos cards nas bordas.
  const fadeLateral =
    orientation === 'horizontal'
      ? {
          maskImage:
            'linear-gradient(to right, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0, black 20px, black calc(100% - 20px), transparent 100%)',
        }
      : undefined;

  return (
    <div
      ref={carouselRef}
      className={`min-w-0 flex-1 overflow-hidden ${sangria}`}
      data-slot="carousel-content"
      style={fadeLateral}
    >
      <div
        className={`flex ${orientation === 'horizontal' ? '-ml-6' : '-mt-6 flex-col'} ${className ?? ''}`}
        {...props}
      />
    </div>
  );
}

export function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={`min-w-0 shrink-0 grow-0 basis-auto ${orientation === 'horizontal' ? 'pl-6' : 'pt-6'} ${className ?? ''}`}
      {...props}
    />
  );
}

export function CarouselPrevious({ className, ...props }: React.ComponentProps<'button'>) {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <button
      type="button"
      aria-label="Opções anteriores"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={`grid h-[72px] w-8 shrink-0 place-items-center text-muted transition-opacity disabled:cursor-not-allowed disabled:opacity-30 max-mobile:hidden ${className ?? ''}`}
      {...props}
    >
      <IconeSetaEsquerda className="h-5 w-5" />
    </button>
  );
}

export function CarouselNext({ className, ...props }: React.ComponentProps<'button'>) {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <button
      type="button"
      aria-label="Próximas opções"
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={`grid h-[72px] w-8 shrink-0 place-items-center text-muted transition-opacity disabled:cursor-not-allowed disabled:opacity-30 max-mobile:hidden ${className ?? ''}`}
      {...props}
    >
      <IconeSetaDireita className="h-5 w-5" />
    </button>
  );
}

export type { CarouselApi };
