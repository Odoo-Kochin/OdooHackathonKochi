import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@shared/contracts/auth.js'
import { Modal } from '@/components/ui/modal'
import { AuthCarousel } from '@/components/auth/AuthCarousel'
import { ThemeSelector } from '@/components/layout/ThemeSelector'
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
  LogIn,
  KeyRound,
  ShieldCheck,
  Globe,
  Sparkles,
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-950 overflow-hidden">
      {/* Left Side: Full-Height Auth Section (no card box) */}
      <div className="w-full lg:w-[480px] xl:w-[540px] 2xl:w-[580px] flex-shrink-0 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-6">
          {/* Brand Header */}
            <div className="mb-6 text-left">
              <div className="flex items-center justify-between mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Brightloop Cloud Edition</span>
                </div>
                <ThemeSelector />
              </div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Brightloop Software
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enterprise Subscription Management & Automated Billing Gateway
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
            <span className="pb-3 px-2 border-b-2 border-indigo-600 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <LogIn className="w-4 h-4 text-indigo-600" />
              <span>Sign In</span>
            </span>
            <Link
              to="/register"
              className="pb-3 px-4 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>Create Account</span>
            </Link>
          </div>

          {/* Quick Role Sign-in Tiles with Vector Badges */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick Role Sign-In
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> 1-click test
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Admin</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1">Alex Rivera</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Staff</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1">Sarah Chen</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
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
                Or authenticate with credentials
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Work Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brightloop.io"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot password?</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 pr-10 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
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
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Sign up as a customer</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Security Footer with Vector Icons */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>SOC2 Type II</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Multi-Tenant Cloud</span>
          </div>
        </div>
      </div>

      {/* Right Side: Full-Screen Slanted Merry-Go-Round Carousel */}
      <div className="hidden lg:flex flex-1 min-h-screen relative overflow-hidden bg-slate-950">
        <AuthCarousel />
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Email Address</span>
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
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-sm flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Sending...' : 'Send Reset Link'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
