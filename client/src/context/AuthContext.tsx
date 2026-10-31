import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import type {
  AuthUser,
  UserRole,
  LoginRequest,
  RegisterRequest,
} from '@shared/contracts/auth.js'
import { MOCK_AUTH_USERS } from '@shared/contracts/auth.js'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>
  register: (data: RegisterRequest) => Promise<{ success: boolean; message?: string }>
  quickLogin: (role: UserRole) => Promise<void>
  logout: () => void
  requestReset: (email: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'brightloop_auth_user'
const TOKEN_KEY = 'brightloop_auth_token'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Attempt to restore session from localStorage or verify with backend /api/auth/me
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY)
        const storedToken = localStorage.getItem(TOKEN_KEY)

        if (storedUser && storedToken) {
          try {
            setUser(JSON.parse(storedUser))
            setToken(storedToken)
          } catch {
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(TOKEN_KEY)
          }
        }
      } catch (err) {
        console.warn('Session restoration note:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await axios.post('/api/auth/login', credentials)
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        setToken(response.data.token || 'demo-token')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user))
        localStorage.setItem(TOKEN_KEY, response.data.token || 'demo-token')
        return { success: true }
      }
      return { success: false, message: response.data.message || 'Login failed' }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Could not sign in. Please verify your credentials.'
      return { success: false, message: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response = await axios.post('/api/auth/register', data)
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        setToken(response.data.token || 'demo-token')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user))
        localStorage.setItem(TOKEN_KEY, response.data.token || 'demo-token')
        return { success: true }
      }
      return { success: false, message: response.data.message || 'Registration failed' }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Registration could not be completed.'
      return { success: false, message: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (role: UserRole) => {
    setIsLoading(true)
    try {
      const response = await axios.post('/api/auth/quick-login', { role })
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        setToken(response.data.token)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user))
        localStorage.setItem(TOKEN_KEY, response.data.token)
      }
    } catch (err) {
      // Fallback directly to mock role in client if network is interrupted
      const mock = MOCK_AUTH_USERS[role]
      setUser(mock)
      setToken(`fallback-${role}`)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  const requestReset = async (email: string) => {
    try {
      const res = await axios.post('/api/auth/reset-password', { email })
      return {
        success: true,
        message: res.data.message || `Password reset link dispatched to ${email}`,
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || 'Could not send reset link.',
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        quickLogin,
        logout,
        requestReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
