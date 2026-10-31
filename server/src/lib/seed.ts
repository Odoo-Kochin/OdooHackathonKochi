import { prisma } from './prisma.js'
import {
  MOCK_PRODUCTS,
  MOCK_PLANS,
  MOCK_SUBSCRIPTIONS,
  MOCK_INVOICES,
  MOCK_DISCOUNT_RULES,
  MOCK_PAYMENTS,
} from '@shared/contracts/subscriptions.js'
import { MOCK_AUTH_USERS } from '@shared/contracts/auth.js'

export async function seedDatabaseIfEmpty() {
  try {
    console.log('[Seed] Checking tables and seeding canonical Brightloop OS dataset if empty...')

    // 1. Seed Auth Users & Customers
    const userCount = await prisma.user.count()
    if (userCount < 6) {
    const initialUsers = [
      {
        id: MOCK_AUTH_USERS.admin.id,
        email: MOCK_AUTH_USERS.admin.email,
        name: MOCK_AUTH_USERS.admin.name,
        role: MOCK_AUTH_USERS.admin.role,
        company: MOCK_AUTH_USERS.admin.company || 'Brightloop HQ',
      },
      {
        id: MOCK_AUTH_USERS.staff.id,
        email: MOCK_AUTH_USERS.staff.email,
        name: MOCK_AUTH_USERS.staff.name,
        role: MOCK_AUTH_USERS.staff.role,
        company: MOCK_AUTH_USERS.staff.company || 'Brightloop Operations',
      },
      {
        id: 'cust-01',
        email: 'david@acmeretail.com',
        name: 'David Miller',
        role: 'customer',
        company: 'Acme Retail & Logistics',
      },
      {
        id: 'cust-02',
        email: 'elena@kavalanordic.se',
        name: 'Elena Rostova',
        role: 'customer',
        company: 'Kavala Nordic Tech',
      },
      {
        id: 'cust-03',
        email: 'karthik@kochisupply.in',
        name: 'Karthik Menon',
        role: 'customer',
        company: 'Kochi Port Logistics & Cargo',
      },
      {
        id: 'cust-04',
        email: 'maya@fintechhive.io',
        name: 'Maya Patel',
        role: 'customer',
        company: 'FinTech Hive India',
      },
    ]

    for (const u of initialUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      })
    }
    console.log(`[Seed] Created ${initialUsers.length} users.`)
  } else {
    console.log(`[Seed] Users already present (${userCount}).`)
  }

    // 2. Seed Products & Variants
    for (const p of MOCK_PRODUCTS) {
      await prisma.product.upsert({
        where: { code: p.code },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          code: p.code,
          type: p.type,
          salesPrice: p.salesPrice,
          costPrice: p.costPrice,
          notes: p.notes,
          isActive: p.isActive,
          variants: {
            create: p.variants.map((v) => ({
              id: v.id,
              name: v.name,
              attributeName: v.attributeName,
              attributeValue: v.attributeValue,
              priceAdjustment: v.priceAdjustment,
            })),
          },
        },
      })
    }
    console.log(`[Seed] Created ${MOCK_PRODUCTS.length} products with variants.`)

    // 3. Seed Subscription Plans
    for (const plan of MOCK_PLANS) {
      await prisma.subscriptionPlan.upsert({
        where: { code: plan.code },
        update: {},
        create: {
          id: plan.id,
          name: plan.name,
          code: plan.code,
          productId: plan.productId,
          productName: plan.productName,
          price: plan.price,
          billingFrequency: plan.billingFrequency,
          minimumQuantity: plan.minimumQuantity,
          startDate: plan.startDate,
          endDate: plan.endDate,
          autoCloseOnEnd: plan.autoCloseOnEnd,
          canBeClosedEarly: plan.canBeClosedEarly,
          canBePaused: plan.canBePaused,
          canBeRenewed: plan.canBeRenewed,
          description: plan.description,
          isActive: plan.isActive,
        },
      })
    }
    console.log(`[Seed] Created ${MOCK_PLANS.length} subscription plans.`)

    // 4. Seed Subscriptions & Line Items
    for (const sub of MOCK_SUBSCRIPTIONS) {
      await prisma.subscription.upsert({
        where: { subscriptionNumber: sub.subscriptionNumber },
        update: {},
        create: {
          id: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerId: sub.customerId,
          customerName: sub.customerName,
          customerEmail: sub.customerEmail,
          customerCompany: sub.customerCompany,
          planId: sub.planId,
          planName: sub.planName,
          billingFrequency: sub.billingFrequency,
          status: sub.status,
          startDate: sub.startDate,
          expiryDate: sub.expiryDate,
          paymentTerms: sub.paymentTerms,
          quotationValidityDays: sub.quotationValidityDays,
          subtotal: sub.subtotal,
          taxTotal: sub.taxTotal,
          discountTotal: sub.discountTotal,
          grandTotal: sub.grandTotal,
          notes: sub.notes,
          lineItems: {
            create: sub.lineItems.map((li) => ({
              id: li.id,
              productId: li.productId,
              productName: li.productName,
              variantName: li.variantName,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              taxRatePercent: li.taxRatePercent,
              discountAmount: li.discountAmount,
              subtotal: li.subtotal,
              total: li.total,
            })),
          },
        },
      })
    }
    console.log(`[Seed] Created ${MOCK_SUBSCRIPTIONS.length} subscriptions with line items.`)

    // 5. Seed Invoices & Line Items
    for (const inv of MOCK_INVOICES) {
      await prisma.invoice.upsert({
        where: { invoiceNumber: inv.invoiceNumber },
        update: {},
        create: {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          subscriptionId: inv.subscriptionId,
          subscriptionNumber: inv.subscriptionNumber,
          customerId: inv.customerId,
          customerName: inv.customerName,
          customerEmail: inv.customerEmail,
          customerCompany: inv.customerCompany,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          status: inv.status,
          subtotal: inv.subtotal,
          taxTotal: inv.taxTotal,
          discountTotal: inv.discountTotal,
          totalAmount: inv.totalAmount,
          amountPaid: inv.amountPaid,
          balanceDue: inv.balanceDue,
          pdfUrl: inv.pdfUrl,
          lineItems: {
            create: inv.lineItems.map((li) => ({
              id: li.id,
              description: li.description,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              taxPercent: li.taxPercent,
              taxAmount: li.taxAmount,
              discountAmount: li.discountAmount,
              total: li.total,
            })),
          },
        },
      })
    }
    console.log(`[Seed] Created ${MOCK_INVOICES.length} invoices with line items.`)

    // 6. Seed Discount Rules
    for (const d of MOCK_DISCOUNT_RULES) {
      await prisma.discountRule.upsert({
        where: { code: d.code },
        update: {},
        create: {
          id: d.id,
          code: d.code,
          description: d.description,
          type: d.type,
          value: d.value,
          appliesTo: d.appliesTo,
          targetProductId: d.targetProductId,
          targetProductName: d.targetProductName,
          minimumPurchase: d.minimumPurchase,
          minimumQuantity: d.minimumQuantity,
          startDate: d.startDate,
          endDate: d.endDate,
          usageLimit: d.usageLimit,
          usageCount: d.usageCount,
          isActive: d.isActive,
        },
      })
    }
    console.log(`[Seed] Created ${MOCK_DISCOUNT_RULES.length} discount rules.`)

    // 7. Seed Payments
    for (const pay of MOCK_PAYMENTS) {
      const existingInvoice = pay.invoiceId
        ? await prisma.invoice.findUnique({ where: { id: pay.invoiceId } })
        : null
      const existingCustomer = pay.customerId
        ? await prisma.user.findUnique({ where: { id: pay.customerId } })
        : null

      await prisma.paymentRecord.upsert({
        where: { paymentNumber: pay.paymentNumber },
        update: {},
        create: {
          id: pay.id,
          paymentNumber: pay.paymentNumber,
          invoiceId: existingInvoice ? existingInvoice.id : null,
          invoiceNumber: pay.invoiceNumber,
          customerId: existingCustomer ? existingCustomer.id : null,
          customerName: pay.customerName,
          amount: pay.amount,
          paymentMethod: pay.paymentMethod,
          paymentDate: pay.paymentDate,
          notes: pay.notes,
          referenceId: pay.referenceId,
          status: pay.status,
        },
      })
    }
    console.log(`[Seed] Created ${MOCK_PAYMENTS.length} payment records.`)
    console.log('[Seed] Database initialization completed successfully!')
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err)
  }
}
