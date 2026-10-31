import { z } from 'zod'

// ============================================================================
// PRODUCT & VARIANT CONTRACTS (Scene 2)
// ============================================================================

export const ProductVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  attributeName: z.string(), // e.g. "Brand", "Tier", "Support Level"
  attributeValue: z.string(), // e.g. "Odoo Edition", "Enterprise", "24/7 Dedicated"
  priceAdjustment: z.number(), // e.g. +560 for Odoo brand
})

export type ProductVariant = z.infer<typeof ProductVariantSchema>

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  type: z.enum(['software', 'service', 'addon']),
  salesPrice: z.number(),
  costPrice: z.number(),
  notes: z.string().optional(),
  variants: z.array(ProductVariantSchema).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
})

export type Product = z.infer<typeof ProductSchema>

// ============================================================================
// SUBSCRIPTION PLAN CONTRACTS (Scene 2)
// ============================================================================

export const BillingFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly'])
export type BillingFrequency = z.infer<typeof BillingFrequencySchema>

export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  billingFrequency: BillingFrequencySchema,
  minimumQuantity: z.number().default(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  autoCloseOnEnd: z.boolean().default(false),
  canBeClosedEarly: z.boolean().default(true),
  canBePaused: z.boolean().default(true),
  canBeRenewed: z.boolean().default(true),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>

// ============================================================================
// QUOTATION & SUBSCRIPTION CONTRACTS (Scene 3)
// Lifecycle: Draft -> Quotation -> Confirmed -> Active -> Closed
// ============================================================================

export const SubscriptionStatusSchema = z.enum([
  'Draft',
  'Quotation',
  'Confirmed',
  'Active',
  'Closed',
  'Paused',
])
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>

export const SubscriptionLineItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  variantName: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  taxRatePercent: z.number().default(18),
  discountAmount: z.number().default(0),
  subtotal: z.number(),
  total: z.number(),
})

export type SubscriptionLineItem = z.infer<typeof SubscriptionLineItemSchema>

export const SubscriptionSchema = z.object({
  id: z.string(),
  subscriptionNumber: z.string(), // e.g. "SUB-2026-001"
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerCompany: z.string(),
  planId: z.string(),
  planName: z.string(),
  billingFrequency: BillingFrequencySchema,
  status: SubscriptionStatusSchema,
  startDate: z.string(),
  expiryDate: z.string(),
  paymentTerms: z.string(), // e.g. "Immediate", "Net 15", "Net 30"
  quotationValidityDays: z.number().default(15),
  lineItems: z.array(SubscriptionLineItemSchema),
  subtotal: z.number(),
  taxTotal: z.number(),
  discountTotal: z.number().default(0),
  grandTotal: z.number(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Subscription = z.infer<typeof SubscriptionSchema>

// ============================================================================
// INVOICE & TAX CONTRACTS (Scene 4)
// Lifecycle: Draft -> Confirmed -> Paid (or Cancelled)
// ============================================================================

export const InvoiceStatusSchema = z.enum(['Draft', 'Confirmed', 'Paid', 'Cancelled', 'Overdue'])
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>

export const InvoiceLineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  taxPercent: z.number(),
  taxAmount: z.number(),
  discountAmount: z.number().default(0),
  total: z.number(),
})

export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>

export const InvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(), // e.g. "INV-2026-1042"
  subscriptionId: z.string(),
  subscriptionNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerCompany: z.string(),
  issueDate: z.string(),
  dueDate: z.string(),
  status: InvoiceStatusSchema,
  lineItems: z.array(InvoiceLineItemSchema),
  subtotal: z.number(),
  taxTotal: z.number(),
  discountTotal: z.number(),
  totalAmount: z.number(),
  amountPaid: z.number().default(0),
  balanceDue: z.number(),
  pdfUrl: z.string().optional(),
  createdAt: z.string().datetime(),
})

export type Invoice = z.infer<typeof InvoiceSchema>

// ============================================================================
// DISCOUNT RULE CONTRACTS (Scene 5)
// ============================================================================

