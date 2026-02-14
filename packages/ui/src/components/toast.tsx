import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { toastStore } from './toast-store';

// ---------------------------------------------------------------------------
// CVA Variants
// ---------------------------------------------------------------------------

/**
 * Viewport position variants for toast placement on screen.
 *
 * @example
 * ```tsx
 * <ToastViewport position="top-right" />
 * ```
 */
const viewportVariants = cva(
  'fixed z-[100] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-3 p-4 max-h-screen',
  {
    variants: {
      position: {
        'top-right': 'top-0 right-0',
        'top-left': 'top-0 left-0',
        'top-center': 'top-0 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
      },
    },
    defaultVariants: {
      position: 'bottom-right',
    },
  }
);

/**
 * Toast variant styles with light and dark mode support.
 *
 * @example
 * ```tsx
 * <Toast variant="success">Saved!</Toast>
 * ```
 */
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[state=open]:animate-slide-in-from-right data-[state=closed]:animate-fade-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:animate-slide-out-to-right',
  {
    variants: {
      variant: {
        default:
          'border-neutral-200 bg-white text-neutral-900 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
        success:
          'border-success-500/30 bg-success-50 text-success-700 shadow-lg dark:bg-success-500/10 dark:text-success-500 dark:border-success-500/20',
        error:
          'border-error-500/30 bg-error-50 text-error-700 shadow-lg dark:bg-error-500/10 dark:text-error-500 dark:border-error-500/20',
        warning:
          'border-warning-500/30 bg-warning-50 text-warning-700 shadow-lg dark:bg-warning-500/10 dark:text-warning-500 dark:border-warning-500/20',
        info:
          'border-primary-500/30 bg-primary-50 text-primary-700 shadow-lg dark:bg-primary-500/10 dark:text-primary-500 dark:border-primary-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface ToastProviderProps extends ToastPrimitive.ToastProviderProps {}

export interface ToastViewportProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>,
    VariantProps<typeof viewportVariants> {}

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

export interface ToastTitleProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title> {}

export interface ToastDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description> {}

export interface ToastCloseProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close> {}

export interface ToastActionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action> {}

export interface ToasterProps {
  /** Position of the toast viewport on screen */
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  /** Default auto-dismiss duration in milliseconds */
  duration?: number;
  /** Swipe direction to dismiss toasts */
  swipeDirection?: 'right' | 'left' | 'up' | 'down';
}

// ---------------------------------------------------------------------------
// ToastProvider
// ---------------------------------------------------------------------------

/**
 * Toast provider that wraps the application to enable toast notifications.
 * Delegates to Radix UI Toast.Provider for context management.
 *
 * @example
 * ```tsx
 * <ToastProvider duration={5000} swipeDirection="right">
 *   <App />
 *   <ToastViewport />
 * </ToastProvider>
 * ```
 */
const ToastProvider = ToastPrimitive.Provider;

// ---------------------------------------------------------------------------
// ToastViewport
// ---------------------------------------------------------------------------

/**
 * Viewport that renders toasts at a fixed position on screen.
 * Acts as an ARIA live region for screen reader announcements.
 *
 * @example
 * ```tsx
 * <ToastViewport position="top-right" />
 * <ToastViewport position="bottom-center" />
 * ```
 */
const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, position, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(viewportVariants({ position }), className)}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

/**
 * Individual toast notification with variant styling and animations.
 * Built on Radix UI Toast.Root with CVA variants for visual styles.
 *
 * @example
 * ```tsx
 * <Toast variant="success">
 *   <ToastTitle>Saved!</ToastTitle>
 *   <ToastDescription>Your changes have been saved.</ToastDescription>
 *   <ToastClose />
 * </Toast>
 * ```
 *
 * @example
 * ```tsx
 * <Toast variant="error" duration={10000}>
 *   <ToastTitle>Error</ToastTitle>
 *   <ToastDescription>Something went wrong.</ToastDescription>
 *   <ToastAction altText="Retry the operation">Retry</ToastAction>
 *   <ToastClose />
 * </Toast>
 * ```
 */
const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    data-variant={variant ?? 'default'}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
));
Toast.displayName = 'Toast';

