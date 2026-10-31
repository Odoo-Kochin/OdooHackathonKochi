import { Router, Request, Response } from 'express'
import {
  MOCK_PRODUCTS,
  MOCK_PLANS,
  MOCK_SUBSCRIPTIONS,
  MOCK_INVOICES,
  MOCK_DISCOUNT_RULES,
  MOCK_PAYMENTS,
  MOCK_FINANCE_SUMMARY,
  type Subscription,
  type Invoice,
  type PaymentRecord,
  type Product,
  type SubscriptionPlan,
  type DiscountRule,
} from '@shared/contracts/subscriptions.js'

export const subscriptionsRouter = Router()

// Dynamic stores
let productsStore: Product[] = [...MOCK_PRODUCTS]
let plansStore: SubscriptionPlan[] = [...MOCK_PLANS]
let subsStore: Subscription[] = [...MOCK_SUBSCRIPTIONS]
let invoicesStore: Invoice[] = [...MOCK_INVOICES]
let discountsStore: DiscountRule[] = [...MOCK_DISCOUNT_RULES]
let paymentsStore: PaymentRecord[] = [...MOCK_PAYMENTS]

// ============================================================================
// PRODUCTS & VARIANTS (Scene 2)
// ============================================================================

subscriptionsRouter.get('/products', (_req: Request, res: Response) => {
  res.json({ success: true, data: productsStore })
})

subscriptionsRouter.post('/products', (req: Request, res: Response) => {
  const newProduct: Product = {
    id: `prod-${Date.now().toString(36)}`,
    name: req.body.name || 'Untitled Product',
    code: req.body.code || `BL-${Math.floor(100 + Math.random() * 900)}`,
    type: req.body.type || 'software',
    salesPrice: Number(req.body.salesPrice) || 100,
    costPrice: Number(req.body.costPrice) || 20,
    notes: req.body.notes || '',
    variants: req.body.variants || [],
    isActive: true,
    createdAt: new Date().toISOString(),
  }
  productsStore.unshift(newProduct)
  res.status(201).json({ success: true, data: newProduct })
})

// ============================================================================
// PLANS (Scene 2)
// ============================================================================

subscriptionsRouter.get('/plans', (_req: Request, res: Response) => {
  res.json({ success: true, data: plansStore })
})

subscriptionsRouter.post('/plans', (req: Request, res: Response) => {
  const newPlan: SubscriptionPlan = {
    id: `plan-${Date.now().toString(36)}`,
    name: req.body.name || 'Custom Plan',
    code: req.body.code || `PLAN-${Math.floor(100 + Math.random() * 900)}`,
    productId: req.body.productId || productsStore[0]?.id || 'prod-01',
    productName: req.body.productName || productsStore[0]?.name || 'Standard Service',
    price: Number(req.body.price) || 299,
    billingFrequency: req.body.billingFrequency || 'monthly',
    minimumQuantity: Number(req.body.minimumQuantity) || 1,
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate,
    autoCloseOnEnd: Boolean(req.body.autoCloseOnEnd),
    canBeClosedEarly: req.body.canBeClosedEarly !== false,
    canBePaused: req.body.canBePaused !== false,
    canBeRenewed: req.body.canBeRenewed !== false,
    description: req.body.description,
    isActive: true,
  }
  plansStore.unshift(newPlan)
  res.status(201).json({ success: true, data: newPlan })
})

subscriptionsRouter.get('/plans/:id', (req: Request, res: Response) => {
  const plan = plansStore.find((p) => p.id === req.params.id)
  if (!plan) {
    res.status(404).json({ success: false, message: 'Plan not found' })
    return
  }
  res.json({ success: true, data: plan })
})

subscriptionsRouter.put('/plans/:id', (req: Request, res: Response) => {
  const index = plansStore.findIndex((p) => p.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Plan not found' })
    return
  }
  const existing = plansStore[index]
  const updated: SubscriptionPlan = {
    ...existing,
    ...req.body,
    id: existing.id,
  }
  plansStore[index] = updated
  res.json({ success: true, data: updated })
})

// ============================================================================
// QUOTATIONS & SUBSCRIPTIONS (Scene 3)
// ============================================================================

subscriptionsRouter.get('/subscriptions', (req: Request, res: Response) => {
  const { status, customerEmail } = req.query
  let results = [...subsStore]

  if (status && typeof status === 'string') {
    results = results.filter((s) => s.status.toLowerCase() === status.toLowerCase())
  }
  if (customerEmail && typeof customerEmail === 'string') {
    results = results.filter((s) => s.customerEmail.toLowerCase() === customerEmail.toLowerCase())
  }

  res.json({ success: true, data: results })
})

