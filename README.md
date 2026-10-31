# Full-Stack Starter: React + TypeScript + Prisma + Supabase + Express

A production-ready full-stack scaffolding tailored for rapid prototyping and hackathon workflows.

---

## 🏗️ Architecture

```text
OdooHackathonKochi/
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
│   │   │   ├── prisma.ts       # Singleton PrismaClient instance with pool SSL support
│   │   │   └── supabase.ts     # Supabase admin & standard clients
│   │   ├── routes/
│   │   │   ├── health.ts       # Health check route (/api/health)
│   │   │   └── users.ts        # Example CRUD route with Zod validation
│   │   └── index.ts            # Express server initialization
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                     # Shared Contracts & Type Definitions
│   └── contracts/
│       └── users.ts            # Shared Zod schemas and TypeScript contracts
│
├── package.json                # Root orchestration with concurrently
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```
Installs all dependencies across the root project, the Vite client, and the Express backend in one command.

### 2. Configure Environment Variables
- **Client**: Update `client/.env` (from `client/.env.example`) with your Supabase credentials:
  ```env
  VITE_SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
  VITE_SUPABASE_ANON_KEY="your-anon-public-key"
  ```
- **Server**: Update `server/.env` (from `server/.env.example`) with your database connection strings:
  ```env
  PORT=5000
  CLIENT_ORIGIN=http://localhost:3000

  # Set USE_MOCKS=true for offline mock data; set to false to query live Supabase DB
  USE_MOCKS=false

  # Supabase Dashboard -> Project Settings -> Database -> Connection string
  # Transaction Pooler (port 6543) or Session Pooler (port 5432)
  DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

  # Direct connection (port 5432) for running migrations
  DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

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

## 📦 Build & Scripts

| Command | Action |
| --- | --- |
| `npm run install:all` | Install all dependencies for root, `client`, and `server` |
| `npm run dev` | Launch both client and server concurrently with live reload |
| `npm run dev:client` | Start frontend development server only (Vite) |
| `npm run dev:server` | Start backend development server only (Express + TSX) |
| `npm run build` | Build both backend (`tsc`) and frontend (`vite build`) for production |
| `npm test` | Run automated backend integration test suites (Node Test Runner + Supertest) |

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

## 🤝 Shared Contracts & Type Safety

The [`shared/contracts/`](file:///c:/Users/ASUS/Desktop/Odoo-Kochin/OdooHackathonKochi/shared/contracts) directory bridges the backend and frontend:
- **Single Source of Truth**: Data models are defined once using [Zod](https://zod.dev).
- **Static Types**: TypeScript types are inferred with `z.infer<typeof ...>` for use in client UI and server request handlers.
- **Mock Data**: Canonical mock objects (`MOCK_USERS`) allow offline or fast isolated testing before database provisioning.

---

## 🎨 UI & Styling

- **Tailwind CSS v4**: Ultra-fast compile times, modern styling.
- **shadcn/ui Pattern**: Pre-configured in `client/src/components/ui/` (`Button`, `Card`, `Badge`, `Input`).
- **Lucide Icons**: Ready for instant use (`import { Sparkles } from 'lucide-react'`).
- **Path Aliases**: `@/components/...`, `@/lib/...` resolve directly to `client/src/...`.
