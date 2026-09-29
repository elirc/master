# Walkthrough: `src/lib/auth.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import bcrypt from "bcrypt";`
- `import { cookies } from "next/headers";`
- `import crypto from "node:crypto";`
- `import { prisma } from "@/lib/prisma";`
- `import { SESSION_COOKIE } from "@/lib/constants";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L10: `export async function hashPassword(password: string) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L11: `return bcrypt.hash(password, 12);`
- Why it matters: Returns computed state/value to the caller.
- L14: `export async function verifyPassword(password: string, hash: string) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L15: `return bcrypt.compare(password, hash);`
- Why it matters: Returns computed state/value to the caller.
- L18: `export function buildSessionToken() {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L19: `return crypto.randomBytes(32).toString("hex");`
- Why it matters: Returns computed state/value to the caller.
- L22: `export function sessionExpiryDate() {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L26: `export async function createSession(userId: string) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L30: `await prisma.session.create({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L38: `const cookieStore = await cookies();`
- Why it matters: Contributes to control flow or state composition in this module.
- L50: `export async function clearSession() {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L51: `const cookieStore = await cookies();`
- Why it matters: Contributes to control flow or state composition in this module.
- L54: `if (token) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L55: `await prisma.session.deleteMany({ where: { token } });`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L58: `cookieStore.delete(SESSION_COOKIE);`
- Why it matters: Contributes to control flow or state composition in this module.
- L61: `export async function getSession() {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L62: `const cookieStore = await cookies();`
- Why it matters: Contributes to control flow or state composition in this module.
- L64: `if (!token) return null;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L66: `const session = await prisma.session.findUnique({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L71: `if (!session) return null;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L72: `if (session.expiresAt.getTime() <= Date.now()) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L73: `await prisma.session.delete({ where: { id: session.id } });`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L74: `cookieStore.delete(SESSION_COOKIE);`
- Why it matters: Contributes to control flow or state composition in this module.
- L81: `export async function requireUser() {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L82: `const session = await getSession();`
- Why it matters: Contributes to control flow or state composition in this module.
- L83: `if (session) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L87: `const existing = await prisma.user.findFirst({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L91: `if (existing) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L92: `await prisma.userSettings.upsert({`
- Why it matters: Touches persistent data through Prisma; this line changes or reads DB state.
- L108: `const passwordHash = await hashPassword(crypto.randomBytes(16).toString("hex"));`
- Why it matters: Contributes to control flow or state composition in this module.
- L110: `return prisma.user.create({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L125: `export async function requireUserOrRedirect() {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L129: `export async function requireUserId() {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L130: `const user = await requireUser();`
- Why it matters: Contributes to control flow or state composition in this module.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
