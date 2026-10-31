import React, { useState, useEffect } from 'react'
import type { DiscountRule, Product } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/context/ToastContext'
import { Plus, Tag, Percent, DollarSign, Calendar, Users, TrendingUp, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

export const Discounts: React.FC = () => {
  const toast = useToast()
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
      toast.success(
        'Discount Rule Created',
        `Promotional rule "${code}" (${value}${type === 'percentage' ? '%' : '$'} off) is now active.`
      )
      fetchDiscounts()
    } catch (err) {
      toast.error('Creation Failed', 'Could not save discount rule.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500">
            Rules auto-applied to invoices when seat thresholds or promo criteria are satisfied.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Discount Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Tag className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              No discount rules found in database.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Create a promotional voucher or volume discount rule to incentivize larger orders.
            </p>
          </div>
        ) : (
          discounts.map((disc) => {
          const usagePercent = Math.min(100, Math.round((disc.usageCount / disc.usageLimit) * 100))

          return (
            <div
              key={disc.id}
              className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    <span>{disc.code}</span>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    {disc.type === 'percentage' ? (
                      <Percent className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <DollarSign className="w-3 h-3 text-indigo-500" />
                    )}
                    <span>{disc.type}</span>
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} OFF`}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {disc.description}
                </p>

                {/* Scope details */}
                <div className="mt-3 p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Applies To:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {disc.appliesTo === 'whole_subscription'
                        ? 'Whole Sub'
                        : disc.targetProductName || 'Product'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 items-center">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1 text-slate-400" />
                      Min Seats:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {disc.minimumQuantity} units
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 items-center">
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-slate-400" />
                      Min Spend:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      ${disc.minimumPurchase}
                    </span>
                  </div>
                </div>

                {/* Usage meter */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Usage Limit</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {disc.usageCount} / {disc.usageLimit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                  {disc.startDate} to {disc.endDate}
                </span>
                <span className="text-emerald-600 font-medium flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                  Active Rule
                </span>
              </div>
            </div>
          )
        }))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Discount Rule"
        description="Admin configuration for volume discounts, seat thresholds, and promotional vouchers."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDiscount} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Discount Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SEATS10PLUS"
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type & Value
              </label>
              <div className="flex gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
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
                  className="flex-1 px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="15% discount for 5+ seats"
              className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Applies To
              </label>
              <select
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="whole_subscription">Whole Subscription Total</option>
                <option value="specific_product">Specific Product Line</option>
              </select>
            </div>

            {appliesTo === 'specific_product' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Product
                </label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Min Seats
              </label>
              <input
                type="number"
                min={1}
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Min Spend ($)
              </label>
              <input
                type="number"
                value={minimumPurchase}
                onChange={(e) => setMinimumPurchase(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
            >
              Activate Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
