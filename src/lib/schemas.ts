import { z } from "zod";

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const signupSchema = z.object({
  username: z.string().trim().min(3).max(40),
  password: z.string().min(8).max(128),
});

export const loginSchema = signupSchema;

export const areaSchema = z.object({
  name: z.string().trim().min(1).max(120),
  order: z.number().int().min(0).optional(),
});

export const projectSchema = z.object({
  areaId: z.string(),
  name: z.string().trim().min(1).max(120),
  order: z.number().int().min(0).optional(),
});

export const taskSchema = z.object({
  projectId: z.string(),
  title: z.string().trim().min(1).max(300),
  notes: z.string().max(3000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).optional(),
  defaultEstimateMin: z.number().int().min(0).max(24 * 60).optional(),
  archived: z.boolean().optional(),
});

export const goalSchema = z.object({
  name: z.string().trim().min(1).max(120),
  scope: z.enum(["DAILY", "WEEKLY"]),
  targetMin: z.number().int().min(1).max(7 * 24 * 60),
  matchType: z.enum(["TAG", "PROJECT", "TASK", "CUSTOM"]),
  matchTagNames: z.array(z.string()).optional(),
  matchProjectIds: z.array(z.string()).optional(),
  matchTaskIds: z.array(z.string()).optional(),
  showOnDashboard: z.boolean().optional(),
});

export const widgetSchema = z.object({
  goalId: z.string(),
  sortOrder: z.number().int().min(0),
  visible: z.boolean().optional(),
  displayMode: z.enum(["ACTUAL", "PLANNED"]).optional(),
});

export const dayTaskCreateSchema = z.object({
  date: dateSchema,
  taskId: z.string(),
  plannedMin: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
});

export const dayTaskPatchSchema = z.object({
  plannedMin: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
});

export const scheduleBlockCreateSchema = z.object({
  date: dateSchema,
  startMin: z.number().int().min(0).max(1440),
  endMin: z.number().int().min(0).max(1440),
  taskId: z.string().optional().nullable(),
  label: z.string().trim().max(200).optional().nullable(),
  locked: z.boolean().optional(),
});

export const scheduleBlockPatchSchema = z.object({
  startMin: z.number().int().min(0).max(1440).optional(),
  endMin: z.number().int().min(0).max(1440).optional(),
  taskId: z.string().optional().nullable(),
  label: z.string().trim().max(200).optional().nullable(),
  locked: z.boolean().optional(),
  extendByMin: z.number().int().positive().optional(),
});

export const timeEntryCreateSchema = z.object({
  action: z.enum(["start", "stop", "manual"]),
  date: dateSchema.optional(),
  taskId: z.string().optional().nullable(),
  startTs: z.string().datetime().optional(),
  endTs: z.string().datetime().optional(),
  note: z.string().max(600).optional().nullable(),
  entryId: z.string().optional(),
});

export const timeEntryPatchSchema = z.object({
  date: dateSchema.optional(),
  taskId: z.string().optional().nullable(),
  startTs: z.string().datetime().optional(),
  endTs: z.string().datetime().optional().nullable(),
  source: z.enum(["TIMER", "MANUAL"]).optional(),
  note: z.string().max(600).optional().nullable(),
});

export const settingsSchema = z.object({
  dayStartMin: z.number().int().min(0).max(1440),
  dayEndMin: z.number().int().min(0).max(1440),
  timerRoundingMin: z.union([z.literal(0), z.literal(5), z.literal(15)]),
});

export const templateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  weekdayMask: z.array(z.number().int().min(0).max(6)).optional(),
  dayTaskTemplate: z.array(
    z.object({ taskId: z.string(), plannedMin: z.number().int().min(0), sortOrder: z.number().int().min(0).optional() }),
  ),
  scheduleTemplate: z.array(
    z.object({
      startMin: z.number().int().min(0).max(1440),
      endMin: z.number().int().min(0).max(1440),
      taskId: z.string().optional().nullable(),
      label: z.string().max(200).optional().nullable(),
      locked: z.boolean().optional(),
    }),
  ),
});

export const syncMutationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const syncSchema = z.object({
  mutations: z.array(syncMutationSchema),
});



