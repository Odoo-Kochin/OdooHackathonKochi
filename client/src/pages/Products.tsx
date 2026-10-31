import React, { useState, useEffect } from 'react'
import type { Product, ProductVariant } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import {
  Plus,
  Trash2,
} from 'lucide-react'
import axios from 'axios'

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Form states
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<'software' | 'service' | 'addon'>('software')
  const [salesPrice, setSalesPrice] = useState<number>(350)
  const [costPrice, setCostPrice] = useState<number>(70)
  const [notes, setNotes] = useState('')

  // Variants (e.g. Odoo brand +$560 per problem statement)
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: 'var-demo-1',
      name: 'Odoo Edition Sync',
      attributeName: 'Brand',
      attributeValue: 'Odoo Brand Connector',
      priceAdjustment: 560,
    },
  ])

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products')
      if (res.data.data) setProducts(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}`,
        name: 'Enterprise Dedicated Tier',
        attributeName: 'Tier',
        attributeValue: 'Dedicated Cluster',
        priceAdjustment: 250,
      },
    ])
  }

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/products', {
        name,
        code,
        type,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice),
        notes,
        variants,
      })
      setModalOpen(false)
      setName('')
      setCode('')
      setNotes('')
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Scene 2: Catalog & Variants
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Products & Add-Ons
          </h2>
          <p className="text-xs text-slate-500">
            Configure product catalog with multi-brand variants (e.g. Odoo brand adds +$560).
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Product</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => {
          const margin = prod.salesPrice - prod.costPrice
          const marginPercent = Math.round((margin / prod.salesPrice) * 100)

          return (
            <div
              key={prod.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pill-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {prod.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      prod.type === 'software'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : prod.type === 'service'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {prod.type}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {prod.name}
                </h3>
                {prod.notes && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{prod.notes}</p>
                )}

                {/* Pricing & Margin info */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Base Sales Price
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ${prod.salesPrice}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Cost / Margin
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ${prod.costPrice} ({marginPercent}%)
                    </span>
                  </div>
                </div>

                {/* Variants breakdown (Scene 2 spec) */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Configured Variants ({prod.variants.length})
                  </span>
                  {prod.variants.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No variants attached</span>
                  ) : (
                    <div className="space-y-1.5">
                      {prod.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 text-xs text-indigo-950 dark:text-indigo-200"
                        >
                          <span className="font-medium truncate">{v.name}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-2">
                            {v.priceAdjustment >= 0
                              ? `+$${v.priceAdjustment}`
                              : `-$${Math.abs(v.priceAdjustment)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Created {new Date(prod.createdAt).toLocaleDateString()}</span>
                <span className="font-semibold text-emerald-600">Active in Catalog</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Launch New Product & Variants"
        description="Add a base product with sales price, cost price, and pricing variants."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Brightloop Cloud Storage Add-On"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Product Code / SKU
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BL-STORE-09"
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="software">Software</option>
                <option value="service">Service</option>
                <option value="addon">Add-On</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Sales Price ($)
              </label>
              <input
                type="number"
                required
                value={salesPrice}
                onChange={(e) => setSalesPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Internal Notes & Specs
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Requires enterprise license or API secret integration."
              className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Variants Builder (Scene 2: e.g. Odoo brand adds +560) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Product Variants & Modifiers
              </span>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={v.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const updated = [...variants]
                      updated[idx].name = e.target.value
                      setVariants(updated)
                    }}
                    placeholder="Variant Name"
                    className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">$+</span>
                    <input
                      type="number"
                      value={v.priceAdjustment}
                      onChange={(e) => {
                        const updated = [...variants]
                        updated[idx].priceAdjustment = Number(e.target.value)
                        setVariants(updated)
                      }}
                      className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-right font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md"
            >
              Save Product & Variants
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
