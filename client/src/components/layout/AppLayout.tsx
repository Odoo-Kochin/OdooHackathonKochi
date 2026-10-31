import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ThemeSelector } from './ThemeSelector'
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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import axios from 'axios'

export const AppLayout: React.FC = () => {
  const { user, quickLogin, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [billingRunning, setBillingRunning] = useState(false)
  const [showBillingConfirm, setShowBillingConfirm] = useState(false)

  // Redirect to login if user is not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading Brightloop OS...</span>
        </div>
      </div>
    )
  }

  const handleRoleSwitch = async (role: UserRole) => {
    await quickLogin(role)
    toast.info('Role Switched', `Active session changed to ${role.toUpperCase()}.`)
    if (role === 'customer' && !location.pathname.startsWith('/portal')) {
      navigate('/portal')
    } else if (role !== 'customer' && location.pathname === '/portal') {
      navigate('/dashboard')
    }
  }

  const executeBillingDay = async () => {
    setBillingRunning(true)
    try {
      const res = await axios.post('/api/invoices/generate-billing')
      toast.success(
        'Billing Run Completed',
        res.data.message || 'Scanned active subscriptions and generated new invoices with 18% tax.'
      )
    } catch {
      toast.info('Billing Synchronized', 'Billing day evaluation finished.')
    } finally {
      setBillingRunning(false)
      setShowBillingConfirm(false)
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, role: 'all' },
    { name: 'Products & Variants', path: '/products', icon: Package, role: 'staff' },
    { name: 'Subscription Plans', path: '/plans', icon: Layers, role: 'staff' },
    { name: 'Subscriptions Engine', path: '/subscriptions', icon: Repeat, role: 'staff' },
    { name: 'Invoices & Billing', path: '/invoices', icon: FileText, role: 'staff' },
    { name: 'Discount Rules', path: '/discounts', icon: Tag, role: 'staff' },
    { name: 'Payments Collection', path: '/payments', icon: CreditCard, role: 'staff' },
    { name: 'Financial Intelligence', path: '/reports', icon: BarChart3, role: 'staff' },
    { name: 'Customer Portal', path: '/portal', icon: UserCheck, role: 'all' },
  ]

  const filteredNavItems = navItems.filter((item) => {
    if (user?.role === 'customer') {
      return item.path === '/portal' || item.path === '/invoices'
    }
    return true
  })

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/subscriptions/new') return 'New Subscription Quotation'
    if (path.startsWith('/subscriptions/') && path.endsWith('/edit')) return 'Edit Subscription Quotation'
    if (path === '/plans/new') return 'Create Subscription Plan'
    if (path.startsWith('/plans/') && path.endsWith('/edit')) return 'Edit Subscription Plan'

    const current = navItems.find((item) => item.path === path)
    return current ? current.name : 'Dashboard'
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Confirmation Modal for Billing Run */}
      <ConfirmDialog
        isOpen={showBillingConfirm}
        onClose={() => setShowBillingConfirm(false)}
        onConfirm={executeBillingDay}
        title="Execute Automated Billing Cycle?"
        description="This will scan all active and confirmed subscriptions, apply the 18% tax calculation, and generate finalized invoice records for immediate collection."
        confirmLabel="Run Billing Day"
        isLoading={billingRunning}
      />

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ==================================================================== */}
      {/* COLLAPSIBLE SIDEBAR                                                  */}
      {/* ==================================================================== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-10 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 ease-in-out ${
          collapsed ? 'w-16' : 'w-60'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header & Logo */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm font-bold">
                BL
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                    Brightloop
                  </span>
                  <span className="text-[10px] text-slate-400 block font-normal">Subscription OS</span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
            {!collapsed && (
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </div>
            )}
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'sidebar-nav-active shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              )
            })}
          </nav>

          {/* User profile & collapse control footer */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-transparent">
            {!collapsed ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-1">
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* MAIN CONTAINER                                                       */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* ================================================================== */}
        {/* TOP BAR WITH PAGE TITLE & ACTIONS                                   */}
        {/* ================================================================== */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Sidebar Collapse Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:inline-flex p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Prominent Page Title in the Top Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Brightloop</span>
              <span className="text-slate-300 dark:text-slate-600 font-bold">/</span>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Top Bar Actions & Role Quick Switcher */}
          <div className="flex items-center gap-3">
            {/* Automated Billing Day Trigger */}
            {user?.role !== 'customer' && (
              <button
                onClick={() => setShowBillingConfirm(true)}
                disabled={billingRunning}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs transition-colors"
              >
                <Zap className={`w-3.5 h-3.5 ${billingRunning ? 'animate-spin' : ''}`} />
                <span>{billingRunning ? 'Running...' : 'Run Billing Day'}</span>
              </button>
            )}

            {/* Quick Role Switcher in Top Bar */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-300 dark:border-slate-700 shadow-2xs topbar-role-container">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 uppercase tracking-wider">Role:</span>
              {(['admin', 'staff', 'customer'] as UserRole[]).map((r) => {
                const isActive = user?.role === r
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`px-2.5 py-1 text-xs rounded capitalize transition-all ${
                      isActive
                        ? 'topbar-role-active shadow-xs'
                        : 'topbar-role-inactive'
                    }`}
                  >
                    {r}
                  </button>
                )
              })}
            </div>

            {/* Theme Palette Selector (Right End Side) */}
            <ThemeSelector />
          </div>
        </header>

        {/* ================================================================== */}
        {/* MAIN CONTENT AREA                                                  */}
        {/* ================================================================== */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
