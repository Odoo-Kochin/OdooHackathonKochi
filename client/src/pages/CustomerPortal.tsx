import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { Subscription, Invoice } from '@shared/contracts/subscriptions.js'
import { Download, ToggleLeft, ToggleRight } from 'lucide-react'
import axios from 'axios'

export const CustomerPortal: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  // Self-service toggles
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
    toast.success(
      'Add-on Setting Updated',
      `${name} has been ${updated ? 'activated and added to' : 'removed from'} your next recurring invoice.`
    )
  }

  const primarySub = subscriptions[0]

  return (
    <div className="space-y-4">

      {/* Account Info Banner */}
      <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {user?.company || 'Acme Retail & Logistics'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Active Client Account
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your subscription tier, toggle business add-ons, and download PDF receipts.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Next Cycle</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {primarySub?.expiryDate || '2026-11-01'}
          </span>
        </div>
      </div>

      {/* Active Subscription Details Card */}
      {primarySub && (
        <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {primarySub.subscriptionNumber}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {primarySub.planName}
              </h3>
              <p className="text-xs text-slate-500">
                Billed {primarySub.billingFrequency} via {primarySub.paymentTerms}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                ${primarySub.grandTotal.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 ml-1">/{primarySub.billingFrequency}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Subscribed Product Items
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primarySub.lineItems.map((li) => (
                <div
                  key={li.id}
                  className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{li.productName}</p>
                    {li.variantName && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                        {li.variantName}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ${li.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Self-service Add-Ons */}
      <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Self-Service Business Add-Ons
          </h3>
          <p className="text-xs text-slate-500">
            Turn services on and off. Adjustments are reflected automatically on your next billing invoice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  24/7 Dedicated Support
                </span>
                <button
                  onClick={() => toggleAddon('support', '24/7 Dedicated Support')}
                  className="text-indigo-600 focus:outline-none"
                >
                  {addons.support ? (
                    <ToggleRight className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                15-minute SLA response time with dedicated engineer support.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">+$300 /month</span>
              <span className={`font-semibold ${addons.support ? 'text-emerald-600' : 'text-slate-400'}`}>
                {addons.support ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Automated Tax Engine
                </span>
                <button
                  onClick={() => toggleAddon('taxEngine', 'Automated Tax Engine')}
                  className="text-indigo-600 focus:outline-none"
                >
                  {addons.taxEngine ? (
                    <ToggleRight className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Regional GST/VAT compliance rules and monthly tax ledger exports.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">+$150 /month</span>
              <span className={`font-semibold ${addons.taxEngine ? 'text-emerald-600' : 'text-slate-400'}`}>
                {addons.taxEngine ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Payment Webhook Sync
                </span>
                <button
                  onClick={() => toggleAddon('webhooks', 'Payment Webhook Sync')}
                  className="text-indigo-600 focus:outline-none"
                >
                  {addons.webhooks ? (
                    <ToggleRight className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Instant settlement callbacks for external accounting systems.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">+$80 /month</span>
              <span className={`font-semibold ${addons.webhooks ? 'text-emerald-600' : 'text-slate-400'}`}>
                {addons.webhooks ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Invoice History & Receipts
          </h3>
        </div>

        <div className="p-4 space-y-2.5">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-slate-900 dark:text-white">
                    {inv.invoiceNumber}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Issued: {inv.issueDate} • Due: {inv.dueDate}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">
                    ${inv.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {inv.balanceDue > 0 ? `Due: $${inv.balanceDue}` : 'Fully Settled'}
                  </p>
                </div>

                <button
                  onClick={() =>
                    toast.success(
                      'Receipt Downloaded',
                      `PDF invoice receipt for ${inv.invoiceNumber} has been saved.`
                    )
                  }
                  className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
