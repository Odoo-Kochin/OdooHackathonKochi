import React, { useState, useEffect } from 'react'
import type { PaymentRecord, Invoice, PaymentMethod } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import {
  Plus,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import axios from 'axios'

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Payment form state per Scene 6
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Scene 6: The Money Comes In
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Payments Collection & Cash Flow
          </h2>
          <p className="text-xs text-slate-500">
            Record payments across Stripe, Cards, SWIFT Wire and Bank transfers. Never let overdue
            turn into lost revenue.
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
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Top Cash Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Cash Collected
          </span>
          <h3 className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalCollected.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Confirmed payments settled into accounts</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overdue Balance
          </span>
          <h3 className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
            ${totalOverdue.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {overdueInvoices.length} invoices needing customer chase
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Settlement Reliability
          </span>
          <h3 className="mt-2 text-3xl font-black text-indigo-600 dark:text-indigo-400">
            97.6%
          </h3>
          <p className="text-xs text-slate-500 mt-1">On-time recurring collection rate</p>
        </div>
      </div>

      {/* Overdue Warning Alert if any exists */}
      {overdueInvoices.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Action Required: Overdue Invoices Flagged</h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300">
                Invoice {overdueInvoices[0].invoiceNumber} for {overdueInvoices[0].customerCompany} is
                past due (${overdueInvoices[0].balanceDue.toLocaleString()}).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedInvoiceId(overdueInvoices[0].id)
              setAmount(overdueInvoices[0].balanceDue)
              setModalOpen(true)
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors self-end sm:self-auto"
          >
            <span>Settle Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Payments History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recorded Settlements Ledger
          </h3>
          <span className="text-xs text-slate-400 font-mono">{payments.length} transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2">Payment ID</th>
                <th className="pb-3">Invoice #</th>
                <th className="pb-3">Customer & Payer</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Reference / Notes</th>
                <th className="pb-3 pr-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 pl-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {p.paymentNumber}
                  </td>
                  <td className="py-4 font-mono font-medium">{p.invoiceNumber}</td>
                  <td className="py-4 font-semibold text-slate-900 dark:text-white">
                    {p.customerName}
                  </td>
                  <td className="py-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500">{p.paymentDate}</td>
                  <td className="py-4 text-slate-500 max-w-xs truncate">
                    {p.referenceId ? `Ref: ${p.referenceId}` : ''} {p.notes ? `• ${p.notes}` : ''}
                  </td>
                  <td className="py-4 pr-2 text-right font-black text-emerald-600 dark:text-emerald-400">
                    +${p.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Incoming Payment"
        description="Match funds against an outstanding customer invoice and update ledger."
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Select Invoice to Settle
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} • {inv.customerCompany} • Total ${inv.totalAmount} (Due: $
                  {inv.balanceDue}) [{inv.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Stripe">Stripe Gateway</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer (SWIFT / NEFT)</option>
                <option value="UPI / Instant">UPI / Instant Settlement</option>
                <option value="Manual / Cash">Manual / Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Amount Received ($)
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Gateway Reference / Bank UTR
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="ch_3OdooKochiLive999"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Internal Reconciliation Note
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="SWIFT wire confirmed by finance lead"
              className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
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
              Confirm & Settle Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
