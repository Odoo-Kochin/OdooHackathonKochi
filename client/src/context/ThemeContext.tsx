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
    bgName: 'Deep Forest (#022c22)',
    surfaceName: 'Pine Green (#064e3b)',
    accentName: 'Vibrant Mint (#10b981)',
    bgColor: '#022c22',
    surfaceColor: '#064e3b',
    accentColor: '#10b981',
    textColor: '#ecfdf5',
    isDark: true,
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    bgName: 'Midnight Purple (#1e1b4b)',
    surfaceName: 'Deep Amethyst (#2e1065)',
    accentName: 'Electric Violet (#a855f7)',
    bgColor: '#1e1b4b',
    surfaceColor: '#2e1065',
    accentColor: '#a855f7',
    textColor: '#faf5ff',
    isDark: true,
  },
  {
    id: 'ocean',
    name: 'Ocean Cyan',
    bgName: 'Deep Abyss (#082f49)',
    surfaceName: 'Marine Blue (#0c4a6e)',
    accentName: 'Bright Cyan (#38bdf8)',
    bgColor: '#082f49',
    surfaceColor: '#0c4a6e',
    accentColor: '#38bdf8',
    textColor: '#f0f9ff',
    isDark: true,
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    bgName: 'Dark Espresso (#451a03)',
    surfaceName: 'Amber Copper (#78350f)',
    accentName: 'Golden Honey (#fbbf24)',
    bgColor: '#451a03',
    surfaceColor: '#78350f',
    accentColor: '#fbbf24',
    textColor: '#fffbeb',
    isDark: true,
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    bgName: 'Velvet Wine (#4c0519)',
    surfaceName: 'Crimson Berry (#881337)',
    accentName: 'Coral Pink (#fb7185)',
    bgColor: '#4c0519',
    surfaceColor: '#881337',
    accentColor: '#fb7185',
    textColor: '#fff1f2',
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