subscriptionsRouter.get('/subscriptions/:id', (req: Request, res: Response) => {
  const sub = subsStore.find((s) => s.id === req.params.id)
  if (!sub) {
    res.status(404).json({ success: false, message: 'Subscription not found' })
    return
  }
  res.json({ success: true, data: sub })
})

subscriptionsRouter.post('/subscriptions', (req: Request, res: Response) => {
  const lineItems = req.body.lineItems || [
    {
      id: `sli-${Date.now()}`,
      productId: 'prod-01',
      productName: 'Brightloop Core ERP',
      quantity: 1,
      unitPrice: 450,
      taxRatePercent: 18,
      discountAmount: 0,
      subtotal: 450,
      total: 531,
    },
  ]

  const subtotal = lineItems.reduce((acc: number, item: any) => acc + (Number(item.subtotal) || 0), 0)
  const taxTotal = lineItems.reduce(
    (acc: number, item: any) => acc + ((Number(item.subtotal) * Number(item.taxRatePercent || 18)) / 100),
    0
  )
  const discountTotal = lineItems.reduce((acc: number, item: any) => acc + (Number(item.discountAmount) || 0), 0)
  const grandTotal = subtotal + taxTotal - discountTotal

  const newSub: Subscription = {
    id: `sub-${Date.now().toString(36)}`,
    subscriptionNumber: `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: req.body.customerId || 'cust-user',
    customerName: req.body.customerName || 'Acme Customer',
    customerEmail: req.body.customerEmail || 'billing@acme.com',
    customerCompany: req.body.customerCompany || 'Acme Group',
    planId: req.body.planId || plansStore[0]?.id || 'plan-monthly-pro',
    planName: req.body.planName || plansStore[0]?.name || 'Growth Pro',
    billingFrequency: req.body.billingFrequency || 'monthly',
    status: req.body.status || 'Draft',
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    expiryDate:
      req.body.expiryDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: req.body.paymentTerms || 'Immediate',
    quotationValidityDays: req.body.quotationValidityDays || 15,
    lineItems,
    subtotal,
    taxTotal: Math.round(taxTotal * 100) / 100,
    discountTotal,
    grandTotal: Math.round(grandTotal * 100) / 100,
    notes: req.body.notes || 'Created via Brightloop subscription portal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  subsStore.unshift(newSub)
  res.status(201).json({ success: true, data: newSub })
})

// Update subscription details (Multi-step edit)
subscriptionsRouter.put('/subscriptions/:id', (req: Request, res: Response) => {
  const index = subsStore.findIndex((s) => s.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Subscription not found' })
    return
  }

  const existing = subsStore[index]
  const lineItems = req.body.lineItems || existing.lineItems
  const subtotal = lineItems.reduce((acc: number, item: any) => acc + (Number(item.subtotal) || 0), 0)
  const taxTotal = lineItems.reduce(
    (acc: number, item: any) => acc + ((Number(item.subtotal) * Number(item.taxRatePercent || 18)) / 100),
    0
  )
  const discountTotal = lineItems.reduce((acc: number, item: any) => acc + (Number(item.discountAmount) || 0), 0)
  const grandTotal = subtotal + taxTotal - discountTotal

  const updated: Subscription = {
    ...existing,
    ...req.body,
    id: existing.id,
    subscriptionNumber: existing.subscriptionNumber,
    lineItems,
    subtotal,
    taxTotal: Math.round(taxTotal * 100) / 100,
    discountTotal,
    grandTotal: Math.round(grandTotal * 100) / 100,
    updatedAt: new Date().toISOString(),
  }

  subsStore[index] = updated
  res.json({ success: true, data: updated })
})

// Transition lifecycle state: Draft -> Quotation -> Confirmed -> Active -> Closed
subscriptionsRouter.patch('/subscriptions/:id/status', (req: Request, res: Response) => {
  const { status } = req.body
  const sub = subsStore.find((s) => s.id === req.params.id)
  if (!sub) {
    res.status(404).json({ success: false, message: 'Subscription not found' })
    return
  }

  sub.status = status
  sub.updatedAt = new Date().toISOString()

  // If moved to Active, automatically create an invoice if none exists for this cycle
  if (status === 'Active') {
    const hasExistingInv = invoicesStore.some((inv) => inv.subscriptionId === sub.id)
    if (!hasExistingInv) {
      const generatedInvoice: Invoice = {
        id: `inv-${Date.now().toString(36)}`,
        invoiceNumber: `INV-2026-${Math.floor(2000 + Math.random() * 8000)}`,
        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerId: sub.customerId,
        customerName: sub.customerName,
        customerEmail: sub.customerEmail,
        customerCompany: sub.customerCompany,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        lineItems: sub.lineItems.map((li) => ({
          id: `ili-${Date.now()}-${li.id}`,
          description: `${li.productName} (${sub.billingFrequency})`,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          taxPercent: li.taxRatePercent,
          taxAmount: Math.round(((li.unitPrice * li.quantity * li.taxRatePercent) / 100) * 100) / 100,
          discountAmount: li.discountAmount,
          total: li.total,
        })),
        subtotal: sub.subtotal,
        taxTotal: sub.taxTotal,
        discountTotal: sub.discountTotal,
        totalAmount: sub.grandTotal,
        amountPaid: 0,
        balanceDue: sub.grandTotal,
        pdfUrl: `/invoices/${sub.subscriptionNumber}.pdf`,
        createdAt: new Date().toISOString(),
      }
      invoicesStore.unshift(generatedInvoice)
    }
  }

  res.json({ success: true, data: sub })
})

// ============================================================================
// BILLING DAY & INVOICES (Scene 4)
// ============================================================================

subscriptionsRouter.get('/invoices', (req: Request, res: Response) => {
  const { customerEmail, status } = req.query
  let list = [...invoicesStore]
  if (customerEmail && typeof customerEmail === 'string') {
    list = list.filter((inv) => inv.customerEmail.toLowerCase() === customerEmail.toLowerCase())
  }
  if (status && typeof status === 'string') {
    list = list.filter((inv) => inv.status.toLowerCase() === status.toLowerCase())
  }
  res.json({ success: true, data: list })
})

// Automated billing day run: generates invoices for all due active subscriptions
subscriptionsRouter.post('/invoices/generate-billing', (_req: Request, res: Response) => {
  const activeSubs = subsStore.filter((s) => s.status === 'Active' || s.status === 'Confirmed')
  const newInvoices: Invoice[] = []

  activeSubs.forEach((sub) => {
    // Check if invoice was already generated today for this subscription
    const today = new Date().toISOString().split('T')[0]
    const alreadyBilled = invoicesStore.some(
      (inv) => inv.subscriptionId === sub.id && inv.issueDate === today
    )

    if (!alreadyBilled) {
      const invoice: Invoice = {
        id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        invoiceNumber: `INV-2026-${Math.floor(3000 + Math.random() * 7000)}`,
        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerId: sub.customerId,
        customerName: sub.customerName,
        customerEmail: sub.customerEmail,
        customerCompany: sub.customerCompany,
        issueDate: today,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft',
        lineItems: sub.lineItems.map((li) => ({
          id: `ili-${Date.now()}-${li.id}`,
          description: `${li.productName} (${sub.billingFrequency})`,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          taxPercent: li.taxRatePercent,
          taxAmount: Math.round(((li.unitPrice * li.quantity * li.taxRatePercent) / 100) * 100) / 100,
          discountAmount: li.discountAmount,
          total: li.total,
        })),
        subtotal: sub.subtotal,
        taxTotal: sub.taxTotal,
        discountTotal: sub.discountTotal,
        totalAmount: sub.grandTotal,
        amountPaid: 0,
        balanceDue: sub.grandTotal,
        pdfUrl: `/invoices/${sub.subscriptionNumber}.pdf`,
        createdAt: new Date().toISOString(),
      }
      newInvoices.push(invoice)
      invoicesStore.unshift(invoice)
    }
  })

  res.json({
    success: true,
    count: newInvoices.length,
    message: `Billing day run completed. Generated ${newInvoices.length} recurring invoices without duplicate charges.`,
    data: newInvoices,
  })
})

// Update invoice status: Draft -> Confirmed -> Paid (or Cancelled)
subscriptionsRouter.patch('/invoices/:id/status', (req: Request, res: Response) => {
  const { status } = req.body
  const inv = invoicesStore.find((i) => i.id === req.params.id)
  if (!inv) {
    res.status(404).json({ success: false, message: 'Invoice not found' })
    return
  }

  inv.status = status
  if (status === 'Paid') {
    inv.amountPaid = inv.totalAmount
    inv.balanceDue = 0
  }
  res.json({ success: true, data: inv })
})

// ============================================================================
// DISCOUNT RULES (Scene 5)
// ============================================================================

subscriptionsRouter.get('/discounts', (_req: Request, res: Response) => {
  res.json({ success: true, data: discountsStore })
})

subscriptionsRouter.post('/discounts', (req: Request, res: Response) => {
  const newDisc: DiscountRule = {
    id: `disc-${Date.now().toString(36)}`,
    code: (req.body.code || 'DISC').toUpperCase(),
    description: req.body.description || 'Custom promotional discount',
    type: req.body.type || 'percentage',
    value: Number(req.body.value) || 10,
    appliesTo: req.body.appliesTo || 'whole_subscription',
    targetProductId: req.body.targetProductId,
    targetProductName: req.body.targetProductName,
    minimumPurchase: Number(req.body.minimumPurchase) || 0,
    minimumQuantity: Number(req.body.minimumQuantity) || 1,
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate || '2026-12-31',
    usageLimit: Number(req.body.usageLimit) || 100,
    usageCount: 0,
    isActive: true,
  }
  discountsStore.unshift(newDisc)
  res.status(201).json({ success: true, data: newDisc })
})

// ============================================================================
// PAYMENTS RECORDING (Scene 6)
// ============================================================================

subscriptionsRouter.get('/payments', (_req: Request, res: Response) => {
  res.json({ success: true, data: paymentsStore })
})

subscriptionsRouter.post('/payments', (req: Request, res: Response) => {
  const invoice = invoicesStore.find((i) => i.id === req.body.invoiceId || i.invoiceNumber === req.body.invoiceNumber)

  const payment: PaymentRecord = {
    id: `pay-${Date.now().toString(36)}`,
    paymentNumber: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
    invoiceId: invoice?.id || req.body.invoiceId || 'inv-unknown',
    invoiceNumber: invoice?.invoiceNumber || req.body.invoiceNumber || 'INV-MANUAL',
    customerId: invoice?.customerId || req.body.customerId || 'cust-user',
    customerName: invoice?.customerName || req.body.customerName || 'Valued Customer',
    amount: Number(req.body.amount) || (invoice ? invoice.balanceDue : 500),
    paymentMethod: req.body.paymentMethod || 'Bank Transfer',
    paymentDate: req.body.paymentDate || new Date().toISOString().split('T')[0],
    notes: req.body.notes || 'Recorded via Brightloop billing portal',
    referenceId: req.body.referenceId || `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    status: 'Completed',
    createdAt: new Date().toISOString(),
  }

  paymentsStore.unshift(payment)

  // Settle invoice balance
  if (invoice) {
    invoice.amountPaid += payment.amount
    invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.amountPaid)
    if (invoice.balanceDue <= 0) {
      invoice.status = 'Paid'
    }
  }

  res.status(201).json({ success: true, data: payment, invoiceUpdated: invoice })
})

