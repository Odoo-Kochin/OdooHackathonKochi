import React, { useState, useEffect } from 'react'
import type {
  Subscription,
  SubscriptionStatus,
  Product,
  SubscriptionPlan,
} from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { Plus, ArrowRight, Eye } from 'lucide-react'
import axios from 'axios'

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)

  // New Quote form states
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
        productName: plan?.name || 'Brightloop Core ERP',
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
        status: 'Quotation',
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
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                filterStatus === tab
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quote from Template</span>
        </button>
      </div>

      {/* Subscriptions Table Card */}
      <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Number</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Plan / Billing</th>
                <th className="py-2.5 px-4">Terms & Expiry</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubs.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                    {sub.subscriptionNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{sub.customerName}</p>
                    <p className="text-[11px] text-slate-400">{sub.customerCompany}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {sub.planName}
                    </span>
                    <span className="text-[10px] text-slate-400 block capitalize">
                      {sub.billingFrequency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    <p className="font-medium">{sub.paymentTerms}</p>
                    <p className="text-[10px] text-slate-400">
                      Expires {new Date(sub.expiryDate).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getStatusBadge(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                    ${sub.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View Lines & Taxes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {sub.status !== 'Closed' && (
                        <button
                          onClick={() => handleAdvanceStatus(sub)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
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
          description={`Customer: ${selectedSub.customerCompany} • Lifecycle Stage: ${selectedSub.status}`}
          maxWidth="lg"
        >
          <div className="space-y-3.5">
            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Status</span>
                <span className="font-bold text-indigo-600">{selectedSub.status}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Frequency</span>
                <span className="font-medium capitalize">{selectedSub.billingFrequency}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Terms</span>
                <span className="font-medium">{selectedSub.paymentTerms}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Quote Validity</span>
                <span className="font-medium">{selectedSub.quotationValidityDays} days</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Product Lines & Calculated Taxes
              </h4>
              <div className="space-y-1.5">
                {selectedSub.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.productName}</p>
                      <p className="text-[10px] text-slate-400">
                        Qty {item.quantity} × ${item.unitPrice} | Tax: {item.taxRatePercent}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        ${item.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${selectedSub.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax Total (18% GST/VAT):</span>
                <span>${selectedSub.taxTotal.toLocaleString()}</span>
              </div>
              {selectedSub.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discounts Applied:</span>
                  <span>-${selectedSub.discountTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total:</span>
                <span>${selectedSub.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStatus(selectedSub)}
                className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
              >
                Advance State
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Quotation from Template Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Quotation Template - New Offer"
        description="Start from pre-configured product lines and set quotation validity period."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Billing Email
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Template Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price} / {p.billingFrequency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Seats / Qty
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Immediate">Immediate</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Valid for (Days)
              </label>
              <input
                type="number"
                min={1}
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
            >
              Issue Quotation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
