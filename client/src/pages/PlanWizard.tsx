import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Layers,
  Calendar,
  Settings2,
  FileCheck,
  ShieldCheck,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/context/ToastContext'
import type { SubscriptionPlan, Product } from '@shared/contracts/subscriptions'

const STEPS = [
  {
    number: 1,
    title: 'Plan Identification',
    description: 'Name, SKU code & core software tier',
    icon: Layers,
  },
  {
    number: 2,
    title: 'Pricing & Cadence',
    description: 'Interval, base rate & license quantity',
    icon: Calendar,
  },
  {
    number: 3,
    title: 'Lifecycle Policies',
    description: 'Auto-closure, pauses & renewal terms',
    icon: Settings2,
  },
  {
    number: 4,
    title: 'Review & Publish',
    description: 'Verification & deployment to catalog',
    icon: FileCheck,
  },
]

export const PlanWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  const [products, setProducts] = useState<Product[]>([])

  // Form State
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [productId, setProductId] = useState('')
  const [description, setDescription] = useState('')

  const [price, setPrice] = useState(299)
  const [billingFrequency, setBillingFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [minimumQuantity, setMinimumQuantity] = useState(1)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')

  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false)
  const [canBeClosedEarly, setCanBeClosedEarly] = useState(true)
  const [canBePaused, setCanBePaused] = useState(true)
  const [canBeRenewed, setCanBeRenewed] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await fetch('/api/products').then((r) => r.json())
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data)
          if (!isEdit && prodRes.data.length > 0) {
            setProductId(prodRes.data[0].id)
          }
        }

        if (isEdit && id) {
          const planRes = await fetch(`/api/plans/${id}`).then((r) => r.json())
          if (planRes.success && planRes.data) {
            const p: SubscriptionPlan = planRes.data
            setName(p.name)
            setCode(p.code)
            setProductId(p.productId)
            setDescription(p.description || '')
            setPrice(p.price)
            setBillingFrequency(p.billingFrequency)
            setMinimumQuantity(p.minimumQuantity)
            setStartDate(p.startDate)
            setEndDate(p.endDate || '')
            setAutoCloseOnEnd(p.autoCloseOnEnd)
            setCanBeClosedEarly(p.canBeClosedEarly)
            setCanBePaused(p.canBePaused)
            setCanBeRenewed(p.canBeRenewed)
          } else {
            toast.error('Plan Not Found', 'Could not locate subscription plan details.')
            navigate('/plans')
          }
        }
      } catch (err) {
        toast.error('Fetch Error', 'Failed to retrieve product catalog.')
      } finally {
        setFetching(false)
      }
    }

    loadData()
  }, [id, isEdit, navigate, toast])

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('Validation Error', 'Plan Name is required.')
        return false
      }
      if (!code.trim()) {
        toast.error('Validation Error', 'Plan SKU / Code is required.')
        return false
      }
    }
    if (step === 2) {
      if (price <= 0) {
        toast.error('Validation Error', 'Price must be greater than 0.')
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

  const handleSubmit = async () => {
    setLoading(true)
    const selectedProd = products.find((p) => p.id === productId) || products[0]

    const payload = {
      name,
      code,
      productId: selectedProd ? selectedProd.id : 'prod-01',
      productName: selectedProd ? selectedProd.name : 'Brightloop Core',
      price: Number(price),
      billingFrequency,
      minimumQuantity: Number(minimumQuantity),
      startDate,
      endDate: endDate ? endDate : undefined,
      autoCloseOnEnd,
      canBeClosedEarly,
      canBePaused,
      canBeRenewed,
      description,
      isActive: true,
    }

    try {
      const url = isEdit ? `/api/plans/${id}` : '/api/plans'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(
          isEdit ? 'Plan Template Updated' : 'Plan Template Created',
          `Plan "${data.data.name}" (${data.data.billingFrequency}) is now active in the catalog.`
        )
        navigate('/plans')
      } else {
        toast.error('Save Failed', data.message || 'Could not save subscription plan.')
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
        <p className="mt-3 text-sm text-slate-500">Loading plan configuration...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/plans"
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {isEdit ? 'Modify Template' : 'Plan Architect'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500">
                Step {currentStep} of {STEPS.length}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isEdit ? `Edit Subscription Plan: ${name}` : 'Configure New Subscription Plan'}
            </h1>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/plans')}>
          Cancel
        </Button>
      </div>

      {/* Stepper Visualizer */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.number
            const isCurrent = currentStep === step.number
            const Icon = step.icon

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => {
                  if (step.number < currentStep || (step.number === currentStep + 1 && validateStep(currentStep))) {
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
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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

      {/* STEP 1: IDENTITY */}
      {currentStep === 1 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Plan Identification & Product Linkage
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify the plan branding, SKU identifier, and the underlying SaaS product bundle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Plan Display Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Cloud Suite"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Plan Code / SKU *
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. PLAN-ENT-YEARLY"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Underlying Software Product
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.salesPrice} base)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Public Plan Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight key inclusions, SLAs, or target client size..."
                className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PRICING & INTERVAL */}
      {currentStep === 2 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Pricing Schedule & Recurring Cadence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Determine recurring billing frequency and base license price.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Billing Frequency
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="yearly">Yearly Recurring</option>
                <option value="weekly">Weekly Recurring</option>
                <option value="daily">Daily Micro-Billing</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Base Recurring Price ($) *
              </label>
              <Input
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                placeholder="450"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Minimum Seat Requirement
              </label>
              <Input
                type="number"
                min="1"
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(Number(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Catalog Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Catalog Expiration Date (Optional)
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: POLICIES */}
      {currentStep === 3 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Subscription Lifecycle & Enforcement Rules
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforce business rules for plan termination, pauses, and renewals.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-border">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Allow Early Closure
                </p>
                <p className="text-xs text-slate-500">
                  Customer or admin can terminate the contract before the term end date.
                </p>
              </div>
              <input
                type="checkbox"
                checked={canBeClosedEarly}
                onChange={(e) => setCanBeClosedEarly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Allow Temporary Pause
                </p>
                <p className="text-xs text-slate-500">
                  Subscribers may pause billing and service access for seasonal hiatus.
                </p>
              </div>
              <input
                type="checkbox"
                checked={canBePaused}
                onChange={(e) => setCanBePaused(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Automatic Renewal Permitted
                </p>
                <p className="text-xs text-slate-500">
                  Permits seamless rollover into the next billing cycle upon invoice settlement.
                </p>
              </div>
              <input
                type="checkbox"
                checked={canBeRenewed}
                onChange={(e) => setCanBeRenewed(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Auto-Close at End Date
                </p>
                <p className="text-xs text-slate-500">
                  If enabled, contract status automatically transitions to 'Closed' at expiration.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoCloseOnEnd}
                onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW */}
      {currentStep === 4 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Review Plan Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm all plan parameters before publishing to the live catalog.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Plan Name</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{name}</p>
              <p className="text-slate-500 font-mono">{code}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Pricing & Cadence</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                ${price} / {billingFrequency}
              </p>
              <p className="text-slate-500">Min seats: {minimumQuantity}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Policies</p>
              <p className="text-slate-700 dark:text-slate-300 mt-1">
                Early close: {canBeClosedEarly ? 'Yes' : 'No'}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Pause allowed: {canBePaused ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Lifecycle</p>
              <p className="text-slate-700 dark:text-slate-300 mt-1">
                Auto-renewal: {canBeRenewed ? 'Yes' : 'No'}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Auto-close: {autoCloseOnEnd ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {description && (
            <div className="p-3 rounded-md bg-muted/40 border border-border text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Description: </span>
              {description}
            </div>
          )}
        </div>
      )}

      {/* Stepper Navigation Footer */}
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
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-1.5" />}
              {isEdit ? 'Update Plan Template' : 'Deploy Plan to Catalog'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
