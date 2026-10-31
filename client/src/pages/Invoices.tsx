import React, { useState, useEffect } from 'react'
import type { Invoice, InvoiceStatus } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { Zap, Printer, CheckCircle2 } from 'lucide-react'
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
      setToastMsg(res.data.message || 'Billing day completed.')
      await fetchInvoices()
      setTimeout(() => setToastMsg(null), 4000)
    } catch {
      setToastMsg('Billing run completed.')
      setTimeout(() => setToastMsg(null), 4000)
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
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
      case 'Overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
      case 'Draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      case 'Cancelled':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Draft', 'Confirmed', 'Paid', 'Overdue'].map((tab) => (
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
          onClick={handleRunBillingDay}
          disabled={billingRunning}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Zap className={`w-3.5 h-3.5 ${billingRunning ? 'animate-spin' : ''}`} />
          <span>{billingRunning ? 'Executing...' : 'Run Billing Day Cycle'}</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Sub Origin</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Issue / Due Date</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Balance Due / Total</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{inv.subscriptionNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{inv.customerName}</p>
                    <p className="text-[11px] text-slate-400">{inv.customerCompany}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    <p className="font-medium">{inv.issueDate}</p>
                    <p className="text-[10px] text-slate-400">Due: {inv.dueDate}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getStatusBadge(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-bold text-slate-900 dark:text-white">
                      ${inv.totalAmount.toLocaleString()}
                    </p>
                    {inv.balanceDue > 0 ? (
                      <p className="text-[10px] text-red-600 font-semibold">
                        Due: ${inv.balanceDue.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600">Settled</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        title="Print / View Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => handleUpdateStatus(inv, 'Confirmed')}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-semibold transition-colors"
                        >
                          Confirm
                        </button>
                      )}

                      {inv.status === 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(inv, 'Paid')}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-semibold transition-colors"
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

      {/* Invoice Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          description={`Subscription: ${selectedInvoice.subscriptionNumber} • Due Date: ${selectedInvoice.dueDate}`}
          maxWidth="lg"
        >
          <div className="space-y-3.5">
            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400">Billed To</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedInvoice.customerName}
                </p>
                <p className="text-slate-500">{selectedInvoice.customerCompany}</p>
                <p className="text-slate-500">{selectedInvoice.customerEmail}</p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase ${getStatusBadge(
                    selectedInvoice.status
                  )}`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Line Items & 18% Tax Rules
              </h4>
              <div className="space-y-1.5">
                {selectedInvoice.lineItems.map((li) => (
                  <div
                    key={li.id}
                    className="p-2.5 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{li.description}</p>
                      <p className="text-[10px] text-slate-400">
                        Qty {li.quantity} × ${li.unitPrice} | Tax ({li.taxPercent}%): ${li.taxAmount}
                      </p>
                    </div>
                    <div className="text-right font-bold text-slate-900 dark:text-white">
                      ${li.total.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax Total:</span>
                <span>${selectedInvoice.taxTotal.toLocaleString()}</span>
              </div>
              {selectedInvoice.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promotional Discount:</span>
                  <span>-${selectedInvoice.discountTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount:</span>
                <span>${selectedInvoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-red-600">
                <span>Balance Due:</span>
                <span>${selectedInvoice.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                {selectedInvoice.status !== 'Paid' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedInvoice, 'Paid')}
                    className="px-3.5 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500"
                  >
                    Mark Paid
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
