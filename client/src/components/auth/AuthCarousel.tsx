import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import {
  TrendingUp,
  FileText,
  Layers,
  Tag,
  CreditCard,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export const AuthCarousel: React.FC = React.memo(() => {
  const { currentConfig } = useTheme()
  const isDark = currentConfig.isDark

  // Card items matching the 280x160px spec, dynamically styled for light/dark themes
  const cards = [
    {
      id: 'mrr-card',
      title: 'Monthly MRR',
      badge: '+18.4%',
      badgeColor: isDark
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
      metric: '$18,450',
      subtext: 'Annualized ARR: $221,400',
      footerLeft: 'Active Contracts',
      footerRight: (
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" /> 100% Retained
        </span>
      ),
    },
    {
      id: 'tax-invoice-card',
      title: 'Automated Tax Invoice',
      badge: 'INV-2026-1042',
      badgeColor: isDark
        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <FileText className="w-3.5 h-3.5 text-indigo-500" />,
      contentBox: (
        <div
          className={`p-2 rounded-lg text-xs space-y-0.5 font-mono ${isDark
              ? 'bg-black/30 border border-white/10 text-slate-300'
              : 'bg-slate-50 border border-slate-200/80 text-slate-700'
            }`}
        >
          <div className="flex justify-between text-[11px]">
            <span>Base Subtotal:</span>
            <span>$1,060.00</span>
          </div>
          <div className="flex justify-between text-[11px] text-indigo-500 font-medium">
            <span>GST Statutory (18%):</span>
            <span>+$190.80</span>
          </div>
        </div>
      ),
      footerLeft: (
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-500" /> Net 15
        </span>
      ),
      footerRight: (
        <span
          className={`font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
            }`}
        >
          Settled $1,250.80
        </span>
      ),
    },
    {
      id: 'plan-seats-card',
      title: 'Growth Pro Plan',
      badge: 'Monthly',
      badgeColor: isDark
        ? 'bg-purple-500/20 text-purple-200 border-purple-400/30'
        : 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <Layers className="w-3.5 h-3.5 text-purple-500" />,
      metric: '$450',
      metricUnit: '/ seat',
      subtext: 'Enterprise Cloud Engine + Odoo Sync',
      footerLeft: '5 User Licenses',
      footerRight: <span className="text-purple-500 font-medium">Auto-Renew Active</span>,
    },
    {
      id: 'volume-tier-card',
      title: 'Volume Voucher',
      badge: '15% OFF',
      badgeColor: isDark
        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
        : 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <Tag className="w-3.5 h-3.5 text-amber-500" />,
      metric: 'SEATS10PLUS',
      subtext: 'Volume coupon applied automatically',
      footerLeft: 'Min 3 Seats Required',
      footerRight: <span className="text-amber-500 font-mono font-medium">Auto-Applied</span>,
    },
    {
      id: 'settlement-ledger-card',
      title: 'Bank Settlement',
      badge: 'PAY-2026-089',
      badgeColor: isDark
        ? 'bg-sky-500/20 text-sky-200 border-sky-400/30'
        : 'bg-sky-50 text-sky-700 border-sky-200',
      icon: <CreditCard className="w-3.5 h-3.5 text-sky-500" />,
      metric: '+$5,310.00',
      metricClass: 'text-emerald-500',
      subtext: 'Kavala Nordic Tech • Swift Wire',
      footerLeft: 'Bank Ledger Match',
      footerRight: (
        <span className="text-emerald-500 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" /> Reconciled 100%
        </span>
      ),
    },
  ]

  // Dynamic theme-derived colors for borders, cards, and dashed line
  const cardBg = isDark ? currentConfig.surfaceColor : '#ffffff'
  const cardBorder = isDark ? 'border-white/15' : 'border-slate-200/90'
  const cardShadow = isDark ? 'shadow-xl shadow-black/50' : 'shadow-xl shadow-slate-300/40'
  const dashedLineColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.35)'

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: currentConfig.bgColor }}
    >
      {/*
        SPEC COMPLIANT WRAPPER:
        - One centered column of cards stacked vertically with a fixed gap (40px).
        - The ENTIRE column (cards + connecting line) is wrapped in ONE container with transform: rotate(-8deg).
        - Rotate the wrapper, NOT individual cards.
        - Fixed height with overflow: hidden so cards appear to fall through a window.
      */}
      <div
        className="relative w-[320px] h-[640px] sm:h-[720px] overflow-hidden flex justify-center [transform:rotate(-8deg)]"
        style={{ willChange: 'transform' }}
      >
        {/*
          SPEC COMPLIANT MOVING INNER TRACK:
          - Single inner track containing the card list DUPLICATED twice.
          - Animated with CSS keyframes from translateY(-50%) to translateY(0) (continuous TOP to BOTTOM).
          - No pausing, no easing: linear, infinite.
        */}
        <div className="relative flex flex-col items-center animate-infinite-column">
          {/*
            SPEC COMPLIANT CONNECTING LINE:
            - Dashed vertical line runs through the center of the cards.
            - Lives INSIDE the moving track (scrolls together with cards).
            - z-index: 0 (behind cards).
            - Cards have solid background so line is only visible in the 40px gaps.
          */}
          <div
            className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0 pointer-events-none"
            style={{
              height: '100%',
              zIndex: 0,
              borderLeft: `2px dashed ${dashedLineColor}`,
            }}
          />

          {/* List 1: Original Card Stack with 40px gap and 40px bottom padding */}
          <div className="flex flex-col gap-[40px] pb-[40px]">
            {cards.map((card, idx) => (
              <div
                key={`col1-${card.id}-${idx}`}
                className={`relative z-10 w-[280px] h-[160px] p-3.5 rounded-2xl ${cardBorder} ${cardShadow} flex flex-col justify-between shrink-0 box-border`}
                style={{ backgroundColor: cardBg }}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`p-1.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-slate-100'
                        }`}
                    >
                      {card.icon}
                    </div>
                    <span
                      className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                      {card.title}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Body */}
                {card.contentBox ? (
                  card.contentBox
                ) : (
                  <div>
                    <div
                      className={`text-xl font-black tracking-tight ${card.metricClass
                          ? card.metricClass
                          : isDark
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                    >
                      {card.metric}{' '}
                      {card.metricUnit && (
                        <span
                          className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                        >
                          {card.metricUnit}
                        </span>
                      )}
                    </div>
                    {card.subtext && (
                      <p
                        className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                      >
                        {card.subtext}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div
                  className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${isDark
                      ? 'text-slate-400 border-white/10'
                      : 'text-slate-500 border-slate-100'
                    }`}
                >
                  <span>{card.footerLeft}</span>
                  {card.footerRight}
                </div>
              </div>
            ))}
          </div>

          {/* List 2: Duplicate Card Stack for mathematically seamless translateY(-50%) to 0 loop */}
          <div className="flex flex-col gap-[40px] pb-[40px]">
            {cards.map((card, idx) => (
              <div
                key={`col2-${card.id}-${idx}`}
                className={`relative z-10 w-[280px] h-[160px] p-3.5 rounded-2xl ${cardBorder} ${cardShadow} flex flex-col justify-between shrink-0 box-border`}
                style={{ backgroundColor: cardBg }}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`p-1.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-slate-100'
                        }`}
                    >
                      {card.icon}
                    </div>
                    <span
                      className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                      {card.title}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Body */}
                {card.contentBox ? (
                  card.contentBox
                ) : (
                  <div>
                    <div
                      className={`text-xl font-black tracking-tight ${card.metricClass
                          ? card.metricClass
                          : isDark
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                    >
                      {card.metric}{' '}
                      {card.metricUnit && (
                        <span
                          className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                        >
                          {card.metricUnit}
                        </span>
                      )}
                    </div>
                    {card.subtext && (
                      <p
                        className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                      >
                        {card.subtext}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div
                  className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${isDark
                      ? 'text-slate-400 border-white/10'
                      : 'text-slate-500 border-slate-100'
                    }`}
                >
                  <span>{card.footerLeft}</span>
                  {card.footerRight}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Fade Gradient Mask using current theme background */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 z-20"
          style={{
            background: `linear-gradient(to bottom, ${currentConfig.bgColor}, transparent)`,
          }}
        />

        {/* Bottom Fade Gradient Mask using current theme background */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-20"
          style={{
            background: `linear-gradient(to top, ${currentConfig.bgColor}, transparent)`,
          }}
        />
      </div>
    </div>
  )
})

AuthCarousel.displayName = 'AuthCarousel'