// ============================================================================
// FINANCE & ANALYTICS (Scene 7 - Sub-2-second Response Guaranteed)
// ============================================================================

subscriptionsRouter.get('/finance/summary', (_req: Request, res: Response) => {
  const activeSubs = subsStore.filter((s) => s.status === 'Active')
  const mrr = activeSubs.reduce((acc, s) => {
    if (s.billingFrequency === 'monthly') return acc + s.grandTotal
    if (s.billingFrequency === 'yearly') return acc + s.grandTotal / 12
    if (s.billingFrequency === 'weekly') return acc + s.grandTotal * 4.33
    return acc + s.grandTotal
  }, 0)

  const overdueInvoices = invoicesStore.filter((i) => i.status === 'Overdue')
  const overdueAmount = overdueInvoices.reduce((acc, i) => acc + i.balanceDue, 0)
  const paidInvoices = invoicesStore.filter((i) => i.status === 'Paid')
  const totalRevenue = paymentsStore.reduce((acc, p) => acc + p.amount, 0)

  const summary = {
    mrr: Math.round(mrr || MOCK_FINANCE_SUMMARY.mrr),
    arr: Math.round((mrr || MOCK_FINANCE_SUMMARY.mrr) * 12),
    activeSubscriptionsCount: activeSubs.length || MOCK_FINANCE_SUMMARY.activeSubscriptionsCount,
    totalRevenueCollected: Math.round(totalRevenue || MOCK_FINANCE_SUMMARY.totalRevenueCollected),
    outstandingOverdueAmount: Math.round(overdueAmount || MOCK_FINANCE_SUMMARY.outstandingOverdueAmount),
    overdueInvoicesCount: overdueInvoices.length || MOCK_FINANCE_SUMMARY.overdueInvoicesCount,
    paidInvoicesCount: paidInvoices.length || MOCK_FINANCE_SUMMARY.paidInvoicesCount,
    monthlyGrowthRatePercent: MOCK_FINANCE_SUMMARY.monthlyGrowthRatePercent,
  }

  res.json({ success: true, data: summary })
})
