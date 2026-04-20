---
description: "Test and quality check the application"
mode: "agent"
---

# Test & Polish

## Step 1 — Tests
- Install Vitest: `npm install -D vitest @vitejs/plugin-react`
- Configure `vitest.config.ts`
- Write tests for:
  - All service functions (business logic, edge cases)
  - All Zod validation schemas (valid input, invalid input, boundary cases)
  - Key utility functions

## Step 2 — Quality Audit
Check for:
- Hardcoded secrets or credentials anywhere in code
- API routes missing authentication or role checks
- Forms missing validation or error display
- Pages missing loading states or empty states
- Console.log statements left in code
- Unused imports or dead code

Fix everything you find.

## Step 3 — README
Create `README.md` covering:
- What the app does (one paragraph)
- Tech stack
- How to set up locally (clone, install, env, prisma push, seed, dev)
- Default login credentials

## Step 4 — Final Check
- `npm run build` must pass
- `npm run test` must pass

**Commit:** `[test] tests and quality audit complete`
