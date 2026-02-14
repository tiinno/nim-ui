import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { toast, toastStore, type ToastData } from '@tiinno-ui/components';
import { Button } from '@tiinno-ui/components';

// ---------------------------------------------------------------------------
// Inline-styled Toaster for docs — immune to Starlight CSS resets
// ---------------------------------------------------------------------------

const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';

const variantStyles: Record<string, { bg: string; border: string; color: string; iconColor: string }> = {
  default:  { bg: '#ffffff',  border: '#e5e5e5', color: '#171717', iconColor: '#737373' },
  success:  { bg: '#f0fdf4',  border: 'rgba(34,197,94,0.35)', color: '#15803d', iconColor: '#22c55e' },
  error:    { bg: '#fef2f2',  border: 'rgba(239,68,68,0.35)', color: '#b91c1c', iconColor: '#ef4444' },
  warning:  { bg: '#fffbeb',  border: 'rgba(245,158,11,0.35)', color: '#b45309', iconColor: '#f59e0b' },
  info:     { bg: '#eff6ff',  border: 'rgba(59,130,246,0.35)', color: '#1d4ed8', iconColor: '#3b82f6' },
};

const icons: Record<string, ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};


function DocsToastItem({ data, onDismiss }: { data: ToastData; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const v = variantStyles[data.variant] ?? variantStyles.default;

  useEffect(() => {
    const dur = data.duration ?? 5000;
    if (dur !== Infinity && dur > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDismiss(data.id), 300);
      }, dur);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data.duration, data.id, onDismiss]);

  const toastStyle: CSSProperties = {
    all: 'initial',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 40px 14px 16px',
    borderRadius: '10px',
    border: `1px solid ${v.border}`,
    backgroundColor: v.bg,
    color: v.color,
    fontFamily: FONT,
    fontSize: '14px',
    lineHeight: '1.4',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    pointerEvents: 'auto' as const,
  };

  const iconStyle: CSSProperties = {
    flexShrink: 0,
    color: v.iconColor,
    display: 'flex',
    alignItems: 'center',
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: '1.4',
    margin: 0,
    padding: 0,
  };

  const descStyle: CSSProperties = {
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: '1.4',
    opacity: 0.85,
    margin: 0,
    padding: 0,
  };

  const closeBtnStyle: CSSProperties = {
    all: 'unset',
    position: 'absolute',
    right: '10px',
    top: '10px',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    cursor: 'pointer',
    color: v.color,
    opacity: 0.5,
    transition: 'opacity 0.15s, background 0.15s',
  };

  const actionBtnStyle: CSSProperties = {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: '6px 12px',
    borderRadius: '6px',
    border: `1px solid ${v.border}`,
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: FONT,
    cursor: 'pointer',
    color: v.color,
    transition: 'background 0.15s',
  };

  const icon = data.variant && data.variant !== 'default' ? icons[data.variant] : null;

  return (
    <div style={toastStyle} role="alert" aria-live="polite">
      {icon && <span style={iconStyle}>{icon}</span>}
      <div style={contentStyle}>
        {data.title && <div style={titleStyle}>{data.title}</div>}
        {data.description && <div style={descStyle}>{data.description}</div>}
      </div>
      {data.action && (
        <button
          style={actionBtnStyle}
          onClick={data.action.onClick}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {data.action.label}
        </button>
      )}
      <button
        style={closeBtnStyle}
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(data.id), 300); }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'transparent'; }}
        aria-label="Close notification"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}


/**
 * Docs-only Toaster with 100% inline styles.
 * Completely immune to Starlight CSS resets.
 */
function DocsToaster() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot,
  );

  const viewportStyle: CSSProperties = {
    all: 'initial',
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 2147483647,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '380px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: '100vh',
    pointerEvents: 'none',
    fontFamily: FONT,
  };

  return (
    <div style={viewportStyle}>
      {toasts.map((t) => (
        <DocsToastItem key={t.id} data={t} onDismiss={(id) => toastStore.dismiss(id)} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

export function ToastBasicDemo() {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={() => toast({ title: 'Hello!', description: 'This is a default toast.' })}>
        Default Toast
      </Button>
    </div>
  );
}

export function ToastVariantsDemo() {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={() => toast.success('Changes saved successfully')}>Success</Button>
      <Button onClick={() => toast.error('Something went wrong')}>Error</Button>
      <Button onClick={() => toast.warning('Please check your input')}>Warning</Button>
      <Button onClick={() => toast.info('New version available')}>Info</Button>
    </div>
  );
}

export function ToastWithActionDemo() {
  return (
    <div>
      <Button
        onClick={() =>
          toast({
            title: 'Item deleted',
            description: 'The item has been moved to trash.',
            variant: 'default',
            action: {
              label: 'Undo',
              altText: 'Undo the delete action',
              onClick: () => toast.success('Item restored'),
            },
          })
        }
      >
        Delete with Undo
      </Button>
    </div>
  );
}

export function ToastPositionDemo() {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={() => toast.info('Top right toast')}>Top Right</Button>
    </div>
  );
}

/**
 * Single Toaster instance for the entire toast docs page.
 * Uses DocsToaster with inline styles instead of the library Toaster.
 */
export function ToastPageToaster() {
  return <DocsToaster />;
}
