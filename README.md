# FORGE — Office Supply Management System

A multi-agent GitHub Copilot system that builds and deploys a complete web app from a problem statement.

## Quick Start

1. Open this folder in VS Code
2. Open Copilot Chat → switch to **Agent Mode**
3. Click the prompt picker (📎 or `/`) → select **`forge`**
4. Paste the problem statement below
5. Review the plan → say `go`
6. Let Copilot build → get your deployed URL 🎉

## Problem Statement

```
The system must support two roles: Admin and Employee.
Employees should be able to submit requests for office supplies through a form.
Each request must include item name, quantity, and optional remarks.
Admin should have access to view current inventory only.
Admin can approve or reject requests based on inventory availability.
Approved requests should update the inventory accordingly.
Rejected requests should be recorded with a reason (optional).
The system should maintain a history of all requests and their status.
The user interface must be simple, clear, and easy to navigate.

Build and deploy this to Vercel.
```

## Available Agents

| Agent | Command | What it does |
|-------|---------|--------------|
| **forge** | `@forge` | Full orchestrator: Plan → Build → Test → Deploy |
| **plan** | `@plan` | Analyze problem & write development plan only |
| **build** | `@build` | Build the complete application from the plan |
| **test** | `@test` | Run tests and quality audit |
| **deploy** | `@deploy` | Deploy to Vercel and verify |

## Prerequisites

- VS Code with GitHub Copilot Enterprise
- Node.js 18+
- Git configured
- Vercel CLI: `npm i -g vercel && vercel login`
- Neon PostgreSQL account: https://neon.tech (free tier)

## Environment Setup

```bash
cp .env.example .env
# Edit .env with your real Neon connection string and auth secret
```

## MCP Tools

This project uses:
- **playwright** — for browser automation during deployment verification
- **sequential-thinking** — for deep analysis during planning
