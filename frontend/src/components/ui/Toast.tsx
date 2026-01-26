'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Toast Notification System - STORY-025
 * 
 * Provides consistent notification pattern across all features:
 * - Non-blocking toast notifications
 * - Configurable duration per toast type
 * - Responsive positioning (bottom-right desktop, bottom center mobile)
 * - Role-based intensity (future enhancement)
 * - Support for success, error, warning, info types
 */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  persistent?: boolean;
}

interface ToastConfig {
  /** Default duration in ms per toast type */
  durations: Record<ToastType, number>;
  /** Maximum number of visible toasts */
  maxVisible: number;
  /** Position on desktop */
  desktopPosition: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  /** Position on mobile */
  mobilePosition: 'top' | 'bottom';
}

interface ToastOptions {
  /** Custom duration in ms (overrides default) */
  duration?: number;
  /** If true, toast won't auto-dismiss */
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  config: ToastConfig;
  updateConfig: (newConfig: Partial<ToastConfig>) => void;
}

// Default configuration
const DEFAULT_CONFIG: ToastConfig = {
  durations: {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
  },
  maxVisible: 5,
  desktopPosition: 'bottom-right',
  mobilePosition: 'bottom',
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider for non-blocking feedback messages.
 * Implements UX guidelines: no error boxes, use toast/inline for feedback.
 * 
 * STORY-025: Consistent notification framework across all features.
 */
export function ToastProvider({ 
  children,
  initialConfig,
}: { 
  children: ReactNode;
  initialConfig?: Partial<ToastConfig>;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [config, setConfig] = useState<ToastConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((
    message: string, 
    type: ToastType = 'info',
    options?: ToastOptions
  ): string => {
    const id = Math.random().toString(36).substring(7);
    const duration = options?.duration ?? config.durations[type];
    const persistent = options?.persistent ?? false;
    
    setToasts((prev) => {
      // Limit max visible toasts
      const newToasts = [...prev, { id, message, type, duration, persistent }];
      if (newToasts.length > config.maxVisible) {
        return newToasts.slice(-config.maxVisible);
      }
      return newToasts;
    });

    // Auto-dismiss unless persistent
    if (!persistent) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, [config.durations, config.maxVisible, removeToast]);

  const updateConfig = useCallback((newConfig: Partial<ToastConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll, config, updateConfig }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} config={config} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Toast Container - Renders all active toasts
 * Responsive: desktop right corner, mobile bottom full width
 */
function ToastContainer({
  toasts,
  onClose,
  config,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
  config: ToastConfig;
}) {
  if (toasts.length === 0) return null;

  // Position classes based on config
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const mobilePositionClasses = {
    'top': 'top-4 left-4 right-4',
    'bottom': 'bottom-4 left-4 right-4',
  };

  // Icons per type
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <>
      {/* Desktop view */}
      <div 
        className={`
          hidden md:flex fixed z-50 flex-col gap-2
          ${positionClasses[config.desktopPosition]}
        `}
        role="alert"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={onClose}
            icon={icons[toast.type]}
          />
        ))}
      </div>

      {/* Mobile view */}
      <div 
        className={`
          flex md:hidden fixed z-50 flex-col gap-2
          ${mobilePositionClasses[config.mobilePosition]}
        `}
        role="alert"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={onClose}
            icon={icons[toast.type]}
            mobile
          />
        ))}
      </div>
    </>
  );
}

/**
 * Individual Toast Item
 */
function ToastItem({
  toast,
  onClose,
  icon,
  mobile = false,
}: {
  toast: Toast;
  onClose: (id: string) => void;
  icon: string;
  mobile?: boolean;
}) {
  const colorClasses: Record<ToastType, string> = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        animate-in slide-in-from-right duration-300
        ${colorClasses[toast.type]}
        ${mobile ? 'w-full' : 'min-w-[300px] max-w-[400px]'}
      `}
    >
      <span className="text-lg flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-2 hover:opacity-75 flex-shrink-0"
        aria-label="Sluiten"
      >
        ✕
      </button>
    </div>
  );
}
