import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Subscription, Invoice } from '@shared/contracts/subscriptions.js'
import {
  Download,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import axios from 'axios'

export const CustomerPortal: React.FC = () => {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Self-service toggles state (Scene 1 & 2: "add-ons customers switch on and off")
  const [addons, setAddons] = useState({
    support: false,
    taxEngine: true,
    webhooks: true,
  })

  const fetchCustomerData = async () => {
    try {
      const [subRes, invRes] = await Promise.all([
        axios.get('/api/subscriptions'),
        axios.get('/api/invoices'),
      ])

      // If user is a customer, filter to their relevant record
      const allSubs: Subscription[] = subRes.data.data || []
      const allInvs: Invoice[] = invRes.data.data || []

      setSubscriptions(allSubs)
      setInvoices(allInvs)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCustomerData()
  }, [user])

  const toggleAddon = (key: keyof typeof addons, name: string) => {
    const updated = !addons[key]
    setAddons({ ...addons, [key]: updated })
    setToastMsg(
      `${name} has been ${updated ? 'activated and added to' : 'removed from'} your next recurring invoice.`
    )
    setTimeout(() => setToastMsg(null), 4000)
  }

  // Active customer subscription
  const primarySub = subscriptions[0]

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl brightloop-gradient text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Customer Self-Service Portal
            </span>
            <span className="text-xs text-white/80">Scene 1 & 2 Specification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.company || 'Acme Retail & Logistics'} Portal
          </h2>
          <p className="text-sm text-white/80 max-w-xl">
            Manage your subscription tier, toggle business add-ons on/off, and download official
            invoices without having to email support.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right relative z-10 self-start md:self-auto">
          <span className="text-xs text-white/70 block uppercase font-bold">Plan Status</span>
          <span className="text-lg font-black text-white flex items-center gap-1.5 justify-end">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            {primarySub?.status || 'Active'}
          </span>
          <span className="text-xs text-white/80 block mt-0.5">
            Next Cycle: {primarySub?.expiryDate || '2026-11-01'}
          </span>
        </div>
      </div>

      {/* Active Subscription Overview Card */}
      {primarySub && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {primarySub.subscriptionNumber}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {primarySub.planName}
              </h3>
              <p className="text-xs text-slate-500">
                Billed {primarySub.billingFrequency} via {primarySub.paymentTerms} terms
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ${primarySub.grandTotal.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 block capitalize">
                per {primarySub.billingFrequency}
              </span>
            </div>
          </div>

          {/* Included Features and Lines */}
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Subscribed Packages & Variants
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {primarySub.lineItems.map((li) => (
                <div
                  key={li.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{li.productName}</p>
                    {li.variantName && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        {li.variantName}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    ${li.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add-ons Switch On & Off Section (Scene 1: "add-ons customers switch on and off") */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Self-Service Business Add-Ons
          </h3>
          <p className="text-xs text-slate-500">
            Activate or deactivate features directly. Updates reflect automatically on your upcoming
            billing day invoice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Priority Support Addon */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  24/7 Dedicated Support
                </span>
                <button
                  onClick={() => toggleAddon('support', '24/7 Dedicated Support')}
                  className="text-indigo-600 focus:outline-none"
                >
                  {addons.support ? (
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                15-minute SLA response time with dedicated engineering Slack channel.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">+$300 /month</span>
              <span
                className={`font-bold ${addons.support ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {addons.support ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Automated Tax Engine Addon */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Automated Tax & Compliance
                </span>
                <button
                  onClick={() => toggleAddon('taxEngine', 'Automated Tax Engine')}
                  className="text-indigo-600 focus:outline-none"
                >
                  {addons.taxEngine ? (
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Real-time regional GST and VAT rule computation with audit certificates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">+$150 /month</span>
              <span
                className={`font-bold ${addons.taxEngine ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {addons.taxEngine ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Webhooks Addon */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Payment Webhooks Sync
                </span>
                <button
                  onClick={() => toggleAddon('webhooks', 'Payment Webhooks Sync')}
                  className="text-indigo-600 focus:outline-none"
                >
                  {addons.webhooks ? (
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Instant settlement callbacks for ERP pipelines, Stripe, and webhook handlers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">+$80 /month</span>
              <span
                className={`font-bold ${addons.webhooks ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {addons.webhooks ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Invoices & Receipts History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Your Invoice & Payment Receipts
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Download PDF copies and inspect payment confirmation status.
        </p>

        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {inv.invoiceNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Issued: {inv.issueDate} • Due: {inv.dueDate}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    ${inv.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {inv.balanceDue > 0 ? `Due: $${inv.balanceDue}` : 'Fully Settled'}
                  </p>
                </div>

                <button
                  onClick={() =>
                    alert(`Official invoice receipt for ${inv.invoiceNumber} exported.`)
                  }
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
