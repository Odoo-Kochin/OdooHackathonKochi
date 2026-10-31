import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../index.js'

describe('Subscription Management API (/api)', () => {
  const ts = Date.now()

  // 1. Products & Variants
  describe('Products & Variants', () => {
    it('GET /api/products returns a list of products with variants', async () => {
      const res = await request(app).get('/api/products')
      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.ok(Array.isArray(res.body.data))
      assert.ok(res.body.data.length > 0)

      const odooProd = res.body.data.find((p: any) =>
        p.variants?.some((v: any) => v.attributeValue?.includes('Odoo') || v.priceAdjustment > 0)
      )
      assert.ok(odooProd, 'Expected product with Odoo brand variant')
    })

    it('POST /api/products creates a new product with brand variant adjustment', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: `Test Suite Product ${ts}`,
          code: `TEST-${ts}`,
          type: 'software',
          salesPrice: 200,
          costPrice: 50,
          notes: 'Automated test product',
          variants: [
            {
              name: 'Odoo Enterprise Connector',
              attributeName: 'Brand Variant',
              attributeValue: 'Odoo Brand',
              priceAdjustment: 60,
            },
          ],
        })

      assert.equal(res.status, 201)
      assert.equal(res.body.success, true)
      assert.equal(res.body.data.name, `Test Suite Product ${ts}`)
      assert.equal(res.body.data.variants.length, 1)
      assert.equal(res.body.data.variants[0].priceAdjustment, 60)
    })
  })

  // 2. Subscription Plans
  describe('Subscription Plans', () => {
    it('GET /api/plans returns available plans with policies', async () => {
      const res = await request(app).get('/api/plans')
      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.ok(Array.isArray(res.body.data))
      assert.ok(res.body.data.length > 0)

      const plan = res.body.data[0]
      assert.ok(plan.billingFrequency)
      assert.ok('canBePaused' in plan)
      assert.ok('canBeClosedEarly' in plan)
      assert.ok('autoCloseOnEnd' in plan)
    })

    it('POST /api/plans creates a plan with lifecycle rules', async () => {
      const prodRes = await request(app).get('/api/products')
      const prodId = prodRes.body.data[0].id
      const prodName = prodRes.body.data[0].name

      const res = await request(app)
        .post('/api/plans')
        .send({
          name: `Quarterly Test Plan ${ts}`,
          code: `PLAN-${ts}`,
          productId: prodId,
          productName: prodName,
          price: 150,
          billingFrequency: 'monthly',
          minimumQuantity: 2,
          startDate: '2026-01-01',
          autoCloseOnEnd: true,
          canBeClosedEarly: true,
          canBePaused: true,
          canBeRenewed: true,
        })

      assert.equal(res.status, 201)
      assert.equal(res.body.success, true)
      assert.equal(res.body.data.price, 150)
      assert.equal(res.body.data.autoCloseOnEnd, true)
    })
  })

  // 3. Subscriptions & Lifecycle
  describe('Subscriptions Lifecycle', () => {
    let createdSubId: string

    it('POST /api/subscriptions creates a new subscription in Draft/Quotation status with 18% tax calculation', async () => {
      const prodRes = await request(app).get('/api/products')
      const planRes = await request(app).get('/api/plans')

      const product = prodRes.body.data[0]
      const plan = planRes.body.data[0]

      const res = await request(app)
        .post('/api/subscriptions')
        .send({
          customerId: 'cust-01',
          customerName: 'David Miller',
          customerEmail: 'david@acmeretail.com',
          customerCompany: 'Acme Retail & Logistics',
          planId: plan.id,
          planName: plan.name,
          billingFrequency: plan.billingFrequency,
          status: 'Quotation',
          startDate: '2026-11-01',
          expiryDate: '2027-11-01',
          paymentTerms: 'Net 15',
          quotationValidityDays: 15,
          lineItems: [
            {
              productId: product.id,
              productName: product.name,
              quantity: 2,
              unitPrice: 100,
              taxRatePercent: 18,
            },
          ],
        })

      assert.equal(res.status, 201)
      assert.equal(res.body.success, true)
      createdSubId = res.body.data.id

      assert.equal(res.body.data.status, 'Quotation')
      assert.equal(res.body.data.subtotal, 200)
      assert.equal(res.body.data.taxTotal, 36) // 18% of 200
      assert.equal(res.body.data.grandTotal, 236)
    })

    it('PATCH /api/subscriptions/:id/status updates status from Quotation to Confirmed', async () => {
      assert.ok(createdSubId)
      const res = await request(app)
        .patch(`/api/subscriptions/${createdSubId}/status`)
        .send({ status: 'Confirmed' })

      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.equal(res.body.data.status, 'Confirmed')
    })

    it('PATCH /api/subscriptions/:id/status updates status to Active and triggers invoice creation', async () => {
      assert.ok(createdSubId)
      const res = await request(app)
        .patch(`/api/subscriptions/${createdSubId}/status`)
        .send({ status: 'Active' })

      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.equal(res.body.data.status, 'Active')
    })
  })

  // 4. Invoices & Billing Engine
  describe('Invoices & Billing Run', () => {
    it('GET /api/invoices lists generated invoices', async () => {
      const res = await request(app).get('/api/invoices')
      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.ok(Array.isArray(res.body.data))
      assert.ok(res.body.data.length > 0)
    })

    it('POST /api/invoices/generate-billing triggers batch billing for active subscriptions', async () => {
      const res = await request(app).post('/api/invoices/generate-billing')
      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.ok(typeof res.body.count === 'number')
    })
  })

  // 5. Discounts & Vouchers
  describe('Discounts & Smart Vouchers', () => {
    it('GET /api/discounts returns active discount rules', async () => {
      const res = await request(app).get('/api/discounts')
      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.ok(Array.isArray(res.body.data))
    })

    it('POST /api/discounts creates a valid voucher code rule', async () => {
      const res = await request(app)
        .post('/api/discounts')
        .send({
          code: `TESTDISC${ts}`,
          description: '15% Off Seats',
          type: 'percentage',
          value: 15,
          appliesTo: 'whole_subscription',
          minimumPurchase: 100,
          minimumQuantity: 5,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          usageLimit: 50,
        })

      assert.equal(res.status, 201)
      assert.equal(res.body.success, true)
      assert.equal(res.body.data.code, `TESTDISC${ts}`)
      assert.equal(res.body.data.value, 15)
    })
  })

  // 6. Payments
  describe('Payments & Reconciliation', () => {
    it('GET /api/payments returns list of recorded payments', async () => {
      const res = await request(app).get('/api/payments')
      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.ok(Array.isArray(res.body.data))
    })

    it('POST /api/payments records payment against an invoice and updates balance', async () => {
      const invRes = await request(app).get('/api/invoices')
      const targetInvoice = invRes.body.data.find((inv: any) => inv.balanceDue > 0) || invRes.body.data[0]

      const paymentAmount = Math.min(50, targetInvoice.balanceDue || 50)

      const res = await request(app)
        .post('/api/payments')
        .send({
          invoiceId: targetInvoice.id,
          customerId: targetInvoice.customerId,
          customerName: targetInvoice.customerName,
          amount: paymentAmount,
          paymentMethod: 'Stripe',
          paymentDate: '2026-11-01',
          notes: 'Test payment via automated test',
        })

      assert.equal(res.status, 201)
      assert.equal(res.body.success, true)
      assert.equal(res.body.data.amount, paymentAmount)
      assert.equal(res.body.data.paymentMethod, 'Stripe')
    })
  })

  // 7. Finance Summary
  describe('Finance Lead Reports & Summary', () => {
    it('GET /api/finance/summary returns aggregated financial metrics', async () => {
      const res = await request(app).get('/api/finance/summary')
      assert.equal(res.status, 200)
      assert.equal(res.body.success, true)
      assert.ok('mrr' in res.body.data)
      assert.ok('arr' in res.body.data)
      assert.ok('totalRevenueCollected' in res.body.data)
      assert.ok('activeSubscriptionsCount' in res.body.data)
      assert.ok('paidInvoicesCount' in res.body.data)
      assert.ok('outstandingOverdueAmount' in res.body.data)
    })
  })
})
