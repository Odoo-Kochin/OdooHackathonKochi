import React, { useState, useEffect } from 'react'
import {
  Repeat,
  Layers,
  Tag,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  Calendar,
  Users,
} from 'lucide-react'

interface SlideItem {
  id: string
  badge: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  renderWidget: () => React.ReactNode
}

export const AuthCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const slides: SlideItem[] = [
    {
      id: 'billing',
      badge: 'Automated Billing Engine',
      title: 'Precision Invoicing & Automated Tax',
      description:
        'Evaluates recurring schedules across daily, weekly, monthly, and yearly cadences with instant 18% tax calculations and PDF generation.',
      icon: Repeat,
      renderWidget: () => (
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Automated Tax Engine</p>
                <p className="text-[10px] text-emerald-300 font-mono">18% Regional Compliance</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
              Active
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/20 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-white font-mono text-[11px]">INV-2026-0042</span>
            </div>
            <span className="font-bold text-emerald-300">$1,420.00 PAID</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/70 pt-1 border-t border-white/10">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Next Run: Automated Daily 00:00 UTC
            </span>
            <span className="text-emerald-300 font-semibold">100% On-Time</span>
          </div>
        </div>
      ),
    },
    {
      id: 'pipeline',
      badge: 'Contract Lifecycle',
      title: 'Quotation to Subscription Pipeline',
      description:
        'Transform prospect quotes into recurring revenue contracts. Progress through Draft, Quotation, and Confirmed with auto-renew triggers.',
      icon: Layers,
      renderWidget: () => (
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-300" />
              <span className="text-xs font-bold text-white">Acme Global Enterprise</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              SUB-9021
            </span>
          </div>

          {/* Stepper Pipeline */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="p-1.5 rounded bg-white/10 text-white/60">1. Draft</div>
            <div className="p-1.5 rounded bg-white/10 text-white/60">2. Quote Sent</div>
            <div className="p-1.5 rounded bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/40 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 3. Confirmed
            </div>
          </div>

          <div className="p-2 rounded bg-black/20 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/80">Odoo Edition Sync + Brand Connector</span>
            <span className="font-bold text-white">$4,200/mo</span>
          </div>
        </div>
      ),
    },
    {
      id: 'discounts',
      badge: 'Smart Volume Rules',
      title: 'Dynamic Seat Tiers & Promotion Vouchers',
      description:
        'Reward enterprise customers with automated thresholds for seat quantity, order spend minimums, and usage limit quotas.',
      icon: Tag,
      renderWidget: () => (
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg space-y-3">
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
                <Users className="w-3 h-3 text-white/60" /> Min Seats:
              </span>
              <span className="font-semibold text-white">5+ Seats Required</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-white/60" /> Min Spend:
              </span>
              <span className="font-semibold text-white">$500.00</span>
            </div>
          </div>

          {/* Usage Meter */}
          <div>
            <div className="flex justify-between text-[10px] text-white/70 mb-1">
              <span>Quota Used</span>
              <span className="font-bold text-amber-300">24 / 50 claims</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[48%]" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'analytics',
      badge: 'Financial Intelligence',
      title: 'Real-Time MRR, ARR & Revenue Insights',
      description:
        'Comprehensive live intelligence on recurring revenue growth, aging invoices, settlement methods, and self-service customer addon upgrades.',
      icon: TrendingUp,
      renderWidget: () => (
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg space-y-3">
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
              <span className="text-[10px] text-white/60 block font-medium">Monthly Recurring (MRR)</span>
              <span className="text-base font-bold text-white">$28,450</span>
              <span className="text-[10px] text-emerald-300 block font-semibold mt-0.5">+14.8% growth</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
              <span className="text-[10px] text-white/60 block font-medium">Annual Run Rate (ARR)</span>
              <span className="text-base font-bold text-white">$341,400</span>
              <span className="text-[10px] text-emerald-300 block font-semibold mt-0.5">0.0% Churn</span>
            </div>
          </div>

          <div className="p-2 rounded bg-white/10 border border-white/10 flex items-center justify-between text-xs text-white">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Customer Self-Service Add-Ons
            </span>
            <span className="font-bold text-emerald-300">+$530/mo</span>
          </div>
        </div>
      ),
    },
  ]

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isPaused, slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const activeItem = slides[currentSlide]
  const IconComponent = activeItem.icon

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative h-full flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl shadow-2xl border border-indigo-800/40 select-none"
    >
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold shadow-md">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white">Brightloop OS</h3>
            <p className="text-[10px] text-indigo-200">Subscription & Revenue Engine</p>
          </div>
        </div>

        {/* Slide Counter */}
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/80">
          0{currentSlide + 1} / 0{slides.length}
        </span>
      </div>

      {/* Middle Animated Content Area */}
      <div className="relative z-10 my-8 space-y-6">
        {/* Animated Badge & Title */}
        <div className="space-y-2 transition-all duration-300">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
            <IconComponent className="w-3.5 h-3.5 text-indigo-300" />
            <span>{activeItem.badge}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            {activeItem.title}
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed max-w-md">
            {activeItem.description}
          </p>
        </div>

        {/* Visual Dynamic Widget Preview */}
        <div className="transition-all duration-500 transform animate-in fade-in slide-in-from-right-4">
          {activeItem.renderWidget()}
        </div>
      </div>

      {/* Bottom Navigation & Indicator Controls */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
        {/* Interactive Indicator Pills */}
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                idx === currentSlide ? 'w-8 bg-indigo-400' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              title={`Go to slide ${idx + 1}: ${s.badge}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Previous / Next Chevron Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevSlide}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
