import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  Repeat,
  FileText,
  CreditCard,
  Package,
  Layers,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import axios from 'axios'

interface HealthResponse {
  status: string
  message: string
  timestamp: string
  services: {
    server: string
    database: string
  }
}

interface ModuleCard {
  title: string
  description: string
  icon: typeof Package
  tag: string
}

const MODULES: ModuleCard[] = [
  {
    title: 'Products',
    description: 'Manage recurring products, pricing tiers and unit metrics.',
    icon: Package,
    tag: 'Catalog',
  },
  {
    title: 'Subscription Plans',
    description: 'Configure billing frequencies, trial periods and pricing models.',
    icon: Layers,
    tag: 'Pricing',
  },
  {
    title: 'Customers',
    description: 'Client directory, account profiles, and billing configurations.',
    icon: Users,
    tag: 'Directory',
  },
  {
    title: 'Subscriptions',
    description: 'Track lifecycle, activations, upgrades, pauses, and renewals.',
    icon: Repeat,
    tag: 'Core Engine',
  },
  {
    title: 'Invoices',
    description: 'Automated recurring invoice generation, PDF exports and tax items.',
    icon: FileText,
    tag: 'Billing',
  },
  {
    title: 'Payments',
    description: 'Payment gateway integrations, automatic retries and receipts.',
    icon: CreditCard,
    tag: 'Settlement',
  },
  {
    title: 'Analytics',
    description: 'MRR tracking, churn analytics, lifetime value and revenue trends.',
    icon: BarChart3,
    tag: 'Insights',
  },
]

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get<HealthResponse>('/api/health')
      setHealth(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Hackathon Edition • Contract-First Architecture
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            SubscriptIQ – Subscription Management System
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
            A centralized platform for managing subscription plans, recurring billing, invoices and payments.
          </p>
        </div>

        {/* System Status Section */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">System Status</CardTitle>
              <CardDescription>
                Monitor application server and database connectivity.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHealth}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Connecting to backend API...
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Backend Unreachable</p>
                  <p className="opacity-90">{error}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      {health?.message}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Server: {health?.services?.server} • Database: {health?.services?.database}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Management Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Subscription Management Overview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Key metrics and operational baseline values.
              </p>
            </div>
            <Badge variant="outline">Initial Baseline</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Customers */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Customers
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">0</div>
                <p className="text-xs text-slate-500 mt-1">Initial / Empty baseline</p>
              </CardContent>
            </Card>

            {/* Card 2: Active Subscriptions */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Subscriptions
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <Repeat className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">0</div>
                <p className="text-xs text-slate-500 mt-1">Initial / Empty baseline</p>
              </CardContent>
            </Card>

            {/* Card 3: Total Invoices */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Invoices
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">0</div>
                <p className="text-xs text-slate-500 mt-1">Initial / Empty baseline</p>
              </CardContent>
            </Card>

            {/* Card 4: Outstanding Payments */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Outstanding Payments
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                  <CreditCard className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹0</div>
                <p className="text-xs text-slate-500 mt-1">Initial / Empty baseline</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Modules
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Core functional modules for subscription lifecycle management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((module) => {
              const Icon = module.icon
              return (
                <Card
                  key={module.title}
                  className="border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-150 cursor-pointer group shadow-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" className="text-[11px]">
                        {module.tag}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0 text-xs text-slate-400 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>Explore module</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-4 pb-8 border-t border-slate-200 dark:border-slate-800">
          SubscriptIQ • Built for Odoo Hackathon • Contract-First Protocol
        </div>
      </div>
    </div>
  )
}

export default App
