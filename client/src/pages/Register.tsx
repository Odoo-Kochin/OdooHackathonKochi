import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@shared/contracts/auth.js'
import { AuthCarousel } from '@/components/auth/AuthCarousel'
import { ThemeSelector } from '@/components/layout/ThemeSelector'
import {
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  User,
  Mail,
  Lock,
  AlertCircle,
  Briefcase,
  Shield,
  UserPlus,
  LogIn,
  Sparkles,
  ShieldCheck,
  Globe,
} from 'lucide-react'

export const Register: React.FC = () => {
  const { register, user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const passwordChecks = useMemo(() => {
    return {
      length: password.length > 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }
  }, [password])

  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!isPasswordValid) {
      setErrorMessage(
        'Please meet all 4 password security criteria before registering.'
      )
      return
    }

    setIsLoading(true)
    const result = await register({
      name,
      email,
      password,
      company,
      role,
    })
    setIsLoading(false)

    if (result.success) {
      navigate(role === 'customer' ? '/portal' : '/dashboard')
    } else {
      setErrorMessage(result.message || 'Registration could not be completed.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Auth Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-8 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl">
            {/* Brand Header */}
            <div className="mb-6 text-left">
              <div className="flex items-center justify-between mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Account Onboarding</span>
                </div>
                <ThemeSelector />
              </div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Create Account
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Join Brightloop Software Subscription Platform
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
            <Link
              to="/login"
              className="pb-3 px-2 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <span className="pb-3 px-4 border-b-2 border-indigo-600 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Create Account</span>
            </span>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Work Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@company.com"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Company / Legal Entity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Organization / Company Name</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Apex Retailers Ltd"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Account Role Selector with Vector Badges */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Account Role</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    role === 'customer'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Customer</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Self-service</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    role === 'staff'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Staff</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Quotations</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    role === 'admin'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">System full</p>
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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

              {/* Password Checklist with Vector Status Icons */}
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.length ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                  }`}
                >
                  {passwordChecks.length ? (
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>At least 8 characters long</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.uppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                  }`}
                >
                  {passwordChecks.uppercase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>Includes at least one uppercase letter (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.lowercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                  }`}
                >
                  {passwordChecks.lowercase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>Includes at least one lowercase letter (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.special ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                  }`}
                >
                  {passwordChecks.special ? (
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span>Includes a special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Sign in here</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Security Footer with Vector Icons */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted At Rest</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Strict Privacy</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Global Coverage</span>
          </div>
        </div>
      </div>

      {/* Right Side: Animated Feature Carousel */}
      <div className="hidden lg:flex lg:col-span-5 flex-col">
        <AuthCarousel />
      </div>
    </div>
  </div>
  )
}
