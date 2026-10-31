import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Building,
  User,
  Mail,
  Layers,
  Calendar,
  Sparkles,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Loader2,
  ChevronRight,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/context/ToastContext'
import type { Subscription, SubscriptionPlan, Product, DiscountRule } from '@shared/contracts/subscriptions'

const STEPS = [
  {
    number: 1,
    title: 'Customer & Account',
    description: 'Contract party details & billing address',
    icon: User,
  },
  {
    number: 2,
    title: 'Plan & Billing Cadence',
    description: 'Subscription tier, interval & policies',
    icon: Layers,
  },
  {
    number: 3,
    title: 'Seats & Modules',
    description: 'User licenses, Odoo sync & discounts',
    icon: Sparkles,
  },
  {
    number: 4,
    title: 'Review & Quotation',
    description: 'Financial schedule, taxes & authorization',
    icon: FileCheck,
  },
]

export const SubscriptionWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  // Catalog data
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [discounts, setDiscounts] = useState<DiscountRule[]>([])

  // Form State
  const [customerName, setCustomerName] = useState('David Miller')
  const [customerEmail, setCustomerEmail] = useState('david@acmeretail.com')
  const [customerCompany, setCustomerCompany] = useState('Acme Retail Corp')
  const [paymentTerms, setPaymentTerms] = useState('Immediate')
  const [billingCountry, setBillingCountry] = useState('India (IN)')

  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [billingFrequency, setBillingFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false)
  const [quotationValidityDays, setQuotationValidityDays] = useState(15)

  const [seats, setSeats] = useState(5)
  const [includeOdooSync, setIncludeOdooSync] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountRule | null>(null)
  const [notes, setNotes] = useState('Standard enterprise subscription agreement.')

  // Fetch plans, products, discounts and prefill if edit mode
  useEffect(() => {
    async function initData() {
      try {
        const [plansRes, prodsRes, discRes] = await Promise.all([
          fetch('/api/plans').then((r) => r.json()),
          fetch('/api/products').then((r) => r.json()),
          fetch('/api/discounts').then((r) => r.json()),
        ])

        if (plansRes.success && plansRes.data) {
          setPlans(plansRes.data)
          if (!isEdit && plansRes.data.length > 0) {
            setSelectedPlanId(plansRes.data[0].id)
          }
        }
        if (prodsRes.success && prodsRes.data) {
          setProducts(prodsRes.data)
        }
        if (discRes.success && discRes.data) {
          setDiscounts(discRes.data)
        }

        if (isEdit && id) {
          const subRes = await fetch(`/api/subscriptions/${id}`).then((r) => r.json())
          if (subRes.success && subRes.data) {
            const sub: Subscription = subRes.data
            setCustomerName(sub.customerName)
            setCustomerEmail(sub.customerEmail)
            setCustomerCompany(sub.customerCompany)
            setPaymentTerms(sub.paymentTerms)
            setSelectedPlanId(sub.planId)
            setBillingFrequency(sub.billingFrequency)
            setQuotationValidityDays(sub.quotationValidityDays || 15)
            setNotes(sub.notes || '')

            // Extract seat count & odoo sync from line items
            const primaryItem = sub.lineItems[0]
            if (primaryItem) {
              setSeats(primaryItem.quantity)
            }
            const hasOdoo = sub.lineItems.some((li) => li.variantName?.includes('Odoo') || li.productName.includes('Odoo'))
            setIncludeOdooSync(hasOdoo)
          } else {
            toast.error('Subscription Not Found', 'Could not load existing subscription details.')
            navigate('/subscriptions')
          }
        }
      } catch (err) {
        toast.error('Data Fetch Error', 'Failed to load subscription catalog data.')
      } finally {
        setFetching(false)
      }
    }

    initData()
  }, [id, isEdit, navigate, toast])

  // Calculation logic
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0]
  const basePricePerSeat = selectedPlan ? selectedPlan.price : 450
  const seatsCost = basePricePerSeat * seats
  const odooSyncCost = includeOdooSync ? 560 : 0
  const rawSubtotal = seatsCost + odooSyncCost

  // Discount calculation
  let discountAmount = 0
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = (rawSubtotal * appliedDiscount.value) / 100
    } else {
      discountAmount = Math.min(rawSubtotal, appliedDiscount.value)
    }
  }

  const netSubtotal = Math.max(0, rawSubtotal - discountAmount)
  const taxRate = 18 // standard 18% GST
  const taxAmount = Math.round(((netSubtotal * taxRate) / 100) * 100) / 100
  const grandTotal = Math.round((netSubtotal + taxAmount) * 100) / 100

  // Apply discount coupon
  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      toast.warning('Empty Coupon', 'Please enter a discount coupon code.')
      return
    }
    const matched = discounts.find(
      (d) => d.code.toLowerCase() === discountCode.trim().toLowerCase() && d.isActive
    )
    if (matched) {
      if (matched.minimumQuantity && seats < matched.minimumQuantity) {
        toast.warning(
          'Threshold Not Met',
          `Coupon ${matched.code} requires a minimum of ${matched.minimumQuantity} user seats.`
        )
        return
      }
      setAppliedDiscount(matched)
      toast.success('Discount Applied!', `Applied ${matched.description || matched.code} (${matched.value}${matched.type === 'percentage' ? '%' : '$'} off).`)
    } else {
      toast.error('Invalid Coupon', `Discount code "${discountCode}" is invalid or expired.`)
    }
  }

  // Step Validation
  const validateStep = (step: number) => {
    if (step === 1) {
      if (!customerName.trim() || !customerEmail.trim()) {
        toast.error('Validation Error', 'Customer Name and Email are required.')
        return false
      }
      if (!customerEmail.includes('@')) {
        toast.error('Validation Error', 'Please enter a valid email address.')
        return false
      }
    }
    if (step === 2) {
      if (!selectedPlanId && plans.length > 0) {
        toast.error('Validation Error', 'Please select a subscription plan.')
        return false
      }
    }
    if (step === 3) {
      if (seats < 1) {
        toast.error('Validation Error', 'At least 1 user license seat is required.')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Submit Handler
  const handleSubmit = async (targetStatus: 'Quotation' | 'Active') => {
    setLoading(true)

    const lineItems = [
      {
        id: `sli-${Date.now()}-core`,
        productId: selectedPlan?.productId || products[0]?.id || 'prod-01',
        productName: `${selectedPlan?.productName || 'Brightloop Core'} (${seats} seats)`,
        variantName: selectedPlan?.name,
        quantity: seats,
        unitPrice: basePricePerSeat,
        taxRatePercent: 18,
        discountAmount: appliedDiscount ? discountAmount : 0,
        subtotal: seatsCost,
        total: seatsCost - discountAmount,
      },
    ]

    if (includeOdooSync) {
      lineItems.push({
        id: `sli-${Date.now()}-odoo`,
        productId: 'prod-01',
        productName: 'Brightloop Core ERP (Odoo Edition Integration)',
        variantName: 'Odoo Edition',
        quantity: 1,
        unitPrice: 560,
        taxRatePercent: 18,
        discountAmount: 0,
        subtotal: 560,
        total: 560,
      })
    }

    const payload = {
      customerName,
      customerEmail,
      customerCompany,
      planId: selectedPlan?.id || 'plan-monthly-pro',
      planName: selectedPlan?.name || 'Growth Pro',
      billingFrequency,
      status: targetStatus,
      paymentTerms,
      quotationValidityDays,
      lineItems,
      subtotal: rawSubtotal,
      discountTotal: discountAmount,
      taxTotal: taxAmount,
      grandTotal,
      notes,
    }

    try {
      const url = isEdit ? `/api/subscriptions/${id}` : '/api/subscriptions'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(
          isEdit ? 'Subscription Updated!' : 'Quotation Generated!',
          isEdit
            ? `Changes to ${data.data.subscriptionNumber} have been saved.`
            : `Quotation ${data.data.subscriptionNumber} created with total $${grandTotal}.`
        )
        navigate('/subscriptions')
      } else {
        toast.error('Save Failed', data.message || 'Could not save subscription record.')
      }
    } catch (err) {
      toast.error('Network Error', 'Failed to communicate with the server.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-slate-500">Loading subscription specification...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/subscriptions"
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {isEdit ? 'Modify Contract' : 'Quotation Engine'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500">
                Step {currentStep} of {STEPS.length}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isEdit ? `Edit Subscription #${id}` : 'Create New Subscription Quotation'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/subscriptions')}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Stepper Timeline Visualizer */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.number
            const isCurrent = currentStep === step.number
            const Icon = step.icon

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => {
                  // Only allow jumping back to earlier steps or next step if valid
                  if (step.number < currentStep) {
                    setCurrentStep(step.number)
                  } else if (step.number === currentStep + 1 && validateStep(currentStep)) {
                    setCurrentStep(step.number)
                  }
                }}
                disabled={step.number > currentStep + 1}
                className={`flex items-start gap-3 text-left transition-all p-2 rounded-md ${
                  isCurrent
                    ? 'bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                } ${step.number > currentStep + 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    Step {step.number}
                  </p>
                  <p
                    className={`text-sm font-medium truncate ${
                      isCurrent ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: CUSTOMER & ACCOUNT DETAILS */}
      {currentStep === 1 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Customer Identification & Invoicing Entity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify the legal entity and billing contact to which recurring invoices will be dispatched.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Primary Contact Name *
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Billing Email Address *
              </label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. billing@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-primary" /> Company / Organization Name
              </label>
              <Input
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="e.g. Acme Corporation Ltd"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Immediate">Immediate / Due on Receipt</option>
                <option value="Net 15">Net 15 (15 Days)</option>
                <option value="Net 30">Net 30 (30 Days)</option>
                <option value="Net 60">Net 60 (Enterprise)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tax Jurisdiction / Country
              </label>
              <select
                value={billingCountry}
                onChange={(e) => setBillingCountry(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="India (IN)">India (IN) — GST 18% Applicable</option>
                <option value="United States (US)">United States (US) — Zero-rated Export</option>
                <option value="European Union (EU)">European Union (EU) — Reverse Charge</option>
                <option value="United Kingdom (UK)">United Kingdom (UK) — International</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quotation Validity Window
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={quotationValidityDays}
                  onChange={(e) => setQuotationValidityDays(Number(e.target.value) || 15)}
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">days from issue</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PLAN & RECURRING CADENCE */}
      {currentStep === 2 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Subscription Plan & Recurring Cadence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the pricing tier and billing interval that governs invoice frequency and renewal rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10'
                      : 'border-border hover:border-slate-300 dark:hover:border-slate-700 bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={isSelected ? 'default' : 'outline'}>
                      {plan.billingFrequency.toUpperCase()}
                    </Badge>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      ${plan.price}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {plan.description || 'Enterprise grade cloud infrastructure with priority SLA.'}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Billing Frequency
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="monthly">Monthly Recurring (Default)</option>
                <option value="yearly">Yearly Recurring (Best Value)</option>
                <option value="weekly">Weekly Recurring</option>
                <option value="daily">Daily Micro-Billing</option>
              </select>
            </div>

            <div className="space-y-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCloseOnEnd}
                  onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Auto-close subscription at end date (Do not auto-renew)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6">
                When checked, access will automatically lapse upon completion of the paid term.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SEATS, ADD-ONS & DISCOUNT RULES */}
      {currentStep === 3 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              User Licenses, Modules & Applied Promotions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure active seat volume, sync integrations, and coupon discount codes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seat Count */}
            <div className="p-4 rounded-lg border border-border bg-background space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    User Seat Allocation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Base license price: ${basePricePerSeat} / seat / {billingFrequency}
                  </p>
                </div>
                <Badge variant="outline" className="font-mono">
                  ${seatsCost} / {billingFrequency}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
                  className="text-center font-bold text-base max-w-[100px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSeats((s) => s + 1)}
                >
                  +
                </Button>
                <span className="text-xs text-slate-500">Active users</span>
              </div>
            </div>

            {/* Odoo ERP Sync Add-on */}
            <div className="p-4 rounded-lg border border-border bg-background space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Odoo ERP Integration Sync
                  </h3>
                  <p className="text-xs text-slate-500">
                    Two-way bi-directional synchronization with Odoo Community/Enterprise
                  </p>
                </div>
                <Badge variant={includeOdooSync ? 'default' : 'secondary'} className="font-mono">
                  +$560 / {billingFrequency}
                </Badge>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={includeOdooSync}
                  onChange={(e) => setIncludeOdooSync(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Enable Odoo Edition Integration Module
                </span>
              </label>
            </div>
          </div>

          {/* Discount Coupon Code */}
          <div className="p-4 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Promotional Coupon / Volume Discount
                </h3>
              </div>
              {appliedDiscount && (
                <Badge variant="default" className="bg-emerald-600">
                  Active: {appliedDiscount.code} (-${discountAmount})
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon (e.g. WELCOME10, ANNUAL15)"
                className="uppercase font-mono text-sm"
              />
              <Button type="button" size="sm" onClick={handleApplyDiscount}>
                Apply Code
              </Button>
              {appliedDiscount && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAppliedDiscount(null)
                    setDiscountCode('')
                    toast.info('Discount Removed', 'Pricing restored to standard rates.')
                  }}
                >
                  Remove
                </Button>
              )}
            </div>

            {/* Quick Available Coupons Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Available Promotions:</span>
              {discounts.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDiscountCode(d.code)
                    setAppliedDiscount(d)
                    toast.success('Applied Coupon', `Selected ${d.code} (${d.value}${d.type === 'percentage' ? '%' : '$'} off).`)
                  }}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary transition-colors"
                >
                  {d.code} ({d.value}{d.type === 'percentage' ? '%' : '$'})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & QUOTATION SUMMARY */}
      {currentStep === 4 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Quotation Review & Financial Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Carefully verify the contract specifications, tax computations, and billing schedule before confirmation.
            </p>
          </div>

          {/* Party Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Customer</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{customerName}</p>
              <p className="text-slate-500">{customerCompany}</p>
              <p className="text-slate-500">{customerEmail}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Cadence & Terms</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {selectedPlan?.name} ({billingFrequency})
              </p>
              <p className="text-slate-500">Payment: {paymentTerms}</p>
              <p className="text-slate-500">Quote Valid: {quotationValidityDays} days</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Jurisdiction</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{billingCountry}</p>
              <p className="text-slate-500">Tax Type: GST @ 18%</p>
              <p className="text-slate-500">Auto-close on end: {autoCloseOnEnd ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-4 text-left">Line Item Description</th>
                  <th className="py-2.5 px-4 text-center">Qty / Seats</th>
                  <th className="py-2.5 px-4 text-right">Unit Rate</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedPlan?.name} — User Licenses
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Brightloop Core SaaS engine recurring access
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center font-medium">{seats} seats</td>
                  <td className="py-3 px-4 text-right font-mono">${basePricePerSeat}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">${seatsCost}</td>
                </tr>

                {includeOdooSync && (
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Odoo ERP Integration Sync Module
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Bi-directional sync bridge for inventory and invoices
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">1 module</td>
                    <td className="py-3 px-4 text-right font-mono">$560</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">$560</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Computation Box */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contract Notes & Special Stipulations
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Include custom SLA stipulations or billing terms..."
              />
            </div>

            <div className="w-full sm:w-72 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (Net):</span>
                <span className="font-mono font-semibold">${rawSubtotal}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount ({appliedDiscount.code}):</span>
                  <span className="font-mono">-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Applicable GST (18%):</span>
                <span className="font-mono font-semibold">${taxAmount}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="font-mono text-primary text-base">${grandTotal}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-right">
                Billed {billingFrequency} • Inclusive of statutory taxes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stepper Navigation Footer Buttons */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {currentStep > 1 && (
            <Button type="button" variant="outline" size="sm" onClick={handleBack} disabled={loading}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back: Step {currentStep - 1}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStep < STEPS.length ? (
            <Button type="button" size="sm" onClick={handleNext}>
              Next: Step {currentStep + 1} <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSubmit('Quotation')}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                Save as Quotation
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSubmit('Active')}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-1.5" />}
                {isEdit ? 'Update & Confirm' : 'Confirm & Activate Subscription'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
