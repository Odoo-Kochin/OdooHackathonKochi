import React, { useState, useEffect } from 'react'
import { useTheme, type ThemeId } from '@/context/ThemeContext'
import {
  Repeat,
  Layers,
  Tag,
  TrendingUp,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileText,
  Calendar,
  Users,
  Sparkles,
  BarChart3,
  CreditCard,
} from 'lucide-react'

// ─── Theme palette map ────────────────────────────────────────────────────────
const themeStyles: Record<
  ThemeId,
  {
    containerBg: string
    outerBorder: string
    glow1: string
    glow2: string
    accent: string
    badgeBg: string
    badgeBorder: string
    pillActive: string
    cardBg: string
    cardBorder: string
    subtitleText: string
  }
> = {
  white: {
    containerBg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900',
    outerBorder: 'border-blue-700/40',
    glow1: 'bg-blue-500/25',
    glow2: 'bg-indigo-500/20',
    accent: 'text-blue-300',
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-400/30',
    pillActive: 'bg-blue-400',
    cardBg: 'bg-white/10',
    cardBorder: 'border-white/20',
    subtitleText: 'text-slate-200/90',
  },
  black: {
    containerBg: 'bg-gradient-to-br from-zinc-950 via-black to-zinc-900',
    outerBorder: 'border-zinc-700/50',
    glow1: 'bg-zinc-500/20',
    glow2: 'bg-white/10',
    accent: 'text-zinc-200',
    badgeBg: 'bg-zinc-700/40',
    badgeBorder: 'border-zinc-500/30',
    pillActive: 'bg-zinc-300',
    cardBg: 'bg-white/5',
    cardBorder: 'border-white/10',
    subtitleText: 'text-zinc-300',
  },
  emerald: {
    containerBg: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950',
    outerBorder: 'border-emerald-700/40',
    glow1: 'bg-emerald-500/25',
    glow2: 'bg-teal-500/20',
    accent: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-400/30',
    pillActive: 'bg-emerald-400',
    cardBg: 'bg-white/10',
    cardBorder: 'border-emerald-400/20',
    subtitleText: 'text-emerald-100/80',
  },
  violet: {
    containerBg: 'bg-gradient-to-br from-purple-950 via-violet-950 to-slate-950',
    outerBorder: 'border-purple-700/40',
    glow1: 'bg-purple-500/25',
    glow2: 'bg-violet-500/20',
    accent: 'text-purple-300',
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-400/30',
    pillActive: 'bg-purple-400',
    cardBg: 'bg-white/10',
    cardBorder: 'border-purple-400/20',
    subtitleText: 'text-purple-100/80',
  },
  ocean: {
    containerBg: 'bg-gradient-to-br from-cyan-950 via-sky-950 to-slate-950',
    outerBorder: 'border-sky-700/40',
    glow1: 'bg-sky-500/25',
    glow2: 'bg-cyan-500/20',
    accent: 'text-sky-300',
    badgeBg: 'bg-sky-500/20',
    badgeBorder: 'border-sky-400/30',
    pillActive: 'bg-sky-400',
    cardBg: 'bg-white/10',
    cardBorder: 'border-sky-400/20',
    subtitleText: 'text-sky-100/80',
  },
  amber: {
    containerBg: 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950',
    outerBorder: 'border-amber-700/40',
    glow1: 'bg-amber-500/25',
    glow2: 'bg-orange-500/20',
    accent: 'text-amber-300',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-400/30',
    pillActive: 'bg-amber-400',
    cardBg: 'bg-white/10',
    cardBorder: 'border-amber-400/20',
    subtitleText: 'text-amber-100/80',
  },
  rose: {
    containerBg: 'bg-gradient-to-br from-rose-950 via-pink-950 to-slate-950',
    outerBorder: 'border-rose-700/40',
    glow1: 'bg-rose-500/25',
    glow2: 'bg-pink-500/20',
    accent: 'text-rose-300',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-400/30',
    pillActive: 'bg-rose-400',
    cardBg: 'bg-white/10',
    cardBorder: 'border-rose-400/20',
    subtitleText: 'text-rose-100/80',
  },
}

// ─── Slide definitions ────────────────────────────────────────────────────────
interface SlideItem {
  id: string
  badge: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  accentColor: string
  widget: React.ReactNode
}