export const DiscountRuleSchema = z.object({
  id: z.string(),
  code: z.string(), // e.g. "VOLUME10", "GROWTH2026"
  description: z.string(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number(), // e.g. 10 (%) or 200 ($)
  appliesTo: z.enum(['whole_subscription', 'specific_product']),
  targetProductId: z.string().optional(),
  targetProductName: z.string().optional(),
  minimumPurchase: z.number().default(0),
  minimumQuantity: z.number().default(1),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.number().default(100),
  usageCount: z.number().default(0),
  isActive: z.boolean().default(true),
})

export type DiscountRule = z.infer<typeof DiscountRuleSchema>

// ============================================================================
// PAYMENT CONTRACTS (Scene 6)
// ============================================================================

export const PaymentMethodSchema = z.enum([
  'Stripe',
  'Credit Card',
  'Bank Transfer',
  'UPI / Instant',
  'Manual / Cash',
])
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

export const PaymentRecordSchema = z.object({
  id: z.string(),
  paymentNumber: z.string(), // e.g. "PAY-2026-089"
  invoiceId: z.string(),
  invoiceNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  amount: z.number(),
  paymentMethod: PaymentMethodSchema,
  paymentDate: z.string(),
  notes: z.string().optional(),
  referenceId: z.string().optional(),
  status: z.enum(['Completed', 'Pending', 'Failed']).default('Completed'),
  createdAt: z.string().datetime(),
})

export type PaymentRecord = z.infer<typeof PaymentRecordSchema>

// ============================================================================
// FINANCE & METRICS CONTRACTS (Scene 7)
// ============================================================================

export const FinanceSummarySchema = z.object({
  mrr: z.number(),
  arr: z.number(),
  activeSubscriptionsCount: z.number(),
  totalRevenueCollected: z.number(),
  outstandingOverdueAmount: z.number(),
  overdueInvoicesCount: z.number(),
  paidInvoicesCount: z.number(),
  monthlyGrowthRatePercent: z.number(),
})

export type FinanceSummary = z.infer<typeof FinanceSummarySchema>

// ============================================================================
// CANONICAL SEED DATA (Brightloop Software Live Platform Dataset)
// ============================================================================

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Brightloop Core ERP & Subscription Engine',
    code: 'BL-ERP-01',
    type: 'software',
    salesPrice: 450,
    costPrice: 90,
    notes: 'Primary subscription management engine with multi-entity support.',
    variants: [
      {
        id: 'var-01',
        name: 'Odoo Enterprise Edition Sync',
        attributeName: 'Brand Variant',
        attributeValue: 'Odoo Brand Connector',
        priceAdjustment: 560,
      },
      {
        id: 'var-02',
        name: 'Standard Cloud Edition',
        attributeName: 'Brand Variant',
        attributeValue: 'Standard',
        priceAdjustment: 0,
      },
    ],
    isActive: true,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'prod-02',
    name: 'Automated Tax & Compliance Engine',
    code: 'BL-TAX-02',
    type: 'software',
    salesPrice: 150,
    costPrice: 25,
    notes: 'Auto tax rates calculation with multi-region rules and audit export.',
    variants: [],
    isActive: true,
    createdAt: '2026-10-02T00:00:00.000Z',
  },
  {
    id: 'prod-03',
    name: 'Dedicated 24/7 Priority SLA Support',
    code: 'BL-SUP-03',
    type: 'service',
    salesPrice: 300,
    costPrice: 120,
    notes: 'Guaranteed 15-minute response time and dedicated Slack integration channel.',
    variants: [],
    isActive: true,
    createdAt: '2026-10-03T00:00:00.000Z',
  },
  {
    id: 'prod-04',
    name: 'Real-time Payment Gateway Webhooks',
    code: 'BL-GW-04',
    type: 'addon',
    salesPrice: 80,
    costPrice: 15,
    notes: 'Instant settlement verification for Stripe, Razorpay and bank webhooks.',
    variants: [],
    isActive: true,
    createdAt: '2026-10-05T00:00:00.000Z',
  },
]

