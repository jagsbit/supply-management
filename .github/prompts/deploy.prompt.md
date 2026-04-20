---
description: "Deploy the application to Vercel"
mode: "agent"
tools: ["playwright"]
---

# Deploy

## Step 1 — Pre-deploy Check
- Run `npm run build` — must pass
- Run `npm run test` — must pass
- Commit any uncommitted changes: `[pre-deploy] final check`

## Step 2 — Push to GitHub
```bash
git push origin main
```

## Step 3 — Deploy to Vercel
```bash
vercel --prod
```

## Step 4 — Set Environment Variables
Set these on Vercel (dashboard or CLI):
- `DATABASE_URL` — the Neon production connection string
- `NEXTAUTH_SECRET` — the generated secret
- `NEXTAUTH_URL` — the Vercel deployment URL (update after first deploy)

## Step 5 — Production Database
```bash
npx prisma db push
npx prisma db seed
```

## Step 6 — Verify Live App
Use playwright to open the production URL and verify:
- Login page loads
- Login as admin works → admin dashboard shows
- Login as employee works → employee dashboard shows
- Core flow works: submit request → admin sees it → approve/reject → inventory updates

## Step 7 — Report to User
Tell the user:
- The production URL
- Admin credentials (email + password)
- Employee credentials (email + password)
