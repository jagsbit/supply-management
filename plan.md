# Plan.md — Agentic System Blueprint

> **Purpose:** This document instructs the AI agent to set up a complete
> multi-agent development system. Read this file fully, then create
> everything described below.

---

## 1. Overview

**System:** FORGE — Fast Orchestrated Rapid Generation Engine
**Goal:** Take a problem statement → deliver a deployed, working web application
**Pipeline:** Plan → Build → Test → Deploy
**Stack:** Next.js · Prisma · PostgreSQL · NextAuth · Tailwind · shadcn/ui · Zod · Vitest

---

## 2. Setup Instructions for the Agent

Read this entire document. Then do the following in order:

1. Detect your platform and create the appropriate instructions file:
   - Claude Code → `CLAUDE.md`
   - GitHub Copilot → `.github/copilot-instructions.md`
   - Cursor → `.cursorrules`
   - Any other → `AGENT.md`

2. The instructions file should contain:
   - Default tech stack and project structure conventions
   - Code standards: strict TypeScript, consistent API response format, service-layer pattern, no `any` types
   - Rules: secrets in `.env` only, hashed passwords, loading/error/empty states in UI, git commits after milestones

3. Create each agent described in Section 5
4. Set up MCP servers described in Section 7
5. Create the directory structure from Section 3
6. Create the environment template from Section 8
7. Commit everything: `[init] agentic system setup`

---

## 3. Directory Structure

    root/
    ├── agents/
    │   ├── forge.md             # Orchestrator agent
    │   ├── plan.md              # Planning agent
    │   ├── build.md             # Builder agent
    │   ├── test.md              # Testing agent
    │   └── deploy.md            # Deployment agent
    ├── .forge/                  # Working directory (agents use this)
    ├── .env.example             # Environment template with placeholders
    ├── .gitignore               # node_modules, .env, .next, dist
    ├── Plan.md                  # This file
    └── README.md                # Project documentation

---

## 4. Pipeline

    Human provides problem statement
            │
            ▼
      PLAN ──→ BUILD ──→ TEST ──→ DEPLOY
            │
      [checkpoint: human says "go"]

- After Plan → pause for human approval
- All other transitions → automatic
- On error → agent fixes it, retries up to 3 times, then asks human

---

## 5. Agents

### 5.1 Orchestrator — `agents/forge.md`

- Drives the entire pipeline from start to finish
- Reads problem statement → runs Plan → Build → Test → Deploy in sequence
- Tracks progress in `.forge/state.md`
- Moves between phases automatically after completion
- Fixes errors without asking — asks human only after 3 failed attempts
- When human says "go" or "continue" → proceeds immediately
- **Tools:** shell, git, sequential-thinking, playwright

### 5.2 Planner — `agents/plan.md`

- Analyzes the problem statement deeply
- Produces `.forge/plan.md` covering:
  - Data entities, fields, and relationships
  - Roles and what each role can or cannot do
  - Step-by-step user flows per role
  - Business rules the system must enforce
  - Database schema, API endpoints, and pages needed
- Does NOT write application code — only the plan
- Shows summary to human and waits for approval
- **Tools:** sequential-thinking

### 5.3 Builder — `agents/build.md`

- Reads `.forge/plan.md` and builds the complete application
- Works in order: scaffold → backend → frontend → integration
- Runs build checks after each step and fixes errors immediately
- Commits after each milestone
- Does not stop until the full application works end-to-end
- **Tools:** shell, git

### 5.4 Tester — `agents/test.md`

- Writes unit tests for business logic and validation schemas
- Runs a quality audit: security, error handling, UI completeness
- Creates project README with setup instructions and credentials
- Build and tests must both pass before marking done
- **Tools:** shell, git

### 5.5 Deployer — `agents/deploy.md`

- Verifies build and tests pass before deploying
- Pushes code to git, deploys to production platform
- Sets environment variables on the hosting platform
- Seeds the production database
- Verifies the live application works (login, core flow)
- Reports production URL and credentials to human
- **Tools:** shell, git, playwright

---

## 6. Skills and Hooks

### Skills (all agents share these capabilities)

- Read, create, and edit project files
- Execute terminal commands
- Read build/test errors, identify root cause, fix automatically
- Maintain pattern consistency across the codebase
- Read `.forge/` files to understand current project state

### Hooks (automatic triggers)

- **On start** → check for existing `.forge/state.md` → resume or initialize
- **On build failure** → read error → fix → rebuild (max 3 retries)
- **On phase complete** → git commit → advance to next phase
- **On human approval** → proceed immediately
- **On stuck** → log the issue → ask human for help

---

## 7. MCP Servers

Set up the following integrations. All tokens and credentials
are referenced from environment variables defined in Section 8.

- **Sequential Thinking** — deep reasoning for planning and architecture decisions
- **Playwright** — browser automation for testing and production verification
- **Git** — version control operations, uses `GIT_TOKEN`
- **Vercel** — deployment and hosting, uses `VERCEL_TOKEN`
- **Jira** *(optional)* — project tracking, uses `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`
- **Jenkins** *(optional)* — CI/CD pipelines, uses `JENKINS_URL`, `JENKINS_USER`, `JENKINS_TOKEN`
- **Azure** *(optional)* — cloud resources, uses `AZURE_SUBSCRIPTION_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`

---

## 8. Environment Template

Create `.env.example` with these placeholders:

    # Database
    DATABASE_URL=<your-postgresql-connection-string>

    # Authentication
    NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
    NEXTAUTH_URL=http://localhost:3000

    # Deployment
    VERCEL_TOKEN=<your-vercel-token>

    # Version Control
    GIT_TOKEN=<your-git-personal-access-token>

    # Optional — Jira
    JIRA_URL=<your-jira-instance-url>
    JIRA_EMAIL=<your-jira-email>
    JIRA_API_TOKEN=<your-jira-api-token>

    # Optional — Jenkins
    JENKINS_URL=<your-jenkins-url>
    JENKINS_USER=<your-jenkins-username>
    JENKINS_TOKEN=<your-jenkins-api-token>

    # Optional — Azure
    AZURE_SUBSCRIPTION_ID=<your-azure-subscription-id>
    AZURE_TENANT_ID=<your-azure-tenant-id>
    AZURE_CLIENT_ID=<your-azure-client-id>
    AZURE_CLIENT_SECRET=<your-azure-client-secret>

---

## 9. How to Use

1. Give this Plan.md to your AI agent
2. Agent sets up the entire system automatically
3. Fill in placeholder values in `.env`
4. Provide a problem statement
5. Say "go" when the plan looks good
6. Receive a deployed application

---

*FORGE v1.0 — One document. Any agent. Full automation.*