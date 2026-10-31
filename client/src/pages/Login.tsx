import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@shared/contracts/auth.js'
import { Modal } from '@/components/ui/modal'
import {
  Repeat,
  Sparkles,
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
  const { login, quickLogin, requestReset } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Forgot password modal state
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

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
    if (role === 'customer') {
      navigate('/portal')
    } else {
      navigate('/dashboard')
    }
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
    }, 3500)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ================================================================== */}
        {/* LEFT COLUMN: HERO & BRAND SHOWCASE                                  */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 brightloop-gradient p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                <Repeat className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Brightloop</h1>
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Subscription Platform
                </p>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Odoo Kochi Hackathon Edition
              </span>
              <h2 className="text-3xl font-extrabold leading-tight">
                Run plans, subscriptions and recurring billing in one place.
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                The digital backbone of companies that earn revenue recurringly every month. From
                custom variants to automated billing days.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 pt-6 border-t border-white/20 text-xs text-white/70 flex items-center justify-between">
            <span>Role-Based Access Control</span>
            <span className="font-semibold text-white">Live Prototype v1.0</span>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: QUICK SIGNIN & CREDENTIAL FORM                       */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign in to Brightloop
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select a 1-click test persona or sign in with your email credentials.
            </p>
          </div>

          {/* 1-CLICK QUICK SIGN-IN TILES (Requirement: "Have a quick signin to the roles") */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Quick Sign-In
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Click any role to test
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Admin Persona */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="group p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 uppercase">
                    Admin
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Alex Rivera
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Full System Control
                </p>
              </button>

              {/* Staff Persona */}
              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="group p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 uppercase">
                    Staff
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  Sarah Chen
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Sales & Billing Ops
                </p>
              </button>

              {/* Customer Persona */}
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="group p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 uppercase">
                    Portal
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  David Miller
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Acme Retail Client
                </p>
              </button>
            </div>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400 uppercase font-semibold">Or Email Credentials</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Traditional Login Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.hackathon@odoo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In with Backend Connection'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Need a new account?{' '}
            <Link
              to="/register"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign up as a small business customer
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Reset Modal (Scene 1: "reset link should arrive at their registered email") */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Account Password"
        description="Enter your registered Brightloop email and we will dispatch a secure reset link."
      >
        {resetStatus ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Reset Link Sent</p>
              <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-300">{resetStatus}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResetting}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md transition-all"
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
