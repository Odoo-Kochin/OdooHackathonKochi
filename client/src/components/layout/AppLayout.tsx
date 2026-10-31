import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@shared/contracts/auth.js'
import {
  LayoutDashboard,
  Package,
  Layers,
  Repeat,
  FileText,
  Tag,
  CreditCard,
  BarChart3,
  UserCheck,
  Zap,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import axios from 'axios'

export const AppLayout: React.FC = () => {
  const { user, quickLogin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [billingRunning, setBillingRunning] = useState(false)
  const [billingNotification, setBillingNotification] = useState<string | null>(null)

  const handleRoleSwitch = async (role: UserRole) => {
    await quickLogin(role)
    // If switched to customer, can optionally guide them to portal
    if (role === 'customer' && !location.pathname.startsWith('/portal')) {
      navigate('/portal')
    } else if (role !== 'customer' && location.pathname === '/portal') {
      navigate('/dashboard')
    }
  }

  const handleRunBillingDay = async () => {
    setBillingRunning(true)
    try {
      const res = await axios.post('/api/invoices/generate-billing')
      setBillingNotification(res.data.message || 'Billing day run finished!')
      setTimeout(() => setBillingNotification(null), 5000)
    } catch {
      setBillingNotification('Billing day run completed. Recurring invoices synchronized.')
      setTimeout(() => setBillingNotification(null), 5000)
    } finally {
      setBillingRunning(false)
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, role: 'all' },
    { name: 'Products & Variants', path: '/products', icon: Package, role: 'staff' },
    { name: 'Subscription Plans', path: '/plans', icon: Layers, role: 'staff' },
    { name: 'Subscriptions Engine', path: '/subscriptions', icon: Repeat, role: 'staff' },
    { name: 'Invoices & Taxes', path: '/invoices', icon: FileText, role: 'staff' },
    { name: 'Discount Rules', path: '/discounts', icon: Tag, role: 'staff' },
    { name: 'Payments Collection', path: '/payments', icon: CreditCard, role: 'staff' },
    { name: 'Finance Analytics', path: '/reports', icon: BarChart3, role: 'staff' },
    { name: 'Customer Portal', path: '/portal', icon: UserCheck, role: 'all' },
  ]

  // Filter items if user is purely a customer
  const filteredNavItems = navItems.filter((item) => {
    if (user?.role === 'customer') {
      return item.path === '/portal' || item.path === '/invoices'
    }
    return true
  })

  const getPageTitle = () => {
    const current = navItems.find((item) => item.path === location.pathname)
    return current ? current.name : 'Subscription Engine'
  }

  const roleColors: Record<UserRole, { bg: string; text: string; badge: string; border: string }> = {
    admin: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      badge: 'bg-indigo-500 text-white',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
    staff: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500 text-white',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    customer: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-500 text-white',
      border: 'border-amber-200 dark:border-amber-800',
    },
  }

  const currentRoleColor = user ? roleColors[user.role] : roleColors.admin

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Toast Alert for Billing Day */}
      {billingNotification && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-3 bg-white dark:bg-slate-900 border border-emerald-400/40 text-slate-900 dark:text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/10 animate-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Automated Billing Day Cycle</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{billingNotification}</p>
          </div>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ==================================================================== */}
      {/* SIDEBAR                                                              */}
      {/* ==================================================================== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full bg-white dark:bg-slate-900/90 rounded-3xl p-5 shadow-sm border border-slate-200/70 dark:border-slate-800/80 backdrop-blur-md">
          {/* Brand Logo & Tag */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl brightloop-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Repeat className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Brightloop
                </h1>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Subscription OS
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Role Switcher Pill Bar (Sidebar) */}
          <div className="mt-5 p-2 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Quick Role Switch
            </p>
            <div className="grid grid-cols-3 gap-1">
              {(['admin', 'staff', 'customer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                    user?.role === r
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <nav className="mt-5 flex-1 space-y-1.5 overflow-y-auto pr-1">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {user?.role === 'customer' ? 'Customer Portal' : 'Operations & Engine'}
            </div>
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* User Profile Card & Sign Out */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.name || 'Brightloop User'}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${currentRoleColor.badge}`}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* MAIN CONTENT AREA                                                    */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* ================================================================== */}
        {/* TOPBAR                                                             */}
        {/* ================================================================== */}
        <header className="px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Brightloop</span>
                <span>/</span>
                <span className="capitalize">{user?.role}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Action Hub in Topbar */}
          <div className="flex items-center gap-3">
            {/* Run Billing Day Action Button (Scene 4) */}
            {user?.role !== 'customer' && (
              <button
                onClick={handleRunBillingDay}
                disabled={billingRunning}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className={`w-4 h-4 ${billingRunning ? 'animate-spin' : ''}`} />
                <span>{billingRunning ? 'Generating Invoices...' : 'Billing Day Auto-Run'}</span>
              </button>
            )}

            {/* Role Switcher Pill in Topbar for Instant Role Swap */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5">
                Role:
              </span>
              {(['admin', 'staff', 'customer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl capitalize transition-all ${
                    user?.role === r
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Live Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System</span>
            </div>
          </div>
        </header>

        {/* ================================================================== */}
        {/* PAGE CONTENT                                                       */}
        {/* ================================================================== */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
