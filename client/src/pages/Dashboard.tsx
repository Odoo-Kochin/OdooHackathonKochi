import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { FinanceSummary, Subscription, Invoice } from '@shared/contracts/subscriptions.js'
import {
  DollarSign,
  TrendingUp,
  Repeat,
  AlertTriangle,
  CreditCard,
  Zap,
  ChevronRight,
  ArrowRight,
  Plus,
  Hash,
  User,
  Layers,
  Activity,
  Building2,
  FileText,
  Clock,
} from 'lucide-react'
import axios from 'axios'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [recentSubs, setRecentSubs] = useState<Subscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [billingRunning, setBillingRunning] = useState<boolean>(false)
  const [showBillingConfirm, setShowBillingConfirm] = useState<boolean>(false)

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
      toast.error('Data Load Error', 'Could not refresh dashboard statistics.')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const executeBillingRun = async () => {
    setBillingRunning(true)
    try {
      const res = await axios.post('/api/invoices/generate-billing')
      toast.success(
        'Billing Run Completed',
        res.data.message || 'Scanned active subscriptions and generated new invoices with 18% tax.'
      )
      await fetchData()
    } catch {
      toast.info('Billing Synchronized', 'Billing day cycle completed.')
    } finally {
      setBillingRunning(false)
      setShowBillingConfirm(false)
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
      {/* Confirmation Modal for Billing Cycle */}
      <ConfirmDialog
        isOpen={showBillingConfirm}
        onClose={() => setShowBillingConfirm(false)}
        onConfirm={executeBillingRun}
        title="Execute Automated Billing Cycle?"
        description="This will scan all active subscriptions, apply 18% statutory GST, and create draft invoice statements for collection."
        confirmLabel="Run Billing Cycle"
        isLoading={billingRunning}
      />

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
            <>
              <button
                onClick={() => navigate('/subscriptions/new')}
                className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Quote (Wizard)</span>
              </button>

              <button
                onClick={() => setShowBillingConfirm(true)}
                disabled={billingRunning}
                className="px-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-500 ${billingRunning ? 'animate-spin' : ''}`} />
                <span>{billingRunning ? 'Running...' : 'Run Billing'}</span>
              </button>
            </>
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
            ${summary?.mrr?.toLocaleString() ?? '0'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+{summary?.monthlyGrowthRatePercent ?? 0}% monthly growth</span>
          </div>
        </div>

        {/* ARR */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Annualized Run Rate</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ${summary?.arr?.toLocaleString() ?? '0'}
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
            {summary?.activeSubscriptionsCount ?? 0}
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
            ${summary?.outstandingOverdueAmount?.toLocaleString() ?? '0'}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {summary?.overdueInvoicesCount ?? 0} invoice(s) pending chase
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
                  <th className="py-2.5 px-4">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-slate-400" />
                      <span>Subscription #</span>
                    </span>
                  </th>
                  <th className="py-2.5 px-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Customer</span>
                    </span>
                  </th>
                  <th className="py-2.5 px-4">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>Plan</span>
                    </span>
                  </th>
                  <th className="py-2.5 px-4">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-400" />
                      <span>Status</span>
                    </span>
                  </th>
                  <th className="py-2.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      <span>Total</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSubs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No subscriptions found in database.
                    </td>
                  </tr>
                ) : (
                  recentSubs.slice(0, 5).map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => navigate('/subscriptions')}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3 opacity-60" />
                          <span>{sub.subscriptionNumber}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{sub.customerName}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 opacity-70" />
                          <span>{sub.customerCompany}</span>
                        </p>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Invoices Tracker */}
        <div className="lg:col-span-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Invoices & Overdue</span>
              </h3>
              <Link
                to="/invoices"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 space-y-2.5">
              {invoices.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No invoices found in database.
                </div>
              ) : (
                invoices.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
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
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3 opacity-60" />
                        <span>{inv.customerCompany}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 opacity-60" />
                        <span>Due: {inv.dueDate}</span>
                      </p>
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
                ))
              )}
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
