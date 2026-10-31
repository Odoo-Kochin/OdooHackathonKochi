import React from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { AuthCarousel } from '@/components/auth/AuthCarousel'
import { ThemeSelector } from '@/components/layout/ThemeSelector'
import { Layers, Sparkles } from 'lucide-react'

export const AuthLayout: React.FC = () => {
  const { currentConfig } = useTheme()

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: currentConfig.bgColor }}
    >
      {/* Left Side: Form Panel taking up all the space it has, spaced out and centered */}
      <div className="flex-1 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto z-10">
        {/* Top: Brand Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Brightloop Software
                </h1>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Cloud Edition</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enterprise Subscription Management & Automated Billing Gateway
              </p>
            </div>
          </div>
          <ThemeSelector />
        </div>

        {/* Middle: Main thing starting from left, spaced out, in middle */}
        <div className="my-auto py-4 w-full max-w-xl text-left">
          <Outlet />
        </div>

        {/* Bottom spacer to keep balanced flex vertical distribution */}
        <div className="h-4" />
      </div>

      {/* Right Side: Persistent Carousel without separation line, matching background */}
      <div
        className="hidden lg:flex w-[420px] xl:w-[480px] 2xl:w-[540px] shrink-0 h-screen sticky top-0 items-center justify-center overflow-hidden select-none transition-colors duration-500"
        style={{ backgroundColor: currentConfig.bgColor }}
      >
        <AuthCarousel />
      </div>
    </div>
  )
}
