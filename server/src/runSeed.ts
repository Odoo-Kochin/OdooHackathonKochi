import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') })
dotenv.config()

import { seedDatabaseIfEmpty } from './lib/seed.js'
import { prisma } from './lib/prisma.js'

async function main() {
  console.log('[Seed Runner] Connecting to database...')
  await seedDatabaseIfEmpty()

  // Verify counts
  const users = await prisma.user.count()
  const products = await prisma.product.count()
  const plans = await prisma.subscriptionPlan.count()
  const subscriptions = await prisma.subscription.count()
  const invoices = await prisma.invoice.count()
  const discounts = await prisma.discountRule.count()
  const payments = await prisma.paymentRecord.count()

  console.log('\n=== Database Verification Summary ===')
  console.log(`Users:               ${users}`)
  console.log(`Products:            ${products}`)
  console.log(`Subscription Plans:  ${plans}`)
  console.log(`Subscriptions:       ${subscriptions}`)
  console.log(`Invoices:            ${invoices}`)
  console.log(`Discount Rules:      ${discounts}`)
  console.log(`Payment Records:     ${payments}`)
  console.log('=====================================\n')

  await prisma.$disconnect()
  process.exit(0)
}

main().catch(async (e) => {
  console.error('[Seed Runner] Error:', e)
  await prisma.$disconnect()
  process.exit(1)
})
