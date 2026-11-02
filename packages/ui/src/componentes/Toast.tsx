import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import { IconeAviso, IconeErro, IconeSucesso } from '../icones';

export type TipoToast = 'default' | 'success' | 'warning' | 'error';
export type Notificar = (mensagem: string, tipo?: TipoToast) => void;

/** Manager global: `notificar()` pode ser chamado de fora de componentes React. */
export const toast = ToastPrimitive.createToastManager();

export function notificar(mensagem: string, tipo: TipoToast = 'default') {
  toast.add({ title: mensagem, type: tipo === 'default' ? undefined : tipo });
}

function classesDoTipo(tipo: string | undefined) {
  if (tipo === 'success') return 'border-[#22c55e]/50 bg-toast-success text-ink';
  if (tipo === 'warning') return 'border-[#fb923c]/50 bg-toast-warning text-ink';
  if (tipo === 'error') return 'border-[#ef4444]/50 bg-toast-error text-ink';
  return 'border-border-strong bg-toast-bg text-ink';
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={`pointer-events-none fixed right-4 bottom-4 z-50 w-[calc(100vw-2rem)] max-w-sm outline-none ${className ?? ''}`}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={`group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border shadow-[0_8px_30px_var(--color-shadow)] will-change-transform outline-none select-none [--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms] after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] ${classesDoTipo(props.toast.type)} ${className ?? ''}`}
      {...props}
    />
  );
}

function ToastIcon({ tipo }: { tipo: string | undefined }) {
  const Icone = tipo === 'success' ? IconeSucesso : tipo === 'warning' ? IconeAviso : tipo === 'error' ? IconeErro : null;
  if (!Icone) return null;

  return (
    <span data-slot="toast-icon" className="shrink-0 [&_svg]:size-[18px]">
      <Icone />
    </span>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastPrimitive.Content
        data-slot="toast-content"
        className="flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100"
      >
        <ToastIcon tipo={item.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastPrimitive.Title data-slot="toast-title" className="text-sm font-medium" />
        </div>
      </ToastPrimitive.Content>
    </Toast>
  ));
}

/** Deve ser renderizado uma vez, perto da raiz do app. */
export function Toaster({ children, toastManager = toast, ...props }: ToastPrimitive.Provider.Props) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} timeout={3000} limit={3} {...props}>
      {children}
      <ToastPrimitive.Portal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
