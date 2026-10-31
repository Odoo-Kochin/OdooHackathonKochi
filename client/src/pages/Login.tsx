import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@shared/contracts/auth.js'
import { Modal } from '@/components/ui/modal'
import {
  Layers,
  Shield,
  Briefcase,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Zap,
} from 'lucide-react'

export const Login: React.FC = () => {
  const { login, quickLogin, requestReset, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Forgot password modal
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  // If already logged in, navigate
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    const result = await login({ email, password })
    setIsLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setErrorMessage(result.message || 'Invalid email or password.')
    }
  }

  const handleQuickLogin = async (role: UserRole) => {
    setIsLoading(true)
    await quickLogin(role)
    setIsLoading(false)
    navigate(role === 'customer' ? '/portal' : '/dashboard')
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return
    setIsResetting(true)
    const res = await requestReset(resetEmail)
    setIsResetting(false)
    setResetStatus(res.message)
    setTimeout(() => {
      setResetModalOpen(false)
      setResetStatus(null)
      setResetEmail('')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-sm mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Brightloop Software
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Subscription Management & Recurring Billing Platform
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
            <span className="pb-3 px-1 border-b-2 border-indigo-600 text-sm font-semibold text-slate-900 dark:text-white">
              Sign In
            </span>
            <Link
              to="/register"
              className="pb-3 px-4 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Quick Role Sign-in Tiles */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick Test Sign-In
              </span>
              <span className="text-[11px] text-slate-400">1-click login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Admin</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1">Alex Rivera</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-left transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Staff</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1">Sarah Chen</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Customer</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1">Acme Retail</p>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-medium">
                Or sign in with email
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brightloop.io"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign up as a customer
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Reset Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Password"
        description="We'll send a secure password reset link to your registered email address."
      >
        {resetStatus ? (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{resetStatus}</span>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Email Address
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResetting}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-sm"
              >
                {isResetting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
