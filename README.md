# Full-Stack Starter: React + TypeScript + Prisma + Supabase + Express

A production-ready full-stack scaffolding tailored for rapid prototyping and hackathon workflows.

---

## 🏗️ Architecture

```text
OdooKochi/
├── client/                     # Frontend (React 19 + TypeScript + Vite)
│   ├── src/
│   │   ├── components/ui/      # Pre-configured shadcn/ui components (Button, Card, Badge, Input)
│   │   ├── lib/
│   │   │   ├── utils.ts        # cn helper (clsx + tailwind-merge)
│   │   │   └── supabase.ts     # Supabase client for client-side Auth / Realtime
│   │   ├── App.tsx             # Interactive dashboard & API health status check
│   │   ├── index.css           # Tailwind CSS v4 styling & color theme
│   │   └── main.tsx
│   ├── vite.config.ts          # Configured with @ alias & /api proxy to port 5000
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + TypeScript)
│   ├── prisma/
│   │   └── schema.prisma       # Clean Prisma schema (provider & models)
│   ├── prisma.config.ts        # Prisma connection config (CLI migrations point to DIRECT_URL)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.ts       # Singleton PrismaClient instance
│   │   │   └── supabase.ts     # Supabase admin & standard clients
│   │   ├── routes/
│   │   │   ├── health.ts       # Health check route (/api/health)
│   │   │   └── users.ts        # Example CRUD route with Zod validation
│   │   └── index.ts            # Express server initialization
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```
*(Dependencies are already installed during scaffold setup).*

### 2. Configure Environment Variables
- **Client**: Update [client/.env](file:///c:/Users/arund/OneDrive/Documents/OdooKochi/client/.env) with your Supabase credentials:
  ```env
  VITE_SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
  VITE_SUPABASE_ANON_KEY="your-anon-public-key"
  ```
- **Server**: Update [server/.env](file:///c:/Users/arund/OneDrive/Documents/OdooKochi/server/.env) with your Supabase database connection strings:
  ```env
  PORT=5000
  CLIENT_ORIGIN=http://localhost:3000

  # Supabase Dashboard -> Project Settings -> Database -> Connection string
  # Transaction Pooler (port 6543)
  DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

  # Direct connection (port 5432) for running migrations
  DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

  SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
  SUPABASE_ANON_KEY="your-anon-public-key"
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"
  ```

### 3. Run Development Servers
Start both backend (Express on `http://localhost:5000`) and frontend (Vite on `http://localhost:3000`) concurrently with one command:
```bash
npm run dev
```

Or run them individually:
```bash
npm run dev:client   # Frontend only (port 3000)
npm run dev:server   # Backend only (port 5000) with auto-reload (tsx)
```

---

## 🗄️ Database & Prisma Workflows

Run these commands from the project root:

| Command | Action |
| --- | --- |
| `npm run prisma:generate` | Regenerate Prisma Client types when schema changes |
| `npm run prisma:push` | Fast prototype: push schema directly to Supabase DB without migrations |
| `npm run prisma:migrate` | Create and apply a versioned migration |
| `npm run prisma:studio` | Launch visual browser GUI to view and edit database rows |

---

## 🎨 UI & Styling

- **Tailwind CSS v4**: Ultra-fast compile times, no config bloat.
- **shadcn/ui Pattern**: Pre-configured in `client/src/components/ui/` (`Button`, `Card`, `Badge`, `Input`).
- **Lucide Icons**: Ready for instant use (`import { Sparkles } from 'lucide-react'`).
- **Path Aliases**: `@/components/...`, `@/lib/...` resolve directly to `client/src/...`.

