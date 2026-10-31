import React, { useState, useEffect } from 'react'
import type { SubscriptionPlan, BillingFrequency, Product } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { Plus } from 'lucide-react'
import axios from 'axios'

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Form state per Scene 2 Brightloop specification
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [productId, setProductId] = useState('')
  const [price, setPrice] = useState<number>(299)
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly')
  const [minimumQuantity, setMinimumQuantity] = useState<number>(1)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState<boolean>(false)
  const [canBeClosedEarly, setCanBeClosedEarly] = useState<boolean>(true)
  const [canBePaused, setCanBePaused] = useState<boolean>(true)
  const [canBeRenewed, setCanBeRenewed] = useState<boolean>(true)
  const [description, setDescription] = useState('')

  const fetchPlans = async () => {
    try {
      const [plansRes, prodsRes] = await Promise.all([
        axios.get('/api/plans'),
        axios.get('/api/products'),
      ])
      if (plansRes.data.data) setPlans(plansRes.data.data)
      if (prodsRes.data.data) {
        setProducts(prodsRes.data.data)
        if (prodsRes.data.data.length > 0 && !productId) {
          setProductId(prodsRes.data.data[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProd = products.find((p) => p.id === productId)
    try {
      await axios.post('/api/plans', {
        name,
        code,
        productId,
        productName: selectedProd?.name || 'Standard Platform',
        price: Number(price),
        billingFrequency,
        minimumQuantity: Number(minimumQuantity),
        startDate,
        endDate: endDate || undefined,
        autoCloseOnEnd,
        canBeClosedEarly,
        canBePaused,
        canBeRenewed,
        description,
      })
      setModalOpen(false)
      setName('')
      setCode('')
      setDescription('')
      fetchPlans()
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
              Scene 2: Recurring Plans
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscription Plans & Schedules
          </h2>
          <p className="text-xs text-slate-500">
            Define billing frequency (daily, weekly, monthly, yearly), minimum quantities, and
            auto-close / pause / renewal rules.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Configure New Plan</span>
        </button>
      </div>

      {/* Plans List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {plan.code}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                  {plan.billingFrequency}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {plan.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{plan.productName}</p>

              {plan.description && (
                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{plan.description}</p>
              )}

              {/* Price Banner */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/{plan.billingFrequency}</span>
                </div>
                <span className="text-xs text-slate-500">Min {plan.minimumQuantity} seat(s)</span>
              </div>

              {/* Lifecycle Rules Flags (Scene 2 Requirements) */}
              <div className="mt-4 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Auto-close on expiration:</span>
                  <span
                    className={`font-bold ${
                      plan.autoCloseOnEnd ? 'text-amber-600' : 'text-slate-500'
                    }`}
                  >
                    {plan.autoCloseOnEnd ? 'Yes (Auto-close)' : 'No (Continuous)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Early termination allowed:</span>
                  <span className="font-bold text-emerald-600">
                    {plan.canBeClosedEarly ? 'Allowed' : 'Locked'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Pause & Resume support:</span>
                  <span className="font-bold text-indigo-600">
                    {plan.canBePaused ? 'Supported' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Start: {plan.startDate}</span>
              <span className="text-emerald-600 font-semibold">Active Plan</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Configure Subscription Plan"
        description="Set billing frequency, minimum seat constraints, and lifecycle termination rules."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enterprise Scaler - Monthly"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Plan Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ENT-MO-01"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Base Product
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.salesPrice})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Billing Frequency
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Price per Cycle ($)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Min Seats / Quantity
              </label>
              <input
                type="number"
                min={1}
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Lifecycle Rules Toggles (Scene 2 spec) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
              Plan Lifecycle Decisions
            </span>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCloseOnEnd}
                onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Auto-close on expiration date (terminate automatically)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={canBeClosedEarly}
                onChange={(e) => setCanBeClosedEarly(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Can be closed early by customer or staff</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={canBePaused}
                onChange={(e) => setCanBePaused(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Can be paused and resumed later</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={canBeRenewed}
                onChange={(e) => setCanBeRenewed(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Can be renewed upon contract end date</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md"
            >
              Launch Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
