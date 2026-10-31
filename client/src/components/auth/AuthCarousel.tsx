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
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
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
    dashedLine: string
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
    dashedLine: 'border-blue-400/50',
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
    dashedLine: 'border-zinc-500/50',
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
    dashedLine: 'border-emerald-400/50',
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
    dashedLine: 'border-purple-400/50',
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
    dashedLine: 'border-cyan-400/50',
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
    dashedLine: 'border-amber-400/50',
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
    dashedLine: 'border-rose-400/50',
  },
}

// ─── Standardized Card Definitions (Exact 280x160px with Solid Background) ───
export interface CarouselCardItem {
  id: string
  render: () => React.ReactNode
}

export const CARDS_DATA: CarouselCardItem[] = [
  {
    id: 'mrr-card',
    render: () => (
      <div className="w-[280px] h-[160px] p-3.5 rounded-2xl bg-slate-900 border border-white/15 shadow-xl shadow-black/40 text-white flex flex-col justify-between shrink-0 relative z-10 box-border">
        <div className="flex items-center justify-between">
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

        <div>
          <div className="text-xl font-black tracking-tight text-white">$18,450</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Annualized ARR: $221,400</div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/10">
          <span>Active Contracts</span>
          <span className="text-emerald-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> 100% Retained
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'tax-invoice-card',
    render: () => (
      <div className="w-[280px] h-[160px] p-3.5 rounded-2xl bg-slate-900 border border-white/15 shadow-xl shadow-black/40 text-white flex flex-col justify-between shrink-0 relative z-10 box-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Automated Tax Invoice</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
            INV-2026-1042
          </span>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-xs space-y-0.5 font-mono">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Base Subtotal:</span>
            <span>$1,060.00</span>
          </div>
          <div className="flex justify-between text-[11px] text-indigo-300">
            <span>GST Statutory (18%):</span>
            <span>+$190.80</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" /> Billed Net 15
          </span>
          <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
            Settled $1,250.80
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'plan-seats-card',
    render: () => (
      <div className="w-[280px] h-[160px] p-3.5 rounded-2xl bg-slate-900 border border-white/15 shadow-xl shadow-black/40 text-white flex flex-col justify-between shrink-0 relative z-10 box-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Growth Pro Plan</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-500/25 text-purple-200 border border-purple-400/30">
            Monthly
          </span>
        </div>

        <div>
          <div className="text-xl font-black text-white">$450 <span className="text-xs font-normal text-slate-400">/ seat</span></div>
          <p className="text-[11px] text-slate-400 mt-0.5">Enterprise Cloud Engine + Odoo Sync</p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/10">
          <span>5 User Licenses</span>
          <span className="text-purple-300 font-medium">Auto-Renew Active</span>
        </div>
      </div>
    ),
  },
  {
    id: 'volume-tier-card',
    render: () => (
      <div className="w-[280px] h-[160px] p-3.5 rounded-2xl bg-slate-900 border border-white/15 shadow-xl shadow-black/40 text-white flex flex-col justify-between shrink-0 relative z-10 box-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Volume Voucher</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-400/30">
            15% OFF
          </span>
        </div>

        <div>
          <span className="font-mono text-amber-300 font-bold text-xs">SEATS10PLUS</span>
          <p className="text-[11px] text-slate-300 mt-0.5">Volume coupon applied to invoice</p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/10">
          <span>Min 3 Seats Required</span>
          <span className="text-amber-300 font-mono font-medium">Auto-Applied</span>
        </div>
      </div>
    ),
  },
  {
    id: 'settlement-ledger-card',
    render: () => (
      <div className="w-[280px] h-[160px] p-3.5 rounded-2xl bg-slate-900 border border-white/15 shadow-xl shadow-black/40 text-white flex flex-col justify-between shrink-0 relative z-10 box-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Bank Settlement</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/25 text-sky-200 border border-sky-400/30">
            PAY-2026-089
          </span>
        </div>

        <div>
          <div className="text-xl font-black text-emerald-400">+$5,310.00</div>
          <p className="text-[11px] text-slate-300 mt-0.5">Kavala Nordic Tech • Wire Transfer</p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/10">
          <span>Bank Ledger Match</span>
          <span className="text-emerald-300 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Reconciled 100%
          </span>
        </div>
      </div>
    ),
  },
]

// ─── Main AuthCarousel Component ──────────────────────────────────────────────
export const AuthCarousel: React.FC = () => {
  const { theme, currentConfig } = useTheme()
  const ts = themeStyles[theme] || themeStyles.white

  return (
    <div
      className={`relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden ${ts.containerBg} text-white select-none transition-all duration-500`}
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
          <span>Infinite Stream</span>
        </div>
      </div>

      {/* ── Slanted Dropping Stream Viewport Window ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden">
        {/*
          SPEC COMPLIANT WRAPPER:
          - ENTIRE column (cards + connecting line) is wrapped in ONE container with transform: rotate(-8deg).
          - Rotate the wrapper, NOT individual cards.
          - Fixed height with overflow: hidden so cards appear to fall through a window.
        */}
        <div
          className="relative w-[340px] h-[640px] sm:h-[720px] overflow-hidden flex justify-center [transform:rotate(-8deg)]"
          style={{ willChange: 'transform' }}
        >
          {/*
            SPEC COMPLIANT MOVING INNER TRACK:
            - Single inner track containing the card list DUPLICATED twice.
            - Animated with keyframes from translateY(-50%) to translateY(0).
            - Linear, infinite, no pausing.
          */}
          <div className="relative flex flex-col items-center animate-infinite-column">
            {/*
              SPEC COMPLIANT CONNECTING LINE:
              - Dashed vertical line runs through the center of the cards.
              - Lives INSIDE the moving track (scrolls together with cards).
              - z-index: 0 (behind cards).
              - Cards have solid bg (bg-slate-900) so line is only visible in the 40px gaps.
            */}
            <div
              className={`absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0 border-l-2 border-dashed ${ts.dashedLine} pointer-events-none`}
              style={{ height: '100%', zIndex: 0 }}
            />

            {/* List 1 (Original Card Stack) */}
            <div className="flex flex-col gap-[40px] pb-[40px]">
              {CARDS_DATA.map((card, idx) => (
                <div key={`col-copy1-${card.id}-${idx}`}>
                  {card.render()}
                </div>
              ))}
            </div>

            {/* List 2 (Identical Duplicate Card Stack for seamless translateY(-50%) to 0 loop) */}
            <div className="flex flex-col gap-[40px] pb-[40px]">
              {CARDS_DATA.map((card, idx) => (
                <div key={`col-copy2-${card.id}-${idx}`}>
                  {card.render()}
                </div>
              ))}
            </div>
          </div>

          {/* Top Fade Gradient Mask for smooth window clipping */}
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${ts.fadeTop} z-20`}
          />

          {/* Bottom Fade Gradient Mask for smooth window clipping */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t ${ts.fadeBottom} z-20`}
          />
        </div>
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
          <Activity className="w-2.5 h-2.5 text-emerald-400" />
          <span>Continuous Waterfall</span>
        </div>
      </div>
    </div>
  )
}
