import React, { useState, useEffect } from 'react'
import type { Product, ProductVariant } from '@shared/contracts/subscriptions.js'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/context/ToastContext'
import { Plus, Trash2 } from 'lucide-react'
import axios from 'axios'

export const Products: React.FC = () => {
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Form states
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<'software' | 'service' | 'addon'>('software')
  const [salesPrice, setSalesPrice] = useState<number>(350)
  const [costPrice, setCostPrice] = useState<number>(70)
  const [notes, setNotes] = useState('')

  // Variants (e.g. Odoo brand +$560)
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
      toast.success(
        'Product Added',
        `Product "${name}" (${code}) was created and added to the catalog.`
      )
      setName('')
      setCode('')
      setNotes('')
      fetchProducts()
    } catch (err) {
      toast.error('Creation Failed', 'Could not create product record.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500">
            Catalog with multi-brand variant modifiers (e.g. Odoo Edition sync adds +$560).
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((prod) => {
          const margin = prod.salesPrice - prod.costPrice
          const marginPercent = Math.round((margin / prod.salesPrice) * 100)

          return (
            <div
              key={prod.id}
              className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {prod.code}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
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

                <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {prod.name}
                </h3>
                {prod.notes && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{prod.notes}</p>
                )}

                {/* Pricing summary */}
                <div className="mt-3 p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Sales Price</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      ${prod.salesPrice}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Margin</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      ${costPrice} ({marginPercent}%)
                    </span>
                  </div>
                </div>

                {/* Variants breakdown */}
                <div className="mt-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Variants ({prod.variants.length})
                  </span>
                  {prod.variants.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No variants</span>
                  ) : (
                    <div className="space-y-1">
                      {prod.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-xs"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                            {v.name}
                          </span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs ml-2">
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

              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Created {new Date(prod.createdAt).toLocaleDateString()}</span>
                <span className="text-emerald-600 font-medium">Active</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Product & Variants"
        description="Configure standard catalog product with multi-brand variant modifiers."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Brightloop Cloud Storage"
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Product SKU / Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BL-STORE-01"
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="software">Software</option>
                <option value="service">Service</option>
                <option value="addon">Add-On</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sales Price ($)
              </label>
              <input
                type="number"
                required
                value={salesPrice}
                onChange={(e) => setSalesPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Technical specifications or support notes."
              className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Variants */}
          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Variants (e.g. Odoo brand +$560)
              </span>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-1.5">
              {variants.map((v, idx) => (
                <div key={v.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const updated = [...variants]
                      updated[idx].name = e.target.value
                      setVariants(updated)
                    }}
                    placeholder="Variant Name"
                    className="flex-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">+$</span>
                    <input
                      type="number"
                      value={v.priceAdjustment}
                      onChange={(e) => {
                        const updated = [...variants]
                        updated[idx].priceAdjustment = Number(e.target.value)
                        setVariants(updated)
                      }}
                      className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
