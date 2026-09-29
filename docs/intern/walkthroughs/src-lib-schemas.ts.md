# Walkthrough: `src/lib/schemas.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { z } from "zod";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L3: `export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);`
- Why it matters: Defines validation constraints for incoming API data.
- L5: `export const signupSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L10: `export const loginSchema = signupSchema;`
- Why it matters: Declares exported configuration/state used by other modules.
- L12: `export const areaSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L17: `export const projectSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L23: `export const taskSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L32: `export const goalSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L43: `export const widgetSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L50: `export const dayTaskCreateSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L58: `export const dayTaskPatchSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L64: `export const scheduleBlockCreateSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L73: `export const scheduleBlockPatchSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L82: `export const timeEntryCreateSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L92: `export const timeEntryPatchSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L101: `export const settingsSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L107: `export const templateSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L124: `export const syncMutationSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.
- L132: `export const syncSchema = z.object({`
- Why it matters: Defines validation constraints for incoming API data.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
