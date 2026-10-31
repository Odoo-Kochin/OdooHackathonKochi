import React, { useState, useEffect } from 'react'
import type {
  Subscription,
  SubscriptionStatus,
  Product,
  SubscriptionPlan,
} from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import {
  Plus,
  ArrowRight,
  Eye,
} from 'lucide-react'
import axios from 'axios'

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)

  // New Quote / Sub form states (Scene 3: Quotation Template)
  const [customerName, setCustomerName] = useState('Zenith Dynamics India')
  const [customerEmail, setCustomerEmail] = useState('billing@zenithdynamics.in')
  const [customerCompany, setCustomerCompany] = useState('Zenith Dynamics Technologies')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [validityDays, setValidityDays] = useState<number>(15)
  const [quantity, setQuantity] = useState<number>(2)

  const fetchSubscriptions = async () => {
    try {
      const [subsRes, prodsRes, plansRes] = await Promise.all([
        axios.get('/api/subscriptions'),
        axios.get('/api/products'),
        axios.get('/api/plans'),
      ])
      if (subsRes.data.data) setSubscriptions(subsRes.data.data)
      if (prodsRes.data.data) setProducts(prodsRes.data.data)
      if (plansRes.data.data) {
        setPlans(plansRes.data.data)
        if (plansRes.data.data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(plansRes.data.data[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  // Advance lifecycle state: Draft -> Quotation -> Confirmed -> Active -> Closed
  const handleAdvanceStatus = async (sub: Subscription) => {
    const flow: Record<SubscriptionStatus, SubscriptionStatus> = {
      Draft: 'Quotation',
      Quotation: 'Confirmed',
      Confirmed: 'Active',
      Active: 'Closed',
      Closed: 'Draft',
      Paused: 'Active',
    }
    const nextStatus = flow[sub.status] || 'Confirmed'

    try {
      await axios.patch(`/api/subscriptions/${sub.id}/status`, { status: nextStatus })
      await fetchSubscriptions()
      if (selectedSub?.id === sub.id) {
        setSelectedSub({ ...sub, status: nextStatus })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault()
    const plan = plans.find((p) => p.id === selectedPlanId) || plans[0]
    const prod = products[0]

    const unitPrice = plan ? plan.price : 450
    const subtotal = unitPrice * quantity
    const taxRatePercent = 18
    const taxTotal = Math.round(((subtotal * taxRatePercent) / 100) * 100) / 100
    const grandTotal = subtotal + taxTotal

    const lineItems = [
      {
        id: `li-${Date.now()}`,
        productId: prod?.id || 'prod-01',
        productName: plan?.name || 'Brightloop Cloud ERP',
        variantName: 'Standard Variant',
        quantity,
        unitPrice,
        taxRatePercent,
        discountAmount: 0,
        subtotal,
        total: grandTotal,
      },
    ]

    try {
      await axios.post('/api/subscriptions', {
        customerName,
        customerEmail,
        customerCompany,
        planId: plan?.id,
        planName: plan?.name,
        billingFrequency: plan?.billingFrequency || 'monthly',
        status: 'Quotation', // Starts from Quotation per Scene 3
        paymentTerms,
        quotationValidityDays: validityDays,
        lineItems,
      })

      setCreateModalOpen(false)
      fetchSubscriptions()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredSubs = subscriptions.filter((s) => {
    if (filterStatus === 'all') return true
    return s.status.toLowerCase() === filterStatus.toLowerCase()
  })

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      case 'Quotation':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      case 'Closed':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Scene 3: Subscription Engine
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscriptions & Quotations
          </h2>
          <p className="text-xs text-slate-500">
            Lifecycle stages: Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Quote from Template</span>
        </button>
      </div>

      {/* Lifecycle Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl w-fit">
        {['all', 'Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              filterStatus === tab
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Subscriptions Table Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2">Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Plan / Frequency</th>
                <th className="pb-3">Term & Validity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Total</th>
                <th className="pb-3 pr-2 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredSubs.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 pl-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {sub.subscriptionNumber}
                  </td>
                  <td className="py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{sub.customerName}</p>
                    <p className="text-[11px] text-slate-500">{sub.customerCompany}</p>
                  </td>
                  <td className="py-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sub.planName}
                    </span>
                    <span className="text-[11px] text-slate-400 block capitalize">
                      {sub.billingFrequency}
                    </span>
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">
                    <p className="font-medium">{sub.paymentTerms}</p>
                    <p className="text-[11px] text-slate-400">
                      Expires {new Date(sub.expiryDate).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-black text-slate-900 dark:text-white">
                    ${sub.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
                        title="Inspect Lines & Taxes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {sub.status !== 'Closed' && (
                        <button
                          onClick={() => handleAdvanceStatus(sub)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Details Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Subscription ${selectedSub.subscriptionNumber}`}
          description={`Customer: ${selectedSub.customerCompany} • Lifecycle Status: ${selectedSub.status}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedSub.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Frequency</span>
                <span className="font-bold capitalize">{selectedSub.billingFrequency}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Terms</span>
                <span className="font-bold">{selectedSub.paymentTerms}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Quote Validity</span>
                <span className="font-bold">{selectedSub.quotationValidityDays} days</span>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Included Products & Service Lines
              </h4>
              <div className="space-y-2">
                {selectedSub.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-[11px] text-indigo-600">{item.variantName}</p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Qty: {item.quantity} × ${item.unitPrice} | Tax: {item.taxRatePercent}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">
                        ${item.total.toLocaleString()}
                      </p>
                      {item.discountAmount > 0 && (
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          -${item.discountAmount} promo
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${selectedSub.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Automated Tax Rules (18%):</span>
                <span>${selectedSub.taxTotal.toLocaleString()}</span>
              </div>
              {selectedSub.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discounts Applied:</span>
                  <span>-${selectedSub.discountTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total:</span>
                <span>${selectedSub.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStatus(selectedSub)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md"
              >
                Advance to Next Stage
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Quotation from Template Modal (Scene 3 spec) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Quotation Template - New Subscription Offer"
        description="Start from pre-configured product lines and set quotation validity days."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                required
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Billing Email
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Quotation Template Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price} / {p.billingFrequency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Seats / Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Immediate">Immediate</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Valid for (Days)
              </label>
              <input
                type="number"
                min={1}
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md"
            >
              Issue Quotation Offer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
