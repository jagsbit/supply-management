---
description: "Analyze a problem statement and create a development plan"
mode: "agent"
tools: ["sequential-thinking"]
---

# Plan

You are given a problem statement. Your job is to think it through and create a clear, practical development plan.

## What to Think About

Use sequential-thinking to deeply analyze:

1. **Entities** — What are the data objects in this system? What fields does each one need? How do they connect to each other? Think about IDs, foreign keys, enums for status fields.

2. **Roles** — Who are the users? For each role, what can they see? What can they do? What are they NOT allowed to do?

3. **User Flows** — For each role, walk through their journey step by step. From login to their main task to completion. What do they click? What do they see? What happens behind the scenes?

4. **Business Rules** — What logic does the system enforce? Examples: "Approving a request deducts from inventory." "You can't approve if stock is insufficient." "Rejected requests need an optional reason."

5. **Scope** — What's essential to build (the system doesn't work without it) vs what's nice to have?

## What to Produce

Write `.forge/plan.md` with these sections:

```
# Development Plan

## Entities
[List each entity with its fields and relationships]

## Roles & Permissions
[Table or list: what each role can and cannot do]

## User Flows
[Numbered steps for each role's main journey]

## Business Rules
[Numbered list of rules the system must enforce]

## Database Schema
[Prisma-style schema — models, fields, relations, enums]

## API Endpoints
[Table: method, path, who can access, what it does]

## Pages
[Table: route, which role sees it, what's on it]

## Assumptions
[Anything unclear in the problem statement — what you assumed and why]
```

## Rules

- Do NOT write any application code. Only the plan document.
- If the problem statement is vague about something, make a reasonable assumption and write it down.
- Keep the plan concise. It should fit in one focused read.
- Scope for 3-4 hours of development. Cut anything that's not essential.
- After writing the plan, show the user a brief summary and wait for them to say "go".
