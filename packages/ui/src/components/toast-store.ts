import { useSyncExternalStore } from 'react';

/**
 * Toast data stored in the external store
 */
export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    altText: string;
    onClick: () => void;
  };
}

/**
 * Options for creating a toast via the imperative API
 */
export type ToastOptions = Omit<ToastData, 'id' | 'variant'> & {
  variant?: ToastData['variant'];
};

/**
 * Toast store API interface
 */
export interface ToastStoreAPI {
  getSnapshot: () => ToastData[];
  subscribe: (listener: () => void) => () => void;
  add: (toast: ToastData) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

let toasts: ToastData[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * External store for managing toast state.
 * Compatible with React's `useSyncExternalStore` for safe concurrent rendering.
 *
 * @example
 * ```ts
 * toastStore.add({ id: '1', variant: 'success', title: 'Done!' });
 * toastStore.dismiss('1');
 * toastStore.clear();
 * ```
 */
export const toastStore: ToastStoreAPI = {
  getSnapshot() {
    return toasts;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  add(toast: ToastData) {
    toasts = [...toasts, toast];
    emitChange();
    return toast.id;
  },

  dismiss(id: string) {
    const next = toasts.filter((t) => t.id !== id);
    if (next.length !== toasts.length) {
      toasts = next;
      emitChange();
    }
  },

  clear() {
    if (toasts.length > 0) {
      toasts = [];
      emitChange();
    }
  },
};

let counter = 0;

function generateId(): string {
  counter += 1;
  return String(counter);
}

/**
 * Create a toast notification via the imperative API.
 *
 * @example
 * ```ts
 * // With options object
 * toast({ title: 'Saved!', variant: 'success' });
 *
 * // Shorthand
 * toast.success('Saved!');
 * toast.error('Something went wrong');
 * toast.warning('Be careful');
 * toast.info('FYI');
 *
 * // Dismiss / clear
 * const id = toast.success('Done');
 * toast.dismiss(id);
 * toast.clear();
 * ```
 */
function createToast(options: ToastOptions): string {
  const id = generateId();
  const toastData: ToastData = {
    ...options,
    id,
    variant: options.variant ?? 'default',
  };
  toastStore.add(toastData);
  return id;
}

function createShorthand(variant: ToastData['variant']) {
  return (titleOrOptions: string | ToastOptions): string => {
    if (typeof titleOrOptions === 'string') {
      return createToast({ title: titleOrOptions, variant });
    }
    return createToast({ ...titleOrOptions, variant });
  };
}

export const toast = Object.assign(createToast, {
  success: createShorthand('success'),
  error: createShorthand('error'),
  warning: createShorthand('warning'),
  info: createShorthand('info'),
  dismiss: (id: string) => toastStore.dismiss(id),
  clear: () => toastStore.clear(),
});

/**
 * React hook to subscribe to the toast store.
 * Uses `useSyncExternalStore` for safe concurrent rendering.
 *
 * @example
 * ```tsx
 * function Toaster() {
 *   const toasts = useToastStore();
 *   return toasts.map(t => <Toast key={t.id} {...t} />);
 * }
 * ```
 */
export function useToastStore(): ToastData[] {
  return useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );
}