export const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-monthly-pro',
    name: 'Growth Pro - Monthly',
    code: 'GROWTH-MO',
    productId: 'prod-01',
    productName: 'Brightloop Core ERP & Subscription Engine',
    price: 450,
    billingFrequency: 'monthly',
    minimumQuantity: 1,
    startDate: '2026-01-01',
    autoCloseOnEnd: false,
    canBeClosedEarly: true,
    canBePaused: true,
    canBeRenewed: true,
    description: 'Billed monthly. Unlimited invoices and active customers with real-time sync.',
    isActive: true,
  },
  {
    id: 'plan-yearly-ent',
    name: 'Enterprise Scale - Yearly (Odoo Hybrid)',
    code: 'ENT-YR',
    productId: 'prod-01',
    productName: 'Brightloop Core ERP & Subscription Engine',
    price: 4900,
    billingFrequency: 'yearly',
    minimumQuantity: 5,
    startDate: '2026-01-01',
    autoCloseOnEnd: false,
    canBeClosedEarly: false,
    canBePaused: true,
    canBeRenewed: true,
    description: 'Annual commitment includes Odoo brand integration and dedicated engineering support.',
    isActive: true,
  },
  {
    id: 'plan-weekly-starter',
    name: 'Pilot Sprint - Weekly',
    code: 'SPRINT-WK',
    productId: 'prod-01',
    productName: 'Brightloop Core ERP & Subscription Engine',
    price: 120,
    billingFrequency: 'weekly',
    minimumQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    autoCloseOnEnd: true,
    canBeClosedEarly: true,
    canBePaused: false,
    canBeRenewed: true,
    description: 'Weekly flexible pilot trial for testing high frequency recurring billing.',
    isActive: true,
  },
]

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    subscriptionNumber: 'SUB-2026-0101',
    customerId: 'cust-01',
    customerName: 'David Miller',
    customerEmail: 'david@acmeretail.com',
    customerCompany: 'Acme Retail & Logistics',
    planId: 'plan-monthly-pro',
    planName: 'Growth Pro - Monthly',
    billingFrequency: 'monthly',
    status: 'Active',
    startDate: '2026-10-01',
    expiryDate: '2027-10-01',
    paymentTerms: 'Immediate',
    quotationValidityDays: 14,
    lineItems: [
      {
        id: 'sli-1',
        productId: 'prod-01',
        productName: 'Brightloop Core ERP & Subscription Engine',
        variantName: 'Odoo Enterprise Edition Sync (+$560)',
        quantity: 1,
        unitPrice: 1010, // 450 + 560
        taxRatePercent: 18,
        discountAmount: 100,
        subtotal: 910,
        total: 1073.8,
      },
      {
        id: 'sli-2',
        productId: 'prod-02',
        productName: 'Automated Tax & Compliance Engine',
        quantity: 1,
        unitPrice: 150,
        taxRatePercent: 18,
        discountAmount: 0,
        subtotal: 150,
        total: 177,
      },
    ],
    subtotal: 1060,
    taxTotal: 190.8,
    discountTotal: 100,
    grandTotal: 1250.8,
    notes: 'Key account - converted from quotation template #QT-004',
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-31T10:00:00.000Z',
  },
  {
    id: 'sub-002',
    subscriptionNumber: 'SUB-2026-0102',
    customerId: 'cust-02',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@kavalanordic.se',
    customerCompany: 'Kavala Nordic Tech',
    planId: 'plan-yearly-ent',
    planName: 'Enterprise Scale - Yearly (Odoo Hybrid)',
    billingFrequency: 'yearly',
    status: 'Active',
    startDate: '2026-08-15',
    expiryDate: '2027-08-15',
    paymentTerms: 'Net 30',
    quotationValidityDays: 30,
    lineItems: [
      {
        id: 'sli-3',
        productId: 'prod-01',
        productName: 'Brightloop Core ERP & Subscription Engine',
        quantity: 5,
        unitPrice: 980,
        taxRatePercent: 18,
        discountAmount: 400,
        subtotal: 4500,
        total: 5310,
      },
    ],
    subtotal: 4500,
    taxTotal: 810,
    discountTotal: 400,
    grandTotal: 5310,
    notes: 'Multi-seat deployment. Billed yearly via bank swift transfer.',
    createdAt: '2026-08-15T11:00:00.000Z',
    updatedAt: '2026-10-25T14:20:00.000Z',
  },
  {
    id: 'sub-003',
    subscriptionNumber: 'SUB-2026-0103',
    customerId: 'cust-03',
    customerName: 'Karthik Menon',
    customerEmail: 'karthik@kochisupply.in',
    customerCompany: 'Kochi Port Logistics & Cargo',
    planId: 'plan-monthly-pro',
    planName: 'Growth Pro - Monthly',
    billingFrequency: 'monthly',
    status: 'Quotation',
    startDate: '2026-11-01',
    expiryDate: '2027-11-01',
    paymentTerms: 'Net 15',
    quotationValidityDays: 15,
    lineItems: [
      {
        id: 'sli-4',
        productId: 'prod-01',
        productName: 'Brightloop Core ERP',
        quantity: 2,
        unitPrice: 450,
        taxRatePercent: 18,
        discountAmount: 50,
        subtotal: 850,
        total: 1003,
      },
    ],
    subtotal: 850,
    taxTotal: 153,
    discountTotal: 50,
    grandTotal: 1003,
    notes: 'Prepared from template for sales meeting this week.',
    createdAt: '2026-10-28T16:00:00.000Z',
    updatedAt: '2026-10-31T08:30:00.000Z',
  },
  {
    id: 'sub-004',
    subscriptionNumber: 'SUB-2026-0104',
    customerId: 'cust-04',
    customerName: 'Maya Patel',
    customerEmail: 'maya@fintechhive.io',
    customerCompany: 'FinTech Hive India',
    planId: 'plan-weekly-starter',
    planName: 'Pilot Sprint - Weekly',
    billingFrequency: 'weekly',
    status: 'Confirmed',
    startDate: '2026-10-20',
    expiryDate: '2026-12-20',
    paymentTerms: 'Immediate',
    quotationValidityDays: 7,
    lineItems: [
      {
        id: 'sli-5',
        productId: 'prod-01',
        productName: 'Brightloop Core ERP',
        quantity: 1,
        unitPrice: 120,
        taxRatePercent: 18,
        discountAmount: 0,
        subtotal: 120,
        total: 141.6,
      },
    ],
    subtotal: 120,
    taxTotal: 21.6,
    discountTotal: 0,
    grandTotal: 141.6,
    notes: 'Waiting for billing day execution to convert into Active.',
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-30T12:00:00.000Z',
  },
]

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-1041',
    subscriptionId: 'sub-001',
    subscriptionNumber: 'SUB-2026-0101',
    customerId: 'cust-01',
    customerName: 'David Miller',
    customerEmail: 'david@acmeretail.com',
    customerCompany: 'Acme Retail & Logistics',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    status: 'Paid',
    lineItems: [
      {
        id: 'ili-1',
        description: 'Growth Pro - Monthly + Odoo Sync Variant',
        quantity: 1,
        unitPrice: 1010,
        taxPercent: 18,
        taxAmount: 163.8,
        discountAmount: 100,
        total: 1073.8,
      },
      {
        id: 'ili-2',
        description: 'Automated Tax & Compliance Engine',
        quantity: 1,
        unitPrice: 150,
        taxPercent: 18,
        taxAmount: 27,
        discountAmount: 0,
        total: 177,
      },
    ],
    subtotal: 1060,
    taxTotal: 190.8,
    discountTotal: 100,
    totalAmount: 1250.8,
    amountPaid: 1250.8,
    balanceDue: 0,
    pdfUrl: '/invoices/INV-2026-1041.pdf',
    createdAt: '2026-10-01T09:05:00.000Z',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-1042',
    subscriptionId: 'sub-002',
    subscriptionNumber: 'SUB-2026-0102',
    customerId: 'cust-02',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@kavalanordic.se',
    customerCompany: 'Kavala Nordic Tech',
    issueDate: '2026-10-15',
    dueDate: '2026-10-30',
    status: 'Overdue',
    lineItems: [
      {
        id: 'ili-3',
        description: 'Enterprise Scale - Yearly (Odoo Hybrid) 5 Seats',
        quantity: 5,
        unitPrice: 980,
        taxPercent: 18,
        taxAmount: 810,
        discountAmount: 400,
        total: 5310,
      },
    ],
    subtotal: 4500,
    taxTotal: 810,
    discountTotal: 400,
    totalAmount: 5310,
    amountPaid: 0,
    balanceDue: 5310,
    pdfUrl: '/invoices/INV-2026-1042.pdf',
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-1043',
    subscriptionId: 'sub-004',
    subscriptionNumber: 'SUB-2026-0104',
    customerId: 'cust-04',
    customerName: 'Maya Patel',
    customerEmail: 'maya@fintechhive.io',
    customerCompany: 'FinTech Hive India',
    issueDate: '2026-10-27',
    dueDate: '2026-11-05',
    status: 'Confirmed',
    lineItems: [
      {
        id: 'ili-4',
        description: 'Pilot Sprint - Weekly Recurring',
        quantity: 1,
        unitPrice: 120,
        taxPercent: 18,
        taxAmount: 21.6,
        discountAmount: 0,
        total: 141.6,
      },
    ],
    subtotal: 120,
    taxTotal: 21.6,
    discountTotal: 0,
    totalAmount: 141.6,
    amountPaid: 0,
    balanceDue: 141.6,
    pdfUrl: '/invoices/INV-2026-1043.pdf',
    createdAt: '2026-10-27T08:30:00.000Z',
  },
]

