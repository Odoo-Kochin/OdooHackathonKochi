import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, UserPlus, Users } from 'lucide-react'
import axios from 'axios'
import type { User, UserListResponse } from '@shared/contracts/users.js'

interface HealthResponse {
  status: string
  message: string
  timestamp: string
  services: {
    server: string
    database: string
  }
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [healthRes, usersRes] = await Promise.all([
        axios.get<HealthResponse>('/api/health'),
        axios.get<UserListResponse>('/api/users'),
      ])
      setHealth(healthRes.data)
      setUsers(usersRes.data.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setCreating(true)
    try {
      await axios.post('/api/users', { name, email })
      setName('')
      setEmail('')
      await fetchData()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Contract-First Full-Stack Architecture
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            React + TypeScript + Prisma + Supabase + Express
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
            Endpoints are contract-driven with shared Zod schemas & mock data guarantees.
          </p>
        </div>

        {/* Status Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">System Status</CardTitle>
              <CardDescription>Real-time proxy ping to Express & Prisma database</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
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
              <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      {health?.message}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Timestamp: {health?.timestamp}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract-First Demo Section */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-xl">Contract Users List (/api/users)</CardTitle>
              </div>
              <Badge variant="outline">Contract: @shared/contracts/users.ts</Badge>
            </div>
            <CardDescription>
              Loaded over real HTTP using shared types and mock-guaranteed response payloads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Create Form */}
            <form onSubmit={handleCreateUser} className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Full Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" disabled={creating} className="shrink-0 gap-2">
                <UserPlus className="w-4 h-4" />
                {creating ? 'Adding...' : 'Add User'}
              </Button>
            </form>

            {/* Users List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-lg overflow-hidden">
              {users.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No users found.</div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {u.name || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between">
            <span>Powered by Shared Zod Contract</span>
            <span>Zero Integration Mismatch</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default App
