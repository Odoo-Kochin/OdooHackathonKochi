import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppLayout } from '@/components/layout/AppLayout'

// Pages
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Products } from '@/pages/Products'
import { Plans } from '@/pages/Plans'
import { PlanWizard } from '@/pages/PlanWizard'
import { Subscriptions } from '@/pages/Subscriptions'
import { SubscriptionWizard } from '@/pages/SubscriptionWizard'
import { Invoices } from '@/pages/Invoices'
import { Discounts } from '@/pages/Discounts'
import { Payments } from '@/pages/Payments'
import { FinanceReports } from '@/pages/FinanceReports'
import { CustomerPortal } from '@/pages/CustomerPortal'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Main App with Persistent Sidebar & Topbar Layout */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="plans" element={<Plans />} />
                <Route path="plans/new" element={<PlanWizard />} />
                <Route path="plans/:id/edit" element={<PlanWizard />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="subscriptions/new" element={<SubscriptionWizard />} />
                <Route path="subscriptions/:id/edit" element={<SubscriptionWizard />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="discounts" element={<Discounts />} />
                <Route path="payments" element={<Payments />} />
                <Route path="reports" element={<FinanceReports />} />
                <Route path="portal" element={<CustomerPortal />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
