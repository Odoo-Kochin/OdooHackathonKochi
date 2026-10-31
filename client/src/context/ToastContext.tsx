import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastItem extends ToastOptions {
  id: string
}

interface ToastContextType {
  toast: {
    (options: ToastOptions): string
    success: (title: string, description?: string, options?: Partial<ToastOptions>) => string
    error: (title: string, description?: string, options?: Partial<ToastOptions>) => string
    warning: (title: string, description?: string, options?: Partial<ToastOptions>) => string
    info: (title: string, description?: string, options?: Partial<ToastOptions>) => string
  }
  dismiss: (id: string) => void
  toasts: ToastItem[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9)
      const duration = options.duration ?? 4500

      const newItem: ToastItem = {
        ...options,
        id,
        duration,
        variant: options.variant || 'default',
      }

      setToasts((prev) => [...prev, newItem])

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }

      return id
    },
    [dismiss]
  )

  const toastMethods = Object.assign(
    (options: ToastOptions) => addToast(options),
    {
      success: (title: string, description?: string, options?: Partial<ToastOptions>) =>
        addToast({ ...options, title, description, variant: 'success' }),
      error: (title: string, description?: string, options?: Partial<ToastOptions>) =>
        addToast({ ...options, title, description, variant: 'error' }),
      warning: (title: string, description?: string, options?: Partial<ToastOptions>) =>
        addToast({ ...options, title, description, variant: 'warning' }),
      info: (title: string, description?: string, options?: Partial<ToastOptions>) =>
        addToast({ ...options, title, description, variant: 'info' }),
    }
  )

  return (
    <ToastContext.Provider value={{ toast: toastMethods, dismiss, toasts }}>
      {children}
      {/* Toast Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2.5 pointer-events-none max-w-[calc(100vw-1.5rem)]"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="alert"
            className="relative overflow-hidden pointer-events-auto flex items-start gap-2.5 p-3.5 pb-4 w-[320px] sm:w-[340px] max-w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-950/12 transition-all transform animate-in slide-in-from-bottom-5 fade-in duration-200"
          >
            <div className="shrink-0 mt-0.5">
              {item.variant === 'success' && (
                <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {item.variant === 'error' && (
                <div className="p-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {item.variant === 'warning' && (
                <div className="p-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {item.variant === 'info' && (
                <div className="p-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Info className="w-4 h-4" />
                </div>
              )}
              {item.variant === 'default' && (
                <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Info className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1 break-words">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words">
                {item.title}
              </h4>
              {item.description && (
                <div className="mt-1 text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap max-h-60 overflow-y-auto pr-0.5">
                  {item.description}
                </div>
              )}
              {item.action && (
                <button
                  onClick={() => {
                    item.action?.onClick()
                    dismiss(item.id)
                  }}
                  className="mt-2 text-xs font-semibold text-primary hover:underline focus:outline-none"
                >
                  {item.action.label}
                </button>
              )}
            </div>

            <button
              onClick={() => dismiss(item.id)}
              className="shrink-0 -mt-0.5 -mr-1 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Lifespan Countdown Bar Running Down Right-to-Left */}
            {item.duration && item.duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/90 overflow-hidden">
                <div
                  className={`h-full w-full toast-timer-bar ${
                    item.variant === 'success'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : item.variant === 'error'
                      ? 'bg-gradient-to-r from-rose-500 to-red-400'
                      : item.variant === 'warning'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                      : item.variant === 'info'
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-400'
                      : 'bg-gradient-to-r from-slate-500 to-slate-400'
                  }`}
                  style={{
                    animationDuration: `${item.duration}ms`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.toast
}
