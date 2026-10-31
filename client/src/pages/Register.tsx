import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@shared/contracts/auth.js'
import {
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Building,
  User,
  Mail,
  Lock,
  AlertCircle,
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
        'Please meet all 4 password security requirements below.'
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-sm mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Account
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Join Brightloop Software Subscription Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
            <Link
              to="/login"
              className="pb-3 px-1 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Sign In
            </Link>
            <span className="pb-3 px-4 border-b-2 border-indigo-600 text-sm font-semibold text-slate-900 dark:text-white">
              Create Account
            </span>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="David Miller"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Retail"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Work Email (One Account Per Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@acmeretail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password criteria checklist */}
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] space-y-1">
                <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.length ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {passwordChecks.length ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span>More than 8 characters</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.uppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {passwordChecks.uppercase ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span>Uppercase (A-Z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.lowercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {passwordChecks.lowercase ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span>Lowercase (a-z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.special ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {passwordChecks.special ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span>Special char (!@#$)</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'customer', title: 'Customer', desc: 'Client portal' },
                  { id: 'staff', title: 'Internal Staff', desc: 'Ops & Sales' },
                  { id: 'admin', title: 'Admin', desc: 'Full control' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as UserRole)}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      role === item.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Complete Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
