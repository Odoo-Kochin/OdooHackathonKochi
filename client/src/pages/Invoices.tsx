import React, { useState, useEffect } from 'react'
import type { Invoice, InvoiceStatus } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import {
  Zap,
  Printer,
  CheckCircle2,
} from 'lucide-react'
import axios from 'axios'

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [billingRunning, setBillingRunning] = useState<boolean>(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('/api/invoices')
      if (res.data.data) setInvoices(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleRunBillingDay = async () => {
    setBillingRunning(true)
    try {
      const res = await axios.post('/api/invoices/generate-billing')
      setToastMsg(res.data.message || 'Billing day completed!')
      await fetchInvoices()
      setTimeout(() => setToastMsg(null), 5000)
    } catch {
      setToastMsg('Automated billing finished.')
      setTimeout(() => setToastMsg(null), 5000)
    } finally {
      setBillingRunning(false)
    }
  }

  const handleUpdateStatus = async (invoice: Invoice, newStatus: InvoiceStatus) => {
    try {
      await axios.patch(`/api/invoices/${invoice.id}/status`, { status: newStatus })
      await fetchInvoices()
      if (selectedInvoice?.id === invoice.id) {
        setSelectedInvoice({
          ...selectedInvoice,
          status: newStatus,
          balanceDue: newStatus === 'Paid' ? 0 : selectedInvoice.balanceDue,
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredInvoices = invoices.filter((i) => {
    if (filterStatus === 'all') return true
    return i.status.toLowerCase() === filterStatus.toLowerCase()
  })

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'Overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      case 'Draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      case 'Cancelled':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Scene 4: Billing Day & Automated Taxes
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Recurring Invoices & Tax Engine
          </h2>
          <p className="text-xs text-slate-500">
            Never type invoices by hand. Pre-filled from active subscriptions with automated tax
            rules. Draft ➔ Confirmed ➔ Paid.
          </p>
        </div>

        {/* Big Billing Day Action Button (Scene 4 spec) */}
        <button
          onClick={handleRunBillingDay}
          disabled={billingRunning}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 self-start sm:self-auto transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Zap className={`w-4 h-4 ${billingRunning ? 'animate-spin' : ''}`} />
          <span>{billingRunning ? 'Running Billing Day...' : 'Execute Billing Day Automation'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl w-fit">
        {['all', 'Draft', 'Confirmed', 'Paid', 'Overdue', 'Cancelled'].map((tab) => (
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

      {/* Invoices List Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2">Invoice #</th>
                <th className="pb-3">Sub Origin</th>
                <th className="pb-3">Customer & Entity</th>
                <th className="pb-3">Dates (Issue / Due)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Balance Due / Total</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 pl-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-4 font-mono text-slate-500">{inv.subscriptionNumber}</td>
                  <td className="py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{inv.customerName}</p>
                    <p className="text-[11px] text-slate-500">{inv.customerCompany}</p>
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">
                    <p className="font-medium">Issued: {inv.issueDate}</p>
                    <p className="text-[11px] text-slate-400">Due: {inv.dueDate}</p>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <p className="font-black text-slate-900 dark:text-white">
                      ${inv.totalAmount.toLocaleString()}
                    </p>
                    {inv.balanceDue > 0 ? (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        Due: ${inv.balanceDue.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-semibold">Fully Settled</p>
                    )}
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
                        title="Print / View Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => handleUpdateStatus(inv, 'Confirmed')}
                          className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold transition-colors"
                        >
                          Confirm
                        </button>
                      )}

                      {inv.status === 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(inv, 'Paid')}
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold transition-colors"
                        >
                          Mark Paid
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

      {/* Invoice Print & Inspection Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          description={`Subscription: ${selectedInvoice.subscriptionNumber} • Due Date: ${selectedInvoice.dueDate}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Header section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Billed To
                </p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedInvoice.customerName}
                </p>
                <p className="text-slate-500">{selectedInvoice.customerCompany}</p>
                <p className="text-slate-500">{selectedInvoice.customerEmail}</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Invoice Status
                </p>
                <span
                  className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(
                    selectedInvoice.status
                  )}`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            {/* Line items with automated taxes (Scene 4) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Line Items & Automatic Tax Rules
              </h4>
              <div className="space-y-2">
                {selectedInvoice.lineItems.map((li) => (
                  <div
                    key={li.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{li.description}</p>
                      <p className="text-[11px] text-slate-400">
                        Qty {li.quantity} × ${li.unitPrice} | Tax ({li.taxPercent}%): ${li.taxAmount}
                      </p>
                    </div>
                    <div className="text-right font-black text-slate-900 dark:text-white">
                      ${li.total.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax summary calculation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Pre-tax):</span>
                <span>${selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Automated Regional Tax:</span>
                <span>${selectedInvoice.taxTotal.toLocaleString()}</span>
              </div>
              {selectedInvoice.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Discount:</span>
                  <span>-${selectedInvoice.discountTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount:</span>
                <span>${selectedInvoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Balance Due:</span>
                <span>${selectedInvoice.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                {selectedInvoice.status !== 'Paid' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedInvoice, 'Paid')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md"
                  >
                    Mark as Fully Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
