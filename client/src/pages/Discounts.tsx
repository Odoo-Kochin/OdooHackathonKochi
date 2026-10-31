import React, { useState, useEffect } from 'react'
import type { DiscountRule, Product } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { Plus } from 'lucide-react'
import axios from 'axios'

export const Discounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountRule[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Form states per Scene 5
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
  const [value, setValue] = useState<number>(15)
  const [appliesTo, setAppliesTo] = useState<'whole_subscription' | 'specific_product'>(
    'whole_subscription'
  )
  const [targetProductId, setTargetProductId] = useState('')
  const [minimumPurchase, setMinimumPurchase] = useState<number>(500)
  const [minimumQuantity, setMinimumQuantity] = useState<number>(3)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('2026-12-31')
  const [usageLimit, setUsageLimit] = useState<number>(50)

  const fetchDiscounts = async () => {
    try {
      const [discRes, prodRes] = await Promise.all([
        axios.get('/api/discounts'),
        axios.get('/api/products'),
      ])
      if (discRes.data.data) setDiscounts(discRes.data.data)
      if (prodRes.data.data) {
        setProducts(prodRes.data.data)
        if (prodRes.data.data.length > 0 && !targetProductId) {
          setTargetProductId(prodRes.data.data[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetProduct = products.find((p) => p.id === targetProductId)

    try {
      await axios.post('/api/discounts', {
        code,
        description,
        type,
        value: Number(value),
        appliesTo,
        targetProductId: appliesTo === 'specific_product' ? targetProductId : undefined,
        targetProductName: appliesTo === 'specific_product' ? targetProduct?.name : undefined,
        minimumPurchase: Number(minimumPurchase),
        minimumQuantity: Number(minimumQuantity),
        startDate,
        endDate,
        usageLimit: Number(usageLimit),
      })
      setModalOpen(false)
      setCode('')
      setDescription('')
      fetchDiscounts()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Scene 5: Dynamic Discounts
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Discount & Promotional Rules
          </h2>
          <p className="text-xs text-slate-500">
            Fixed amount or percentage discounts with seat thresholds, auto-applied to invoices.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discounts.map((disc) => {
          const usagePercent = Math.min(100, Math.round((disc.usageCount / disc.usageLimit) * 100))

          return (
            <div
              key={disc.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-mono px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {disc.code}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {disc.type}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} OFF`}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {disc.description}
                </p>

                {/* Scope details */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Applies To:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {disc.appliesTo === 'whole_subscription'
                        ? 'Whole Subscription'
                        : disc.targetProductName || 'Specific Product'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Min Seats / Qty:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {disc.minimumQuantity} units
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Min Order Spend:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ${disc.minimumPurchase}
                    </span>
                  </div>
                </div>

                {/* Usage meter */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Usage Limit</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {disc.usageCount} / {disc.usageLimit} claims
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Valid: {disc.startDate} to {disc.endDate}</span>
                <span className="text-emerald-600 font-semibold">Active Rule</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Discount Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Automated Discount Rule"
        description="Admin-only: Configure rules for seat bulk purchases or promo codes."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDiscount} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Discount Promo Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SEATS10PLUS"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Discount Type & Value
              </label>
              <div className="flex gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
                <input
                  type="number"
                  required
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder="15"
                  className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Description / Marketing Term
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="15% discount for ordering more than 5 seats on Brightloop ERP"
              className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Applies To
              </label>
              <select
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="whole_subscription">Whole Subscription Total</option>
                <option value="specific_product">Specific Product Line</option>
              </select>
            </div>

            {appliesTo === 'specific_product' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Target Product
                </label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Min Quantity (Seats)
              </label>
              <input
                type="number"
                min={1}
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Min Spend ($)
              </label>
              <input
                type="number"
                value={minimumPurchase}
                onChange={(e) => setMinimumPurchase(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Usage Limit (Claims)
              </label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md"
            >
              Activate Discount Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
