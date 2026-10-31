import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SubscriptionPlan } from '@shared/contracts/subscriptions.js'
import { Plus, Edit2, CheckCircle2, Hash, Calendar, Users, Layers, ShieldCheck } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/context/ToastContext'

export const Plans: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])

  const fetchPlans = async () => {
    try {
      const res = await axios.get('/api/plans')
      if (res.data.data) setPlans(res.data.data)
    } catch (err) {
      toast.error('Load Error', 'Failed to fetch subscription plans.')
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500">
            Define recurring frequencies (daily, weekly, monthly, yearly) and lifecycle termination rules.
          </p>
        </div>

        <button
          onClick={() => navigate('/plans/new')}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Plan (Step Wizard)</span>
        </button>
      </div>

      {/* Plans List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 opacity-60" />
                  <span>{plan.code}</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" />
                  <span>{plan.billingFrequency}</span>
                </span>
              </div>

              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white leading-snug flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span>{plan.name}</span>
              </h3>
              {plan.description && (
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{plan.description}</p>
              )}

              {/* Price Banner */}
              <div className="mt-3 p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/{plan.billingFrequency}</span>
                </div>
                <span className="text-[11px] text-slate-500 flex items-center">
                  <Users className="w-3 h-3 text-slate-400 mr-1" />
                  Min {plan.minimumQuantity} seat(s)
                </span>
              </div>

              {/* Lifecycle Rules Flags */}
              <div className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Auto-close on end:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {plan.autoCloseOnEnd ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <ShieldCheck className="w-3 h-3 text-slate-400 mr-1" />
                    Early termination:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {plan.canBeClosedEarly ? 'Allowed' : 'Locked'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pause & Resume:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {plan.canBePaused ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Start: {plan.startDate}</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
                <button
                  onClick={() => navigate(`/plans/${plan.id}/edit`)}
                  className="px-2 py-0.5 rounded text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-medium flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
