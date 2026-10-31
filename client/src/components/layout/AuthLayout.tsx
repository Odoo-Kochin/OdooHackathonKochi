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
      className="h-screen w-full relative overflow-hidden transition-colors duration-500 flex flex-col"
      style={{ backgroundColor: currentConfig.bgColor }}
    >
      {/* Top Header: Same color as rest of content, on top of z-axis (z-30) */}
      <div
        role="banner"
        className="auth-topbar w-full flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4 relative z-30 shrink-0 transition-colors duration-500"
        style={{
          backgroundColor: currentConfig.bgColor,
          ['--auth-bg' as string]: currentConfig.bgColor,
        }}
      >
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

        {/* Theme selection in the right top */}
        <ThemeSelector />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden relative z-20">
        {/* Left Side: Form area that scrolls vertically when needed (e.g. Create Account) */}
        <div className="flex-1 h-full overflow-y-auto px-6 sm:px-10 lg:px-16 py-4 flex flex-col items-start">
          <div className="w-full max-w-xl my-auto py-2">
            <Outlet />
          </div>
        </div>

        {/* Spacer for the right side so form layout respects the carousel area */}
        <div className="hidden lg:block w-[420px] xl:w-[480px] 2xl:w-[540px] shrink-0" />
      </div>

      {/* Right Side: Persistent Carousel spanning full height top-0 to bottom-0, UNDER the header in z-axis (z-10) */}
      <div
        className="hidden lg:flex w-[420px] xl:w-[480px] 2xl:w-[540px] absolute top-0 right-0 h-screen z-10 items-center justify-center overflow-hidden select-none transition-colors duration-500"
        style={{ backgroundColor: currentConfig.bgColor }}
      >
        <AuthCarousel />
      </div>
    </div>
  )
}
