import React from 'react'
import { useTheme, type ThemeId } from '@/context/ThemeContext'
import {
  TrendingUp,
  FileText,
  Layers,
  Tag,
  CreditCard,
  Zap,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Clock,
  RefreshCw,
} from 'lucide-react'

// ─── Theme visual tokens ──────────────────────────────────────────────────────
const themeStyles: Record<
  ThemeId,
  {
    containerBg: string
    outerBorder: string
    glow1: string
    glow2: string
    accent: string
    accentBadge: string
    cardBorderHover: string
    fadeTop: string
    fadeBottom: string
  }
> = {
  white: {
    containerBg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900',
    outerBorder: 'border-blue-700/40',
    glow1: 'bg-blue-500/25',
    glow2: 'bg-indigo-500/20',
    accent: 'text-blue-300',
    accentBadge: 'bg-blue-500/20 border-blue-400/30 text-blue-300',
    cardBorderHover: 'hover:border-blue-400/50',
    fadeTop: 'from-slate-900 via-slate-900/90 to-transparent',
    fadeBottom: 'from-slate-900 via-slate-900/90 to-transparent',
  },
  black: {
    containerBg: 'bg-gradient-to-br from-zinc-950 via-black to-zinc-900',
    outerBorder: 'border-zinc-700/50',
    glow1: 'bg-zinc-500/20',
    glow2: 'bg-white/10',
    accent: 'text-zinc-200',
    accentBadge: 'bg-zinc-700/40 border-zinc-500/30 text-zinc-200',
    cardBorderHover: 'hover:border-zinc-400/50',
    fadeTop: 'from-black via-black/90 to-transparent',
    fadeBottom: 'from-black via-black/90 to-transparent',
  },
  emerald: {
    containerBg: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950',
    outerBorder: 'border-emerald-700/40',
    glow1: 'bg-emerald-500/25',
    glow2: 'bg-teal-500/20',
    accent: 'text-emerald-300',
    accentBadge: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300',
    cardBorderHover: 'hover:border-emerald-400/50',
    fadeTop: 'from-emerald-950 via-emerald-950/90 to-transparent',
    fadeBottom: 'from-emerald-950 via-emerald-950/90 to-transparent',
  },
  violet: {
    containerBg: 'bg-gradient-to-br from-purple-950 via-violet-950 to-slate-950',
    outerBorder: 'border-purple-700/40',
    glow1: 'bg-purple-500/25',
    glow2: 'bg-violet-500/20',
    accent: 'text-purple-300',
    accentBadge: 'bg-purple-500/20 border-purple-400/30 text-purple-300',
    cardBorderHover: 'hover:border-purple-400/50',
    fadeTop: 'from-purple-950 via-purple-950/90 to-transparent',
    fadeBottom: 'from-purple-950 via-purple-950/90 to-transparent',
  },
  ocean: {
    containerBg: 'bg-gradient-to-br from-cyan-950 via-sky-950 to-slate-950',
    outerBorder: 'border-sky-700/40',
    glow1: 'bg-sky-500/25',
    glow2: 'bg-cyan-500/20',
    accent: 'text-sky-300',
    accentBadge: 'bg-sky-500/20 border-sky-400/30 text-sky-300',
    cardBorderHover: 'hover:border-sky-400/50',
    fadeTop: 'from-cyan-950 via-cyan-950/90 to-transparent',
    fadeBottom: 'from-cyan-950 via-cyan-950/90 to-transparent',
  },
  amber: {
    containerBg: 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950',
    outerBorder: 'border-amber-700/40',
    glow1: 'bg-amber-500/25',
    glow2: 'bg-orange-500/20',
    accent: 'text-amber-300',
    accentBadge: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
    cardBorderHover: 'hover:border-amber-400/50',
    fadeTop: 'from-amber-950 via-amber-950/90 to-transparent',
    fadeBottom: 'from-amber-950 via-amber-950/90 to-transparent',
  },
  rose: {
    containerBg: 'bg-gradient-to-br from-rose-950 via-pink-950 to-slate-950',
    outerBorder: 'border-rose-700/40',
    glow1: 'bg-rose-500/25',
    glow2: 'bg-pink-500/20',
    accent: 'text-rose-300',
    accentBadge: 'bg-rose-500/20 border-rose-400/30 text-rose-300',
    cardBorderHover: 'hover:border-rose-400/50',
    fadeTop: 'from-rose-950 via-rose-950/90 to-transparent',
    fadeBottom: 'from-rose-950 via-rose-950/90 to-transparent',
  },
}

