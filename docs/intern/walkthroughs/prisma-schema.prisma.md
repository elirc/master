# Walkthrough: `prisma/schema.prisma`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- No imports in this file; behavior is mostly self-contained.

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L10: `enum GoalScope {`
- Why it matters: Declares constrained values to keep persisted state valid.
- L15: `enum GoalMatchType {`
- Why it matters: Declares constrained values to keep persisted state valid.
- L22: `enum DayTaskStatus {`
- Why it matters: Declares constrained values to keep persisted state valid.
- L27: `enum TimeEntrySource {`
- Why it matters: Declares constrained values to keep persisted state valid.
- L32: `enum WidgetDisplayMode {`
- Why it matters: Declares constrained values to keep persisted state valid.
- L37: `model User {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L57: `model Session {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L70: `model UserSettings {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L81: `model Area {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L94: `model Project {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L109: `model Task {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L129: `model Goal {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L148: `model DashboardWidget {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L164: `model DayPlan {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L177: `model DayTask {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L195: `model ScheduleBlock {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L213: `model TimeEntry {`
- Why it matters: Declares a Prisma model, which maps to a database table.
- L231: `model Template {`
- Why it matters: Declares a Prisma model, which maps to a database table.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
