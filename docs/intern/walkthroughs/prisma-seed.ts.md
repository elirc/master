# Walkthrough: `prisma/seed.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import bcrypt from "bcrypt";`
- `import { PrismaClient } from "@prisma/client";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L7: `let user = await prisma.user.findFirst();`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L9: `if (!user) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L10: `user = await prisma.user.create({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L13: `passwordHash: await bcrypt.hash("sample1234", 12),`
- Why it matters: Contributes to control flow or state composition in this module.
- L17: `await prisma.userSettings.create({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L27: `const area = await prisma.area.upsert({`
- Why it matters: Touches persistent data through Prisma; this line changes or reads DB state.
- L28: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L43: `const project = await prisma.project.upsert({`
- Why it matters: Touches persistent data through Prisma; this line changes or reads DB state.
- L44: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L61: `const task = await prisma.task.upsert({`
- Why it matters: Touches persistent data through Prisma; this line changes or reads DB state.
- L62: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L82: `const goal = await prisma.goal.upsert({`
- Why it matters: Touches persistent data through Prisma; this line changes or reads DB state.
- L83: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L107: `await prisma.dashboardWidget.upsert({`
- Why it matters: Touches persistent data through Prisma; this line changes or reads DB state.
- L108: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L137: `await prisma.$disconnect();`
- Why it matters: Touches persistent data through Prisma; this line changes or reads DB state.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
