import { Toast as ToastPrimitive } from '@base-ui/react/toast';

export type TipoToast = 'default' | 'success' | 'warning' | 'error';
export type Notificar = (mensagem: string, tipo?: TipoToast) => void;

/** Manager global: `notificar()` pode ser chamado de fora de componentes React. */
export const toast = ToastPrimitive.createToastManager();

export function notificar(mensagem: string, tipo: TipoToast = 'default') {
  toast.add({ title: mensagem, type: tipo === 'default' ? undefined : tipo });
}
