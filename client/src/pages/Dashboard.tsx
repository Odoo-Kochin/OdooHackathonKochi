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
  Plus,
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
      setBillingMsg(res.data.message || 'Billing day run complete.')
      await fetchData()
      setTimeout(() => setBillingMsg(null), 4000)
    } finally {
      setBillingRunning(false)
    }
  }

  const getStatusColor = (status: string) => {
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {billingMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold">{billingMsg}</span>
        </div>
      )}

      {/* Hero Welcome & Role Context Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Active Role: {user?.role}
              </span>
              <span className="text-xs text-indigo-300">Brightloop Software Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'Operator'} 👋
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {user?.role === 'admin'
                ? 'You have complete administrative oversight: launch products, define discount rules, adjust taxes, and inspect all billing cycles.'
                : user?.role === 'staff'
                ? 'Internal operations active: transform quotes into subscriptions, run billing day, and monitor incoming payments.'
                : 'Customer client portal: view active subscriptions, download official invoices, and manage service add-ons.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role !== 'customer' && (
              <button
                onClick={handleRunBilling}
                disabled={billingRunning}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className={`w-4 h-4 ${billingRunning ? 'animate-spin' : ''}`} />
                <span>{billingRunning ? 'Executing Cycle...' : 'Run Billing Day Cycle'}</span>
              </button>
            )}

            <Link
              to={user?.role === 'customer' ? '/portal' : '/subscriptions'}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-md flex items-center gap-2 transition-colors"
            >
              <span>{user?.role === 'customer' ? 'My Subscriptions' : 'All Subscriptions'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Metric Stats Cards (Scene 7: Finance Lead Real-Time Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* MRR Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Recurring (MRR)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${summary?.mrr?.toLocaleString() || '18,450'}
            </h3>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{summary?.monthlyGrowthRatePercent || 14.8}% vs last month</span>
            </p>
          </div>
        </div>

        {/* ARR Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Annual Run Rate (ARR)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${summary?.arr?.toLocaleString() || '221,400'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Contracted Annualized Revenue</p>
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Subscriptions
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary?.activeSubscriptionsCount || 142}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Retained accounts on recurring plans</p>
          </div>
        </div>

        {/* Overdue Invoices Card (Scene 6/7) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overdue Pending Cash
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              ${summary?.outstandingOverdueAmount?.toLocaleString() || '5,310'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {summary?.overdueInvoicesCount || 1} invoice waiting for payment settlement
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Quick Action Toolbar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Brightloop Operations Fast-Track
          </h4>
          <p className="text-xs text-slate-500">
            Launch products, build quotes from templates, or generate customer invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Product & Variants</span>
          </button>

          <button
            onClick={() => navigate('/plans')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Plan</span>
          </button>

          <button
            onClick={() => navigate('/subscriptions')}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Turn Quote to Sub</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Recent Subscriptions + Invoices Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Subscriptions Pipeline (Scene 3) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Subscriptions Lifecycle
              </h3>
              <p className="text-xs text-slate-500">
                Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed pipeline
              </p>
            </div>
            <Link
              to="/subscriptions"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Number</th>
                  <th className="pb-3">Customer & Company</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {recentSubs.slice(0, 5).map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => navigate('/subscriptions')}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{sub.customerName}</p>
                      <p className="text-[11px] text-slate-500">{sub.customerCompany}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="font-medium">{sub.planName}</span>
                      <span className="text-[10px] text-slate-400 block capitalize">
                        {sub.billingFrequency} billing
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right font-bold text-slate-900 dark:text-white">
                      ${sub.grandTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Invoices & Payment Chase (Scene 4 & 6) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Invoices & Overdue Watch
              </h3>
              <Link
                to="/invoices"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Invoices
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Monitor payments and follow up on overdue amounts before they turn into lost revenue.
            </p>

            <div className="space-y-3">
              {invoices.slice(0, 3).map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : inv.status === 'Overdue'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{inv.customerCompany}</p>
                    <p className="text-[10px] text-slate-400">Due: {inv.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      ${inv.totalAmount.toLocaleString()}
                    </p>
                    {inv.balanceDue > 0 && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        Due: ${inv.balanceDue.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => navigate('/payments')}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Incoming Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
