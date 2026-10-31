import React, { createContext, useContext, useState, useEffect } from 'react'

export type ThemeId = 'white' | 'black' | 'emerald' | 'violet' | 'ocean' | 'amber' | 'rose'

export interface ThemeConfig {
  id: ThemeId
  name: string
  bgName: string
  surfaceName: string
  accentName: string
  bgColor: string
  surfaceColor: string
  accentColor: string
  textColor: string
  isDark: boolean
}

export const PREDEFINED_THEMES: ThemeConfig[] = [
  {
    id: 'white',
    name: 'Snow White',
    bgName: 'Clean Slate (#f8fafc)',
    surfaceName: 'Pure White (#ffffff)',
    accentName: 'Royal Indigo (#4f46e5)',
    bgColor: '#f8fafc',
    surfaceColor: '#ffffff',
    accentColor: '#4f46e5',
    textColor: '#0f172a',
    isDark: false,
  },
  {
    id: 'black',
    name: 'Obsidian Black',
    bgName: 'Pitch Black (#000000)',
    surfaceName: 'Dark Obsidian (#121215)',
    accentName: 'Silver Zinc (#a1a1aa)',
    bgColor: '#000000',
    surfaceColor: '#121215',
    accentColor: '#a1a1aa',
    textColor: '#ffffff',
    isDark: true,
  },
  {
    id: 'emerald',
    name: 'Fintech Emerald',
    bgName: 'Deep Pine (#042f24)',
    surfaceName: 'Emerald Card (#064e3b)',
    accentName: 'Mint Green (#10b981)',
    bgColor: '#042f24',
    surfaceColor: '#064e3b',
    accentColor: '#10b981',
    textColor: '#ffffff',
    isDark: true,
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    bgName: 'Deep Purple (#151030)',
    surfaceName: 'Violet Card (#24164d)',
    accentName: 'Amethyst (#a855f7)',
    bgColor: '#151030',
    surfaceColor: '#24164d',
    accentColor: '#a855f7',
    textColor: '#ffffff',
    isDark: true,
  },
  {
    id: 'ocean',
    name: 'Ocean Cyan',
    bgName: 'Marine Navy (#041c2c)',
    surfaceName: 'Ocean Card (#0c4a6e)',
    accentName: 'Sky Cyan (#38bdf8)',
    bgColor: '#041c2c',
    surfaceColor: '#0c4a6e',
    accentColor: '#38bdf8',
    textColor: '#ffffff',
    isDark: true,
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    bgName: 'Dark Bronze (#2b1202)',
    surfaceName: 'Amber Card (#522405)',
    accentName: 'Golden Honey (#fbbf24)',
    bgColor: '#2b1202',
    surfaceColor: '#522405',
    accentColor: '#fbbf24',
    textColor: '#ffffff',
    isDark: true,
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    bgName: 'Velvet Wine (#30030f)',
    surfaceName: 'Rose Card (#630821)',
    accentName: 'Coral Pink (#fb7185)',
    bgColor: '#30030f',
    surfaceColor: '#630821',
    accentColor: '#fb7185',
    textColor: '#ffffff',
    isDark: true,
  },
]

interface ThemeContextType {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  currentConfig: ThemeConfig
  themes: ThemeConfig[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'brightloop_color_theme'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId
      if (saved && PREDEFINED_THEMES.some((t) => t.id === saved)) {
        return saved
      }
    } catch {
      // LocalStorage unavailable
    }
    return 'white' // Default white theme
  })

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // Ignore storage write errors
    }
  }

  useEffect(() => {
    const root = document.documentElement
    const config = PREDEFINED_THEMES.find((t) => t.id === theme) || PREDEFINED_THEMES[0]

    // Set data-theme attribute on root
    root.setAttribute('data-theme', theme)

    // Manage dark mode class
    if (config.isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const currentConfig = PREDEFINED_THEMES.find((t) => t.id === theme) || PREDEFINED_THEMES[0]

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentConfig, themes: PREDEFINED_THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