// ─── Column 1 Cards (Rich Visual Screenshots / Modules) ───────────────────────
const COLUMN_1_CARDS = [
  {
    id: 'mrr-card',
    render: () => (
      <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl shadow-black/25 text-white transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Monthly MRR</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-0.5">
            <ArrowUpRight className="w-2.5 h-2.5" /> +18.4%
          </span>
        </div>
        <div className="mb-2">
          <span className="text-lg font-black tracking-tight text-white">$34,820</span>
          <span className="text-[10px] text-white/60 ml-1.5 font-medium">ARR $417.8k</span>
        </div>
        {/* Visual Sparkline Area Chart */}
        <div className="h-9 w-full overflow-hidden rounded-md bg-white/5 p-1 flex items-end">
          <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0 25 Q 15 22, 30 18 T 60 14 T 85 8 L 100 4 L 100 30 L 0 30 Z"
              fill="url(#mrrGrad)"
            />
            <path
              d="M0 25 Q 15 22, 30 18 T 60 14 T 85 8 L 100 4"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/60 pt-1.5 border-t border-white/10">
          <span>142 Active Contracts</span>
          <span className="text-emerald-300 font-semibold">0.0% Churn</span>
        </div>
      </div>
    ),
  },
  {
    id: 'tax-invoice-card',
    render: () => (
      <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl shadow-black/25 text-white transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Automated Tax (18%)</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
            INV-2026-009
          </span>
        </div>
        {/* Invoice Mini Breakdown */}
        <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-xs space-y-1 font-mono">
          <div className="flex justify-between text-[11px] text-white/80">
            <span>Enterprise Base:</span>
            <span>$1,200.00</span>
          </div>
          <div className="flex justify-between text-[11px] text-indigo-300">
            <span>Regional GST (18%):</span>
            <span>+$216.00</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-emerald-300 pt-1 border-t border-white/10">
            <span>Total Collected:</span>
            <span>$1,416.00</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/70">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" /> Daily Run: 00:00 UTC
          </span>
          <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
            PDF Dispatched
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'volume-tier-card',
    render: () => (
      <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl shadow-black/25 text-white transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Tiered Seat Rules</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-400/30">
            15% OFF
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-white/80 mb-1.5">
          <span className="font-mono text-amber-300 font-bold">SEATS10PLUS</span>
          <span className="text-[10px] text-white/60">Min 5 Seats Required</span>
        </div>
        {/* Progress Quota Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-white/70">
            <span>Quota Usage</span>
            <span className="font-bold text-amber-300 font-mono">24 / 50 claimed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
              style={{ width: '48%' }}
            />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/60 pt-1.5 border-t border-white/10">
          <span>Applies to Quotations</span>
          <span className="text-emerald-300 font-semibold">Auto-Applied</span>
        </div>
      </div>
    ),
  },
  {
    id: 'self-service-card',
    render: () => (
      <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl shadow-black/25 text-white transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Self-Service Addon</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
            Instant
          </span>
        </div>
        <div className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Odoo Connector Pack</p>
            <p className="text-[10px] text-white/60">+5 External Stores</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 font-mono">+$180/mo</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/60 pt-1 border-t border-white/10">
          <span className="flex items-center gap-1 text-cyan-300">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Auto-Prorated Billing
          </span>
          <span className="text-white/80 font-mono">Zero Tickets</span>
        </div>
      </div>
    ),
  },
]

// ─── Column 2 Cards (Rich Visual Screenshots / Modules) ───────────────────────
const COLUMN_2_CARDS = [
  {
    id: 'pipeline-card',
    render: () => (
      <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl shadow-black/25 text-white transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Lifecycle Pipeline</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/25 text-violet-200 border border-violet-400/30">
            SUB-9021
          </span>
        </div>
        {/* 3 Step Pipeline Graphic */}
        <div className="grid grid-cols-3 gap-1 text-center text-[10px] mb-2">
          <div className="py-1 rounded bg-white/10 text-white/60">1. Draft</div>
          <div className="py-1 rounded bg-white/10 text-white/60">2. Quoted</div>
          <div className="py-1 rounded bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/40 flex items-center justify-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> Active
          </div>
        </div>
        <div className="p-1.5 rounded bg-black/40 border border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/80 text-[11px]">Acme Global Corp</span>
          <span className="font-bold text-white font-mono">$4,200/mo</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/60 pt-1 border-t border-white/10">
          <span>Auto-Renew: On</span>
          <span className="text-emerald-300 font-semibold">15th Monthly</span>
        </div>
      </div>
    ),
  },
  {
    id: 'payment-rails-card',
    render: () => (
      <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl shadow-black/25 text-white transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Multi-Gateway Rails</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            99.8% Settle
          </span>
        </div>
        {/* Gateway Row Status */}
        <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] mb-2 font-mono">
          <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
            <span className="block text-white/60 text-[9px]">Stripe Webhook</span>
            <span className="text-emerald-400 font-bold">200 OK • 1.8s</span>
          </div>
          <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
            <span className="block text-white/60 text-[9px]">Razorpay Rail</span>
            <span className="text-sky-300 font-bold">Connected</span>
          </div>
        </div>
        <div className="p-1.5 rounded bg-white/5 border border-white/10 flex items-center justify-between text-[11px] font-mono">
          <span className="text-white/70">evt_charge.succeeded</span>
          <span className="text-emerald-300 font-bold">+$850.00</span>
        </div>
      </div>
    ),
  },
  {
    id: 'smart-dunning-card',
    render: () => (
      <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl shadow-black/25 text-white transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Smart Dunning & Retry</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 font-bold">
            Auto-Heal
          </span>
        </div>
        {/* Recovery Step Graphic */}
        <div className="space-y-1.5 text-[11px] text-white/80 p-2 rounded-lg bg-black/40 border border-white/10 font-mono">
          <div className="flex items-center justify-between text-white/60 text-[10px]">
            <span>Retry 1 (Card expired)</span>
            <span className="text-rose-400">Soft Fail</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Retry 2 (Backup Card)
            </span>
            <span>$920 Collected</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/60 pt-1 border-t border-white/10">
          <span>Grace Period: 3 Days</span>
          <span className="text-emerald-300 font-semibold">96.5% Saved</span>
        </div>
      </div>
    ),
  },
  {
    id: 'audit-stream-card',
    render: () => (
      <div className="p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-xl shadow-black/25 text-white transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Real-Time Audit Stream</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/25 text-teal-200 border border-teal-400/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            Live
          </span>
        </div>
        {/* Log Lines */}
        <div className="space-y-1 p-2 rounded-lg bg-black/50 border border-white/10 font-mono text-[10px]">
          <p className="text-emerald-400 truncate">00:00:01 • Cron: Billing cycle initiated</p>
          <p className="text-white/80 truncate">00:00:02 • 142 Invoices PDF generated</p>
          <p className="text-sky-300 truncate">00:00:03 • Webhooks pushed to Odoo ERP</p>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/60 pt-1 border-t border-white/10">
          <span>All Engines Operational</span>
          <span className="text-teal-300 font-mono font-bold">99.99% Up</span>
        </div>
      </div>
    ),
  },
]