export const MOCK_DISCOUNT_RULES: DiscountRule[] = [
  {
    id: 'disc-01',
    code: 'SEATS5PLUS',
    description: 'Volume discount for 5+ seats on any annual subscription',
    type: 'percentage',
    value: 15,
    appliesTo: 'whole_subscription',
    minimumPurchase: 1000,
    minimumQuantity: 5,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 50,
    usageCount: 18,
    isActive: true,
  },
  {
    id: 'disc-02',
    code: 'ODOOFEST26',
    description: 'Flat $100 off Odoo Brand Hybrid Connector',
    type: 'fixed',
    value: 100,
    appliesTo: 'specific_product',
    targetProductId: 'prod-01',
    targetProductName: 'Brightloop Core ERP (Odoo Edition)',
    minimumPurchase: 500,
    minimumQuantity: 1,
    startDate: '2026-10-01',
    endDate: '2026-11-30',
    usageLimit: 100,
    usageCount: 42,
    isActive: true,
  },
]

export const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    paymentNumber: 'PAY-2026-081',
    invoiceId: 'inv-101',
    invoiceNumber: 'INV-2026-1041',
    customerId: 'cust-01',
    customerName: 'David Miller (Acme Retail)',
    amount: 1250.8,
    paymentMethod: 'Stripe',
    paymentDate: '2026-10-02',
    notes: 'Auto-charged through Stripe webhook ch_3OdooKochiLive001',
    referenceId: 'ch_3OdooKochiLive001',
    status: 'Completed',
    createdAt: '2026-10-02T10:15:00.000Z',
  },
  {
    id: 'pay-002',
    paymentNumber: 'PAY-2026-082',
    invoiceId: 'inv-100',
    invoiceNumber: 'INV-2026-1040',
    customerId: 'cust-05',
    customerName: 'Zenith Labs Global',
    amount: 3200.0,
    paymentMethod: 'Bank Transfer',
    paymentDate: '2026-10-24',
    notes: 'SWIFT wire transfer matched to monthly billing',
    referenceId: 'SWIFT-9948271',
    status: 'Completed',
    createdAt: '2026-10-24T15:40:00.000Z',
  },
]

export const MOCK_FINANCE_SUMMARY: FinanceSummary = {
  mrr: 18450,
  arr: 221400,
  activeSubscriptionsCount: 142,
  totalRevenueCollected: 194320,
  outstandingOverdueAmount: 5310,
  overdueInvoicesCount: 1,
  paidInvoicesCount: 284,
  monthlyGrowthRatePercent: 14.8,
}
