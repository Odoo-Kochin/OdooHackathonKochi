import React, { useState, useRef, useEffect } from 'react'
import { useTheme, type ThemeConfig } from '@/context/ThemeContext'
import { useToast } from '@/context/ToastContext'
import { Palette, Check, ChevronDown } from 'lucide-react'

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, currentConfig, themes } = useTheme()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleSelect = (t: ThemeConfig) => {
    setTheme(t.id)
    setOpen(false)
    toast.success(
      'Theme Applied',
      `${t.name} applied: ${t.bgName.split(' ')[0]} bg, ${t.surfaceName.split(' ')[0]} surface, ${t.accentName.split(' ')[0]} accent.`
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Theme Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 transition-colors shadow-2xs text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="Change application color theme"
        aria-label="Theme selector"
        aria-expanded={open}
      >
        <Palette className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
        
        {/* Active Theme Mini 3-Dot Swatch */}
        <div className="flex items-center -space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-2xs z-30"
            style={{ backgroundColor: currentConfig.bgColor }}
            title={`Background: ${currentConfig.bgName}`}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-2xs z-20"
            style={{ backgroundColor: currentConfig.surfaceColor }}
            title={`Surface: ${currentConfig.surfaceName}`}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-2xs z-10"
            style={{ backgroundColor: currentConfig.accentColor }}
            title={`Accent: ${currentConfig.accentName}`}
          />
        </div>

        <span className="hidden sm:inline-block font-extrabold text-slate-900 dark:text-white truncate max-w-[85px]">
          {currentConfig.name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-500 dark:text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Theme Selection Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xl shadow-slate-950/20 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 mb-1 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Theme Appearance
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
              {themes.length} palettes
            </span>
          </div>

          {/* Unified Themes List with Explicit Color Breakdowns */}
          <div className="px-2 py-1 space-y-1 max-h-96 overflow-y-auto">
            {themes.map((t) => {
              const isSelected = theme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  className={`w-full flex items-start justify-between p-2 rounded-md text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 font-bold text-slate-950 dark:text-white ring-1 ring-slate-400 dark:ring-slate-600 shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Visual 3-Swatch Palette Indicator */}
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                      <div className="flex items-center -space-x-1">
                        <span
                          className="w-3 h-3 rounded-full border border-black/30 shadow-2xs z-30"
                          style={{ backgroundColor: t.bgColor }}
                          title={`Background: ${t.bgName}`}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/30 shadow-2xs z-20"
                          style={{ backgroundColor: t.surfaceColor }}
                          title={`Surface: ${t.surfaceName}`}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/30 shadow-2xs z-10"
                          style={{ backgroundColor: t.accentColor }}
                          title={`Accent: ${t.accentName}`}
                        />
                      </div>
                    </div>

                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {t.name}
                        </span>
                        {t.id === 'white' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 space-y-0.5">
                        <div className="truncate">
                          <span className="text-slate-400">Bg:</span> {t.bgName}
                        </div>
                        <div className="truncate">
                          <span className="text-slate-400">Surface:</span> {t.surfaceName}
                        </div>
                        <div className="truncate">
                          <span className="text-slate-400">Accent:</span> {t.accentName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-white shrink-0 mt-0.5 font-bold" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