// ---------------------------------------------------------------------------
// ToastTitle
// ---------------------------------------------------------------------------

/**
 * Title text for a toast notification.
 *
 * @example
 * ```tsx
 * <ToastTitle>Operation successful</ToastTitle>
 * ```
 */
const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  ToastTitleProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

// ---------------------------------------------------------------------------
// ToastDescription
// ---------------------------------------------------------------------------

/**
 * Description text for a toast notification.
 *
 * @example
 * ```tsx
 * <ToastDescription>Your changes have been saved successfully.</ToastDescription>
 * ```
 */
const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

// ---------------------------------------------------------------------------
// ToastClose
// ---------------------------------------------------------------------------

/**
 * Close button for dismissing a toast notification.
 * Includes an accessible aria-label for screen readers.
 *
 * @example
 * ```tsx
 * <ToastClose />
 * ```
 */
const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  ToastCloseProps
>(({ className, children, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors',
      'hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400',
      'dark:text-neutral-500 dark:hover:text-neutral-100',
      className
    )}
    aria-label="Close notification"
    {...props}
  >
    {children ?? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )}
  </ToastPrimitive.Close>
));
ToastClose.displayName = 'ToastClose';

// ---------------------------------------------------------------------------
// ToastAction
// ---------------------------------------------------------------------------

/**
 * Action button within a toast notification.
 * Requires an `altText` prop for accessibility.
 *
 * @example
 * ```tsx
 * <ToastAction altText="Undo the last action" onClick={handleUndo}>
 *   Undo
 * </ToastAction>
 * ```
 */
const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Action>,
  ToastActionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-transparent px-3 py-1.5 text-sm font-medium transition-colors',
      'hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400',
      'dark:border-neutral-700 dark:hover:bg-neutral-800',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

// ---------------------------------------------------------------------------
// Variant Icons
// ---------------------------------------------------------------------------

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const variantIcons: Record<string, React.FC> = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

// ---------------------------------------------------------------------------
// Toaster (convenience component)
// ---------------------------------------------------------------------------

/**
 * Convenience component that combines ToastProvider, ToastViewport, and
 * renders toasts from the external store via `useSyncExternalStore`.
 *
 * Place once at the root of your application alongside the imperative
 * `toast()` API from `toast-store`.
 *
 * @example
 * ```tsx
 * import { Toaster, toast } from '@tiinno-ui/components';
 *
 * function App() {
 *   return (
 *     <>
 *       <button onClick={() => toast.success('Saved!')}>Save</button>
 *       <Toaster position="bottom-right" />
 *     </>
 *   );
 * }
 * ```
 */
function Toaster({
  position = 'bottom-right',
  duration = 5000,
  swipeDirection = 'right',
}: ToasterProps) {
  const toasts = React.useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot,
  );

  return (
    <ToastProvider duration={duration} swipeDirection={swipeDirection}>
      {toasts.map((t) => {
        const Icon = t.variant ? variantIcons[t.variant] : undefined;
        return (
          <Toast
            key={t.id}
            variant={t.variant}
            duration={t.duration}
            onOpenChange={(open) => {
              if (!open) toastStore.dismiss(t.id);
            }}
          >
            {Icon && (
              <div className="shrink-0">
                <Icon />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1">
              {t.title && <ToastTitle>{t.title}</ToastTitle>}
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            {t.action && (
              <ToastAction altText={t.action.altText} onClick={t.action.onClick}>
                {t.action.label}
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport position={position} />
    </ToastProvider>
  );
}

Toaster.displayName = 'Toaster';

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  Toaster,
  toastVariants,
  viewportVariants,
};
