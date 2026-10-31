import React, { useState, useEffect } from 'react'
import type { SubscriptionPlan, BillingFrequency, Product } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { Plus } from 'lucide-react'
import axios from 'axios'

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Form state
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
        productName: selectedProd?.name || 'Standard Service',
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
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500">
            Define recurring frequencies (daily, weekly, monthly, yearly) and lifecycle termination rules.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Plan</span>
        </button>
      </div>

      {/* Plans List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  {plan.code}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {plan.billingFrequency}
                </span>
              </div>

              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {plan.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{plan.productName}</p>

              {plan.description && (
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{plan.description}</p>
              )}

              {/* Price Banner */}
              <div className="mt-3 p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/{plan.billingFrequency}</span>
                </div>
                <span className="text-[11px] text-slate-500">Min {plan.minimumQuantity} seat(s)</span>
              </div>

              {/* Lifecycle Rules Flags */}
              <div className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Auto-close on end:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {plan.autoCloseOnEnd ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Early termination:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {plan.canBeClosedEarly ? 'Allowed' : 'Locked'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pause & Resume:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {plan.canBePaused ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Start: {plan.startDate}</span>
              <span className="text-emerald-600 font-medium">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Subscription Plan"
        description="Set billing frequency, minimum seat constraints, and lifecycle termination rules."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePlan} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enterprise Growth - Monthly"
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Plan Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="GROWTH-MO"
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Base Product
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.salesPrice})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Billing Frequency
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Price per Cycle ($)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Min Quantity (Seats)
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
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold block mb-1">Plan Decisions:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCloseOnEnd}
                onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Auto-close on expiration date</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canBeClosedEarly}
                onChange={(e) => setCanBeClosedEarly(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Can be closed early by customer or staff</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canBePaused}
                onChange={(e) => setCanBePaused(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Can be paused and resumed later</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canBeRenewed}
                onChange={(e) => setCanBeRenewed(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Can be renewed upon completion</span>
            </label>
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
              Launch Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
