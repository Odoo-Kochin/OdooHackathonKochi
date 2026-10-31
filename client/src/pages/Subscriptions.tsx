import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type {
  Subscription,
  SubscriptionStatus,
} from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/context/ToastContext'
import { Plus, ArrowRight, Eye, Edit2 } from 'lucide-react'
import axios from 'axios'

export const Subscriptions: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)

  // Status advance confirmation state
  const [confirmTargetSub, setConfirmTargetSub] = useState<Subscription | null>(null)
  const [confirmingStatus, setConfirmingStatus] = useState(false)

  const fetchSubscriptions = async () => {
    try {
      const subsRes = await axios.get('/api/subscriptions')
      if (subsRes.data.data) setSubscriptions(subsRes.data.data)
    } catch (err) {
      toast.error('Fetch Failed', 'Failed to retrieve subscriptions from backend.')
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  // Advance lifecycle state: Draft -> Quotation -> Confirmed -> Active -> Closed
  const getNextStatus = (status: SubscriptionStatus): SubscriptionStatus => {
    const flow: Record<SubscriptionStatus, SubscriptionStatus> = {
      Draft: 'Quotation',
      Quotation: 'Confirmed',
      Confirmed: 'Active',
      Active: 'Closed',
      Closed: 'Draft',
      Paused: 'Active',
    }
    return flow[status] || 'Confirmed'
  }

  const handleExecuteAdvance = async () => {
    if (!confirmTargetSub) return
    setConfirmingStatus(true)
    const nextStatus = getNextStatus(confirmTargetSub.status)

    try {
      await axios.patch(`/api/subscriptions/${confirmTargetSub.id}/status`, { status: nextStatus })
      toast.success(
        'Status Advanced',
        `Subscription ${confirmTargetSub.subscriptionNumber} is now ${nextStatus}.`
      )
      await fetchSubscriptions()
      if (selectedSub?.id === confirmTargetSub.id) {
        setSelectedSub({ ...confirmTargetSub, status: nextStatus })
      }
    } catch (err) {
      toast.error('Transition Error', 'Could not update subscription lifecycle status.')
    } finally {
      setConfirmingStatus(false)
      setConfirmTargetSub(null)
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
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      case 'Paused':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Confirmation Modal for Lifecycle Transitions */}
      <ConfirmDialog
        isOpen={Boolean(confirmTargetSub)}
        onClose={() => setConfirmTargetSub(null)}
        onConfirm={handleExecuteAdvance}
        title={`Advance Lifecycle: ${confirmTargetSub?.status} → ${
          confirmTargetSub ? getNextStatus(confirmTargetSub.status) : ''
        }`}
        description={`Are you sure you want to transition subscription "${confirmTargetSub?.subscriptionNumber}" for ${confirmTargetSub?.customerName} to ${
          confirmTargetSub ? getNextStatus(confirmTargetSub.status) : ''
        }?`}
        confirmLabel="Confirm Transition"
        variant={confirmTargetSub?.status === 'Active' ? 'warning' : 'primary'}
        isLoading={confirmingStatus}
      />

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'draft', 'quotation', 'confirmed', 'active', 'closed'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Multi-step Stepper Navigation Button */}
        <button
          onClick={() => navigate('/subscriptions/new')}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quotation (Step Wizard)</span>
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
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ${sub.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit with Stepper */}
                      <button
                        onClick={() => navigate(`/subscriptions/${sub.id}/edit`)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit contract details in step wizard"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Inspect Modal */}
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Advance Status with Confirmation Modal */}
                      <button
                        onClick={() => setConfirmTargetSub(sub)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium text-[11px] flex items-center gap-1 transition-colors"
                        title={`Advance to ${getNextStatus(sub.status)}`}
                      >
                        <span>{getNextStatus(sub.status)}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No subscriptions matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Inspection Modal */}
      {selectedSub && (
        <Modal
          isOpen={Boolean(selectedSub)}
          onClose={() => setSelectedSub(null)}
          title={`Subscription ${selectedSub.subscriptionNumber}`}
          description={`Customer: ${selectedSub.customerName} (${selectedSub.customerCompany})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${getStatusBadge(selectedSub.status)}`}>
                  {selectedSub.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Plan Cadence</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {selectedSub.planName} ({selectedSub.billingFrequency})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Terms</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedSub.paymentTerms}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expiry Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(selectedSub.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2">Itemized Schedule</h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-right">Tax %</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedSub.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                          {item.productName}
                        </td>
                        <td className="py-2 px-3 text-center">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">${item.unitPrice}</td>
                        <td className="py-2 px-3 text-right font-mono">{item.taxRatePercent}%</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">${item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${selectedSub.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Statutory GST (18%):</span>
                <span>${selectedSub.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1.5">
                <span>Grand Total:</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  ${selectedSub.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedSub(null)
                  navigate(`/subscriptions/${selectedSub.id}/edit`)
                }}
                className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Full Edit in Timeline Wizard</span>
              </button>
              <button
                onClick={() => setSelectedSub(null)}
                className="px-3 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
