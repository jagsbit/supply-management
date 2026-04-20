---
description: "Build the complete application from the plan"
mode: "agent"
---

# Build

Read `.forge/plan.md`. If it doesn't exist, tell the user to run @plan first.

Build the complete application in this order:

## Step 1 — Scaffold

Set up the project foundation:
- Initialize Next.js with TypeScript, Tailwind, App Router, src directory
- Install dependencies: prisma, @prisma/client, next-auth@beta, @auth/prisma-adapter, zod, react-hook-form, @hookform/resolvers, bcryptjs, @types/bcryptjs
- Initialize shadcn/ui and add components you'll need (button, card, input, label, table, badge, dialog, select, textarea, toast, dropdown-menu, separator, tabs)
- Create the Prisma schema from the plan
- Set up `.env` from `.env.example` — use `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/officesupply"`
- Create the database: `docker exec postgres-db psql -U postgres -c "CREATE DATABASE officesupply;"`
- Run `npx prisma db push` and `npx prisma generate`
- Create the directory structure: `src/lib/`, `src/services/`, `src/types/`, `src/components/`, `src/lib/validations/`

**Check:** `npm run build` must pass.
**Commit:** `[scaffold] project initialized`

## Step 2 — Backend

Build all server-side code:
- Prisma client singleton (`src/lib/db.ts`)
- Shared TypeScript types (`src/types/index.ts`)
- Zod validation schemas for every form and API input (`src/lib/validations/`)
- Service functions for all business logic (`src/services/`) — these talk to the database
- NextAuth configuration with credentials provider, role in JWT token and session
- Middleware for protecting routes based on authentication and role
- All API route handlers — each one validates input, checks auth/role, calls a service, returns response
- Seed script with default users (hashed passwords) and sample data

Run the seed: `npx prisma db seed`

**Check:** `npm run build` must pass.
**Commit:** `[backend] API layer complete`

## Step 3 — Frontend

Build all pages and components:
- Root layout with SessionProvider and Toaster
- Login page with email/password form, validation errors, loading state
- Dashboard layout with a sidebar that shows different links based on user role
- Every page from the plan — tables, forms, action buttons, confirmation dialogs
- An API client helper (`src/lib/api.ts`) so fetch calls are clean and consistent
- Connect every page to its backend endpoints

**Check:** `npm run build` must pass.
**Commit:** `[frontend] all pages complete`

## Step 4 — Connect & Verify

Make sure everything works together:
- Every form submits to the right API endpoint and handles success/error
- Every table loads data from the right API endpoint
- Role-based navigation works (employee can't see admin pages, admin can't see employee-only pages)
- The core business flow works end-to-end (submit request → admin approves → inventory updates)

**Check:** `npm run build` must pass.
**Commit:** `[integration] app wired end-to-end`