// ─── Main AuthCarousel Component (Slanted Vertical Merry-Go-Round) ────────────
export const AuthCarousel: React.FC = () => {
  const { theme, currentConfig } = useTheme()
  const ts = themeStyles[theme] || themeStyles.white

  // Duplicate cards so the vertical dropping marquee loops seamlessly
  const col1Stream = [...COLUMN_1_CARDS, ...COLUMN_1_CARDS]
  const col2Stream = [...COLUMN_2_CARDS, ...COLUMN_2_CARDS]
  const col3Stream = [
    COLUMN_2_CARDS[2],
    COLUMN_1_CARDS[0],
    COLUMN_2_CARDS[1],
    COLUMN_1_CARDS[3],
    COLUMN_2_CARDS[2],
    COLUMN_1_CARDS[0],
    COLUMN_2_CARDS[1],
    COLUMN_1_CARDS[3],
  ]

  return (
    <div
      className={`group-merry-go-round relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden ${ts.containerBg} text-white select-none transition-all duration-500`}
    >
      {/* Dynamic Ambient Background Glow Blobs */}
      <div
        className={`absolute -top-24 -right-24 w-96 h-96 ${ts.glow1} rounded-full blur-3xl pointer-events-none transition-colors duration-500`}
      />
      <div
        className={`absolute -bottom-24 -left-24 w-96 h-96 ${ts.glow2} rounded-full blur-3xl pointer-events-none transition-colors duration-500`}
      />

      {/* ── Top Floating Header Bar ── */}
      <div className="relative z-30 flex items-center justify-between p-8 pb-2 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-tight font-bold">Brightloop OS</span>
          <span className="text-white/40">•</span>
          <span className={`text-[10px] font-mono ${ts.accent}`}>{currentConfig.name}</span>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white/80 shadow-xl">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Live Merry-Go-Round</span>
        </div>
      </div>

      {/* ── Slanted Dropping Stream Viewport ── */}
      <div className="relative z-10 flex-1 overflow-hidden flex items-center justify-center">
        {/* Slanted Rotated Wrapper: Tilted at -12deg so cards drop along a slanted diagonal path */}
        <div className="absolute -inset-x-28 -inset-y-56 flex justify-center gap-5 [transform:rotate(-12deg)]">
          {/* Column 1: Drops continuously from top to bottom (speed: 32s) */}
          <div className="w-[250px] sm:w-[260px] xl:w-[280px] flex-shrink-0 flex flex-col gap-4 animate-drop-continuous-slow">
            {col1Stream.map((card, idx) => (
              <div key={`col1-${card.id}-${idx}`} className="flex-shrink-0">
                {card.render()}
              </div>
            ))}
          </div>

          {/* Column 2: Drops continuously from top to bottom (speed: 24s) */}
          <div className="w-[250px] sm:w-[260px] xl:w-[280px] flex-shrink-0 flex flex-col gap-4 animate-drop-continuous-fast">
            {col2Stream.map((card, idx) => (
              <div key={`col2-${card.id}-${idx}`} className="flex-shrink-0">
                {card.render()}
              </div>
            ))}
          </div>

          {/* Column 3: Drops continuously from top to bottom (speed: 28s) */}
          <div className="w-[250px] sm:w-[260px] xl:w-[280px] flex-shrink-0 hidden xl:flex flex-col gap-4 animate-drop-continuous-mid">
            {col3Stream.map((card, idx) => (
              <div key={`col3-${card.id}-${idx}`} className="flex-shrink-0">
                {card.render()}
              </div>
            ))}
          </div>
        </div>

        {/* Top Fade Gradient Mask */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${ts.fadeTop} z-20`}
        />

        {/* Bottom Fade Gradient Mask */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t ${ts.fadeBottom} z-20`}
        />
      </div>

      {/* ── Bottom Floating Feature Footer Bar ── */}
      <div className="relative z-30 p-6 pt-2 flex items-center justify-between pointer-events-none">
        <div className="px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/20 text-white text-xs shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-white/90">Automated Billing</span>
          </div>
          <span className="text-white/30">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-white/90">Regional Tax</span>
          </div>
        </div>

        <div className="text-[10px] text-white/70 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/15 shadow-lg flex items-center gap-1.5">
          <RefreshCw className="w-2.5 h-2.5 text-cyan-300 animate-spin" />
          <span>Hover to pause</span>
        </div>
      </div>
    </div>
  )
}
