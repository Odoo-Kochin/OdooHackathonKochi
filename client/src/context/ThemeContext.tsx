import React, { createContext, useContext, useState, useEffect } from 'react'

export type ThemeId = 'white' | 'black' | 'emerald' | 'violet' | 'ocean' | 'amber' | 'rose'

export interface ThemeConfig {
  id: ThemeId
  name: string
  color: string
  badgeColor: string
  description: string
  isDark: boolean
}

export const PREDEFINED_THEMES: ThemeConfig[] = [
  {
    id: 'white',
    name: 'Snow White (Default)',
    color: '#ffffff',
    badgeColor: '#4f46e5',
    description: 'Crisp light enterprise workspace with royal indigo accents',
    isDark: false,
  },
  {
    id: 'black',
    name: 'Obsidian Black',
    color: '#09090b',
    badgeColor: '#a1a1aa',
    description: 'Deep midnight dark mode with obsidian panels and high contrast',
    isDark: true,
  },
  {
    id: 'emerald',
    name: 'Fintech Emerald',
    color: '#059669',
    badgeColor: '#10b981',
    description: 'Fresh mint & emerald green tailored for billing and finances',
    isDark: false,
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    color: '#7c3aed',
    badgeColor: '#8b5cf6',
    description: 'Modern executive purple SaaS palette with rich contrast',
    isDark: false,
  },
  {
    id: 'ocean',
    name: 'Ocean Cyan',
    color: '#0284c7',
    badgeColor: '#0ea5e9',
    description: 'Deep sea sapphire & cyan tones for clarity and focus',
    isDark: false,
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    color: '#d97706',
    badgeColor: '#f59e0b',
    description: 'Warm golden amber and copper tones with high vibrancy',
    isDark: false,
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    color: '#e11d48',
    badgeColor: '#f43f5e',
    description: 'Dynamic crimson & coral accents for energetic dashboards',
    isDark: false,
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
    return 'white' // Default compulsory white theme
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

    // Manage compulsory dark mode class
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
