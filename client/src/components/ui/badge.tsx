import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-indigo-600 text-white shadow-xs hover:bg-indigo-700',
        secondary: 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-200',
        destructive: 'border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 shadow-xs hover:bg-red-100',
        outline: 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900',
        success: 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-xs hover:bg-emerald-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

