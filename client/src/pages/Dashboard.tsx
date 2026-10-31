import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { FinanceSummary, Subscription, Invoice } from '@shared/contracts/subscriptions.js'
import {
  DollarSign,
  TrendingUp,
  Repeat,
  AlertTriangle,
  CreditCard,
  Zap,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import axios from 'axios'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [recentSubs, setRecentSubs] = useState<Subscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [billingRunning, setBillingRunning] = useState<boolean>(false)
  const [billingMsg, setBillingMsg] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [sumRes, subsRes, invsRes] = await Promise.all([
        axios.get('/api/finance/summary').catch(() => null),
        axios.get('/api/subscriptions').catch(() => null),
        axios.get('/api/invoices').catch(() => null),
      ])

      if (sumRes?.data?.data) setSummary(sumRes.data.data)
      if (subsRes?.data?.data) setRecentSubs(subsRes.data.data)
      if (invsRes?.data?.data) setInvoices(invsRes.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRunBilling = async () => {
    setBillingRunning(true)
    try {
      const res = await axios.post('/api/invoices/generate-billing')
      setBillingMsg(res.data.message || 'Billing cycle executed.')
      await fetchData()
      setTimeout(() => setBillingMsg(null), 4000)
    } finally {
      setBillingRunning(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200'
      case 'Quotation':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200'
      case 'Draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
      case 'Closed':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {billingMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 text-xs font-medium shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{billingMsg}</span>
        </div>
      )}

      {/* Clean Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Welcome,</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role === 'admin'
              ? 'Full administrative control over subscription models, product variants, and tax parameters.'
              : user?.role === 'staff'
              ? 'Operational sales workspace: quotations to subscription lifecycle and billing day automation.'
              : 'Customer client account portal with active recurring plans and invoice records.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role !== 'customer' && (
            <button
              onClick={handleRunBilling}
              disabled={billingRunning}
              className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Zap className={`w-3.5 h-3.5 ${billingRunning ? 'animate-spin' : ''}`} />
              <span>{billingRunning ? 'Running...' : 'Run Billing Cycle'}</span>
            </button>
          )}

          <Link
            to={user?.role === 'customer' ? '/portal' : '/subscriptions'}
            className="px-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>{user?.role === 'customer' ? 'My Portal' : 'Subscriptions'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ${summary?.mrr?.toLocaleString() || '18,450'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+{summary?.monthlyGrowthRatePercent || 14.8}% monthly growth</span>
          </div>
        </div>

        {/* ARR */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Annualized Run Rate</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ${summary?.arr?.toLocaleString() || '221,400'}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Contracted annualized pace</p>
        </div>

        {/* Active Subscriptions */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Subscriptions</span>
            <Repeat className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {summary?.activeSubscriptionsCount || 142}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total accounts on recurring terms</p>
        </div>

        {/* Overdue Amount */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Overdue Invoices</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            ${summary?.outstandingOverdueAmount?.toLocaleString() || '5,310'}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {summary?.overdueInvoicesCount || 1} invoice pending chase
          </p>
        </div>
      </div>

      {/* Main Split: Subscriptions Table + Overdue Invoices List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Subscriptions Ledger */}
        <div className="lg:col-span-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Recent Subscriptions
            </h3>
            <Link
              to="/subscriptions"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Subscription #</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Plan</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSubs.slice(0, 5).map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => navigate('/subscriptions')}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{sub.customerName}</p>
                      <p className="text-[11px] text-slate-400">{sub.customerCompany}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-700 dark:text-slate-300">{sub.planName}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{sub.billingFrequency}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      ${sub.grandTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Invoices Tracker */}
        <div className="lg:col-span-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Invoices & Overdue
              </h3>
              <Link
                to="/invoices"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Invoices
              </Link>
            </div>

            <div className="p-4 space-y-2.5">
              {invoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-medium text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : inv.status === 'Overdue'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{inv.customerCompany}</p>
                    <p className="text-[10px] text-slate-400">Due: {inv.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">
                      ${inv.totalAmount.toLocaleString()}
                    </p>
                    {inv.balanceDue > 0 && (
                      <p className="text-[10px] text-red-600 font-semibold">
                        Due: ${inv.balanceDue.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => navigate('/payments')}
              className="w-full py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Settlement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
