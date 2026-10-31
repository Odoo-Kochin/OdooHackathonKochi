import React, { useState, useEffect } from 'react'
import type { PaymentRecord, Invoice, PaymentMethod } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { Plus, AlertTriangle, ArrowRight } from 'lucide-react'
import axios from 'axios'

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Payment form state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [referenceId, setReferenceId] = useState('')

  const fetchData = async () => {
    try {
      const [payRes, invRes] = await Promise.all([
        axios.get('/api/payments'),
        axios.get('/api/invoices'),
      ])
      if (payRes.data.data) setPayments(payRes.data.data)
      if (invRes.data.data) {
        setInvoices(invRes.data.data)
        const unpaid = invRes.data.data.find((i: Invoice) => i.balanceDue > 0)
        if (unpaid && !selectedInvoiceId) {
          setSelectedInvoiceId(unpaid.id)
          setAmount(unpaid.balanceDue)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoiceId(invId)
    const inv = invoices.find((i) => i.id === invId)
    if (inv) {
      setAmount(inv.balanceDue)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    const inv = invoices.find((i) => i.id === selectedInvoiceId)
    try {
      await axios.post('/api/payments', {
        invoiceId: selectedInvoiceId,
        invoiceNumber: inv?.invoiceNumber,
        customerId: inv?.customerId,
        customerName: inv?.customerName,
        amount: Number(amount),
        paymentMethod,
        paymentDate,
        notes,
        referenceId: referenceId || `TX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      })
      setModalOpen(false)
      setNotes('')
      setReferenceId('')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue')
  const totalOverdue = overdueInvoices.reduce((acc, i) => acc + i.balanceDue, 0)
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500">
            Record incoming settlements and track overdue balances to prevent revenue leakage.
          </p>
        </div>

        <button
          onClick={() => {
            const unpaid = invoices.find((i) => i.balanceDue > 0)
            if (unpaid) {
              setSelectedInvoiceId(unpaid.id)
              setAmount(unpaid.balanceDue)
            }
            setModalOpen(true)
          }}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Top Cash Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Cash Collected</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${totalCollected.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Matched and settled into bank ledger</p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Overdue Balance</span>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            ${totalOverdue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {overdueInvoices.length} invoices requiring follow-up
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Collection Rate</span>
          <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            97.6%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Automated on-time settlement rate</p>
        </div>
      </div>

      {/* Overdue alert if any */}
      {overdueInvoices.length > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Invoice {overdueInvoices[0].invoiceNumber} for {overdueInvoices[0].customerCompany} is
              overdue (${overdueInvoices[0].balanceDue.toLocaleString()}).
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedInvoiceId(overdueInvoices[0].id)
              setAmount(overdueInvoices[0].balanceDue)
              setModalOpen(true)
            }}
            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1 transition-colors"
          >
            <span>Settle</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Recorded Transactions
          </h3>
          <span className="text-xs text-slate-400 font-mono">{payments.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Payment #</th>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Reference</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                    {p.paymentNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {p.customerName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{p.paymentDate}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {p.referenceId || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    +${p.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Payment"
        description="Match funds against an open customer invoice and update ledger."
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Invoice to Settle
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} • {inv.customerCompany} • Total ${inv.totalAmount} (Due: $
                  {inv.balanceDue}) [{inv.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Stripe">Stripe Gateway</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer (SWIFT / NEFT)</option>
                <option value="UPI / Instant">UPI / Instant</option>
                <option value="Manual / Cash">Manual / Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Amount Received ($)
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reference / Bank UTR
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="TX-849204"
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Internal Note
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="SWIFT wire confirmed by finance lead"
              className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
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
              Confirm Settlement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
