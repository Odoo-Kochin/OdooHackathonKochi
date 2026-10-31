import React from 'react'
import { AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'primary'
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        )
      case 'warning':
        return (
          <div className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )
      default:
        return (
          <div className="p-2.5 rounded-full bg-primary/10 text-primary">
            <Info className="w-5 h-5" />
          </div>
        )
    }
  }

  const getConfirmButtonVariant = () => {
    if (variant === 'danger') return 'destructive'
    return 'default'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isLoading) onClose()
        }}
      />

      {/* Dialog Body */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 transition-all transform animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="shrink-0">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            {description && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={getConfirmButtonVariant()}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
