import React, { useState, useRef, useEffect } from 'react'
import { useTheme, type ThemeId } from '@/context/ThemeContext'
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

  const handleSelect = (id: ThemeId, name: string) => {
    setTheme(id)
    setOpen(false)
    toast.success('Theme Applied', `Active theme switched to ${name}. Saved to local preferences.`)
  }

  const compulsoryThemes = themes.filter((t) => t.id === 'white' || t.id === 'black')
  const customColorThemes = themes.filter((t) => t.id !== 'white' && t.id !== 'black')

  return (
    <div className="relative" ref={menuRef}>
      {/* Theme Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="Change application color theme"
        aria-label="Theme selector"
        aria-expanded={open}
      >
        <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        <span
          className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs"
          style={{
            backgroundColor:
              currentConfig.id === 'white'
                ? '#f8fafc'
                : currentConfig.id === 'black'
                ? '#09090b'
                : currentConfig.color,
          }}
        />
        <span className="hidden sm:inline-block max-w-[85px] truncate">
          {currentConfig.name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Theme Selection Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-950/15 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              Theme Appearance
            </p>
            <p className="text-[11px] text-slate-400">
              White is default. Saved in your browser storage.
            </p>
          </div>

          {/* Compulsory White & Black Section */}
          <div className="px-2 py-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">
              Compulsory Modes
            </span>
            <div className="mt-1 space-y-0.5">
              {compulsoryThemes.map((t) => {
                const isSelected = theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id, t.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs shrink-0"
                        style={{
                          backgroundColor: t.id === 'white' ? '#ffffff' : '#09090b',
                        }}
                      />
                      <div>
                        <span className="block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {t.id === 'white' ? 'Standard Light' : 'Deep Midnight Dark'}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Predefined Color Themes Section */}
          <div className="px-2 py-1 border-t border-slate-100 dark:border-slate-800/80 mt-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">
              Predefined Color Accents
            </span>
            <div className="mt-1 space-y-0.5">
              {customColorThemes.map((t) => {
                const isSelected = theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id, t.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <div>
                        <span className="block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal truncate block max-w-[170px]">
                          {t.description.split(' ')[0]} {t.description.split(' ')[1]} tone
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