const SLIDES: SlideItem[] = [
  {
    id: 'billing',
    badge: 'Automated Billing Engine',
    title: 'Precision Invoicing & Auto Tax',
    description:
      'Evaluates recurring schedules with instant 18% tax calculation and one-click PDF export.',
    icon: Repeat,
    accentColor: 'text-emerald-400',
    widget: (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Tax Engine Active</p>
              <p className="text-[10px] text-emerald-300 font-mono">18% Regional Compliance</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
            Live
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-indigo-300" />
            <span className="text-white font-mono text-[11px]">INV-2026-0042</span>
          </div>
          <span className="font-bold text-emerald-300">$1,420 PAID</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-white/60 border-t border-white/10 pt-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Daily 00:00 UTC
          </span>
          <span className="text-emerald-300 font-semibold">100% On-Time</span>
        </div>
      </div>
    ),
  },
  {
    id: 'pipeline',
    badge: 'Contract Lifecycle',
    title: 'Quote → Subscription Pipeline',
    description:
      'Transform prospect quotes into recurring revenue. Progress through Draft, Quotation, and Confirmed with auto-renew.',
    icon: Layers,
    accentColor: 'text-indigo-300',
    widget: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-300" />
          <span className="text-xs font-bold text-white">Acme Global Enterprise</span>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
            SUB-9021
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div className="p-1.5 rounded bg-white/10 text-white/60">1. Draft</div>
          <div className="p-1.5 rounded bg-white/10 text-white/60">2. Quoted</div>
          <div className="p-1.5 rounded bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/40 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Done
          </div>
        </div>
        <div className="p-2 rounded bg-black/30 border border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/80">Odoo Edition Sync</span>
          <span className="font-bold text-white">$4,200/mo</span>
        </div>
      </div>
    ),
  },
  {
    id: 'discounts',
    badge: 'Smart Volume Rules',
    title: 'Dynamic Seat Tiers & Vouchers',
    description:
      'Reward enterprise customers with automated seat thresholds, spend minimums, and usage quota limits.',
    icon: Tag,
    accentColor: 'text-amber-300',
    widget: (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> SEATS10PLUS
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
            15% OFF
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-white/80">
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-white/50" /> Min Seats:
            </span>
            <span className="font-semibold text-white">5+ Required</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-white/50" /> Min Spend:
            </span>
            <span className="font-semibold text-white">$500.00</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-white/60 mb-1">
            <span>Quota Used</span>
            <span className="font-bold text-amber-300">24 / 50 claims</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: '48%' }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'analytics',
    badge: 'Financial Intelligence',
    title: 'Real-Time MRR, ARR & Insights',
    description:
      'Live intelligence on recurring revenue growth, aging invoices, settlement methods, and customer self-service upgrades.',
    icon: BarChart3,
    accentColor: 'text-sky-300',
    widget: (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/10">
            <span className="text-[10px] text-white/60 block">Monthly MRR</span>
            <span className="text-base font-bold text-white">$28,450</span>
            <span className="text-[10px] text-emerald-300 block font-semibold mt-0.5">
              +14.8% growth
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/10">
            <span className="text-[10px] text-white/60 block">Annual ARR</span>
            <span className="text-base font-bold text-white">$341,400</span>
            <span className="text-[10px] text-emerald-300 block font-semibold mt-0.5">
              0.0% Churn
            </span>
          </div>
        </div>
        <div className="p-2 rounded bg-white/10 border border-white/10 flex items-center justify-between text-xs text-white">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Self-Service Add-Ons
          </span>
          <span className="font-bold text-emerald-300">+$530/mo</span>
        </div>
      </div>
    ),
  },
  {
    id: 'payments',
    badge: 'Multi-Gateway Payments',
    title: 'Stripe, Razorpay & Custom Rails',
    description:
      'Accept payments via any gateway. Automatic retries on failure, dunning emails, and instant webhook reconciliation.',
    icon: CreditCard,
    accentColor: 'text-violet-300',
    widget: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/10">
          <CreditCard className="w-4 h-4 text-violet-300" />
          <div>
            <p className="text-xs font-bold text-white">Stripe Webhook</p>
            <p className="text-[10px] text-white/60 font-mono">invoice.payment_succeeded</p>
          </div>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
            OK
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-center">
          <div className="p-2 rounded bg-white/10 text-white/80">
            <span className="block font-bold text-white text-sm">99.8%</span>Capture Rate
          </div>
          <div className="p-2 rounded bg-white/10 text-white/80">
            <span className="block font-bold text-emerald-300 text-sm">2.1s</span>Avg Settle
          </div>
        </div>
      </div>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export const AuthCarousel: React.FC = () => {
  const { theme, currentConfig } = useTheme()
  const ts = themeStyles[theme] || themeStyles.white

  const [activeIdx, setActiveIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Duplicate slides for seamless infinite loop feel
  const total = SLIDES.length

  // Auto-advance every 4s
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      advance()
    }, 4000)
    return () => clearInterval(timer)
  }, [isPaused, activeIdx])

  const advance = () => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % total)
      setAnimating(false)
    }, 450)
  }

  const goTo = (idx: number) => {
    if (idx === activeIdx || animating) return
    setAnimating(true)
    setTimeout(() => {
      setActiveIdx(idx)
      setAnimating(false)
    }, 450)
  }

  const prev = activeIdx === 0 ? SLIDES[total - 1] : SLIDES[activeIdx - 1]
  const current = SLIDES[activeIdx]
  const next = SLIDES[(activeIdx + 1) % total]
  const CurrentIcon = current.icon

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative h-full flex flex-col overflow-hidden ${ts.containerBg} text-white rounded-2xl shadow-2xl border ${ts.outerBorder} select-none transition-all duration-500`}
    >
      {/* Glow blobs */}
      <div
        className={`absolute top-0 right-0 w-72 h-72 ${ts.glow1} rounded-full blur-3xl pointer-events-none transition-colors duration-500`}
      />
      <div
        className={`absolute bottom-0 left-0 w-72 h-72 ${ts.glow2} rounded-full blur-3xl pointer-events-none transition-colors duration-500`}
      />

      {/* ── Header bar ── */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md">
            <Sparkles className={`w-4 h-4 ${ts.accent}`} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white">Brightloop OS</h3>
            <p className={`text-[10px] ${ts.accent}`}>{currentConfig.name} • Subscription Engine</p>
          </div>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/80">
          0{activeIdx + 1} / 0{total}
        </span>
      </div>

      {/* ── Vertical merry-go-round strip ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 overflow-hidden">
        {/* Ghost row above (prev slide) */}
        <div
          className={`transition-all duration-500 ease-in-out pointer-events-none ${
            animating ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-20 scale-90'
          } mb-4`}
          aria-hidden="true"
        >
          <p className="text-xs font-semibold text-white/50 truncate">{prev.badge}</p>
          <p className="text-sm font-bold text-white/40 truncate">{prev.title}</p>
        </div>

        {/* Active centre card */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            animating ? '-translate-y-8 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
          } space-y-4`}
        >
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${ts.badgeBg} border ${ts.badgeBorder} ${ts.accent} text-xs font-semibold backdrop-blur-sm`}
          >
            <CurrentIcon className={`w-3.5 h-3.5 ${ts.accent}`} />
            <span>{current.badge}</span>
          </div>

          {/* Title + description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight mb-2">
              {current.title}
            </h2>
            <p className={`text-xs sm:text-sm ${ts.subtitleText} leading-relaxed`}>
              {current.description}
            </p>
          </div>

          {/* Widget preview card */}
          <div
            className={`p-4 rounded-xl ${ts.cardBg} backdrop-blur-md border ${ts.cardBorder} shadow-lg`}
          >
            {current.widget}
          </div>
        </div>

        {/* Ghost row below (next slide) */}
        <div
          className={`transition-all duration-500 ease-in-out pointer-events-none ${
            animating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-20 scale-90'
          } mt-4`}
          aria-hidden="true"
        >
          <p className="text-xs font-semibold text-white/50 truncate">{next.badge}</p>
          <p className="text-sm font-bold text-white/40 truncate">{next.title}</p>
        </div>
      </div>

      {/* ── Bottom navigator ── */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-t border-white/10">
        {/* Vertical dot pills */}
        <div className="flex flex-col items-center gap-1.5">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}: ${s.badge}`}
              className={`rounded-full transition-all duration-300 focus:outline-none ${
                idx === activeIdx
                  ? `h-6 w-1.5 ${ts.pillActive}`
                  : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Slide title teaser */}
        <div className="text-right flex-1 pl-6">
          <p className={`text-[10px] font-semibold uppercase tracking-widest ${ts.accent} mb-0.5`}>
            Up next
          </p>
          <p className="text-xs font-bold text-white/70 truncate">{next.title}</p>
        </div>
      </div>
    </div>
  )
}
