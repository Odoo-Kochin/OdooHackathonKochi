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
  ShieldCheck,
} from 'lucide-react'

export const AuthCarousel: React.FC = React.memo(() => {
  const { currentConfig } = useTheme()
  const isDark = currentConfig.isDark

  // 6 Enterprise Card items matching the 280x160px spec
  const baseCards = [
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
          className={`p-2 rounded-lg text-xs space-y-0.5 font-mono ${
            isDark
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
          className={`font-bold px-1.5 py-0.5 rounded ${
            isDark
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-emerald-100 text-emerald-800'
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
      footerRight: (
        <span className="text-purple-500 font-medium">Auto-Renew Active</span>
      ),
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
      footerRight: (
        <span className="text-amber-500 font-mono font-medium">Auto-Applied</span>
      ),
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
    {
      id: 'dunning-recovery-card',
      title: 'Dunning Recovery',
      badge: '99.4% SAVED',
      badgeColor: isDark
        ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
        : 'bg-rose-50 text-rose-700 border-rose-200',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />,
      metric: '$4,280',
      metricUnit: 'recovered',
      subtext: 'Auto Smart-Retry via Stripe & Odoo',
      footerLeft: 'Zero Involuntary Churn',
      footerRight: (
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" /> Auto-Synced
        </span>
      ),
    },
  ]

  // Dynamic theme-derived colors for borders, cards, and dashed line
  const cardBg = isDark ? currentConfig.surfaceColor : '#ffffff'
  const cardBorder = isDark ? 'border-white/15' : 'border-slate-200/90'
  const cardShadow = isDark
    ? 'shadow-xl shadow-black/50'
    : 'shadow-xl shadow-slate-300/40'
  // Crisp, high-contrast dashed line color so connections are unmistakable
  const dashedLineColor = isDark ? '#818cf8' : '#4f46e5'

  // Right column: standard sequence [0, 1, 2, 3, 4, 5] moving DOWN
  const rightColumnCards = baseCards
  // Left column: synchronized circular sequence [3, 2, 1, 0, 5, 4] moving back UP!
  // When a card exits the bottom of the right column, the exact same card enters the bottom of the left column and travels back UP.
  // When it reaches the top of the left column, it returns to the top of the right column and travels back DOWN.
  const leftColumnCards = [
    baseCards[3],
    baseCards[2],
    baseCards[1],
    baseCards[0],
    baseCards[5],
    baseCards[4],
  ]

  // Helper to render an individual card with guaranteed top & bottom connector lines
  const renderCard = (card: (typeof baseCards)[0], key: string) => (
    <div
      key={key}
      className={`relative z-10 w-[280px] h-[160px] p-3.5 rounded-2xl ${cardBorder} ${cardShadow} flex flex-col justify-between shrink-0 box-border transition-colors duration-300`}
      style={{ backgroundColor: cardBg }}
    >
      {/* Dedicated top connecting dashed line segment bridging the 40px gap above */}
      <div
        className="absolute left-1/2 -top-[40px] h-[40px] -translate-x-1/2 w-0 pointer-events-none -z-10"
        style={{
          borderLeft: `2px dashed ${dashedLineColor}`,
        }}
      />

      {/* Top connector node dot */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-indigo-500 bg-white dark:bg-slate-900 z-20 shadow-xs"
        style={{ borderColor: dashedLineColor }}
      />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className={`p-1.5 rounded-lg ${
              isDark ? 'bg-white/10' : 'bg-slate-100'
            }`}
          >
            {card.icon}
          </div>
          <span
            className={`text-xs font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
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

      {/* Card Body */}
      {card.contentBox ? (
        card.contentBox
      ) : (
        <div>
          <div
            className={`text-xl font-black tracking-tight ${
              card.metricClass
                ? card.metricClass
                : isDark
                ? 'text-white'
                : 'text-slate-900'
            }`}
          >
            {card.metric}{' '}
            {card.metricUnit && (
              <span
                className={`text-xs font-normal ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {card.metricUnit}
              </span>
            )}
          </div>
          {card.subtext && (
            <p
              className={`text-[11px] mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {card.subtext}
            </p>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div
        className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${
          isDark
            ? 'text-slate-400 border-white/10'
            : 'text-slate-500 border-slate-100'
        }`}
      >
        <span>{card.footerLeft}</span>
        {card.footerRight}
      </div>

      {/* Bottom connector node dot */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-indigo-500 bg-white dark:bg-slate-900 z-20 shadow-xs"
        style={{ borderColor: dashedLineColor }}
      />

      {/* Dedicated bottom connecting dashed line segment bridging the 40px gap below */}
      <div
        className="absolute left-1/2 -bottom-[40px] h-[40px] -translate-x-1/2 w-0 pointer-events-none -z-10"
        style={{
          borderLeft: `2px dashed ${dashedLineColor}`,
        }}
      />
    </div>
  )

  // Helper to render a complete moving card track with duplicated card stacks
  const renderCardColumn = (
    cardsList: typeof baseCards,
    columnId: string,
    animClass: string
  ) => (
    <div className={`relative flex flex-col items-center ${animClass} w-[280px]`}>
      {/* Continuous background vertical dashed line running the full length + buffer */}
      <div
        className="absolute left-1/2 -top-[1200px] -bottom-[1200px] -translate-x-1/2 w-0 pointer-events-none -z-20"
        style={{
          height: 'calc(100% + 2400px)',
          borderLeft: `2px dashed ${dashedLineColor}`,
        }}
      />

      {/* List 1: Original Card Stack with 40px gap and 40px bottom padding */}
      <div className="flex flex-col gap-[40px] pb-[40px]">
        {cardsList.map((card, idx) =>
          renderCard(card, `${columnId}-list1-${card.id}-${idx}`)
        )}
      </div>

      {/* List 2: Duplicate Card Stack for mathematically seamless translateY(-50%) loop */}
      <div className="flex flex-col gap-[40px] pb-[40px]">
        {cardsList.map((card, idx) =>
          renderCard(card, `${columnId}-list2-${card.id}-${idx}`)
        )}
      </div>
    </div>
  )

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: currentConfig.bgColor }}
    >
      {/*
        SPEC COMPLIANT CIRCULAR 2-COLUMN WRAPPER:
        - Two centered columns of cards (Left column & Right column) with fixed 40px vertical gaps.
        - Right Column: Cards travel DOWN (scrollDown animation).
        - Left Column: Cards travel BACK UP (scrollUp animation).
        - When a card reaches the bottom of the right column, it curves to the left and ascends up the left column.
        - When a card reaches the top of the left column, it curves to the right and descends down the right column.
        - The ENTIRE circular loop is wrapped in ONE container with transform: rotate(-8deg).
      */}
      <div
        className="relative w-[600px] sm:w-[640px] xl:w-[680px] h-[680px] sm:h-[760px] overflow-hidden flex justify-center items-center [transform:rotate(-8deg)]"
        style={{ willChange: 'transform' }}
      >
        {/* Dual Columns Container with gap between them */}
        <div className="relative flex items-center gap-7 sm:gap-8 z-10">
          {/*
            Left Column: Cards move BACK UP (animate-infinite-column-up).
            When cards in the right carousel go down, they travel back up here!
          */}
          {renderCardColumn(leftColumnCards, 'col-left', 'animate-infinite-column-up')}

          {/*
            Right Column: Existing carousel column moving top to bottom (animate-infinite-column).
          */}
          {renderCardColumn(rightColumnCards, 'col-right', 'animate-infinite-column')}
        </div>

        {/* Top Fade Gradient Mask using current theme background */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 z-20"
          style={{
            background: `linear-gradient(to bottom, ${currentConfig.bgColor}, transparent)`,
          }}
        />

        {/* Bottom Fade Gradient Mask using current theme background */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 z-20"
          style={{
            background: `linear-gradient(to top, ${currentConfig.bgColor}, transparent)`,
          }}
        />
      </div>
    </div>
  )
})

AuthCarousel.displayName = 'AuthCarousel'
