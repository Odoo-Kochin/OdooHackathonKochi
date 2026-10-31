import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@shared/contracts/auth.js'
import {
  Repeat,
  Sparkles,
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
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Real-time password validation according to Brightloop spec:
  // > 8 chars, uppercase, lowercase, special character
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
        'Please ensure your password satisfies all 4 Brightloop security criteria below.'
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
      if (role === 'customer') {
        navigate('/portal')
      } else {
        navigate('/dashboard')
      }
    } else {
      setErrorMessage(result.message || 'Registration could not be completed.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Info Panel */}
        <div className="lg:col-span-5 brightloop-gradient p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Repeat className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">Brightloop</h1>
                <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
                  Customer Onboarding
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Scene 1: Small Business Signup
              </span>
              <h2 className="text-2xl font-extrabold leading-snug">
                Join hundreds of businesses managing recurring subscriptions effortlessly.
              </h2>
              <p className="text-white/80 text-xs leading-relaxed">
                Experience full transparency: automated quotes, customizable billing frequency, and
                self-service add-ons in your private client portal.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-white/20 text-xs text-white/70">
            <p className="font-semibold text-white">Strict Credential Policy</p>
            <p className="text-[11px] mt-0.5">
              Each email belongs to only one account with cryptographic salted security.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create an Account
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Start your subscription journey with Brightloop Software.
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
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
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Retail Co."
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Work Email (Unique Account ID)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@acmeretail.com"
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
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
                  className="w-full pl-9 pr-10 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements Checklist (Brightloop Scene 1 Spec) */}
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <p className="font-bold text-[11px] text-slate-700 dark:text-slate-300 mb-1.5">
                  Brightloop Password Security Criteria:
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.length ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {passwordChecks.length ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span>More than 8 chars ({password.length}/9)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.uppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {passwordChecks.uppercase ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span>Uppercase letter (A-Z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.lowercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {passwordChecks.lowercase ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span>Lowercase letter (a-z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.special ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {passwordChecks.special ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                    <span>Special char (!@#$...)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role designation selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Account Access Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'customer', title: 'Customer', desc: 'Client portal & invoices' },
                  { id: 'staff', title: 'Internal Staff', desc: 'Quotes & Billing Ops' },
                  { id: 'admin', title: 'System Admin', desc: 'Full control & rules' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as UserRole)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      role === item.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold capitalize">{item.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full mt-3 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in with credentials or quick roles
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
