export type DayTaskItem = {
  id: string;
  date: string;
  taskId: string;
  plannedMin: number;
  sortOrder: number;
  status: "ACTIVE" | "COMPLETED";
  actualMin: number;
  task: {
    id: string;
    title: string;
    notes: string | null;
    tags: string[];
    project: {
      id: string;
      name: string;
      area: {
        id: string;
        name: string;
      };
    };
  };
};

export type ScheduleBlockItem = {
  id: string;
  date: string;
  startMin: number;
  endMin: number;
  taskId: string | null;
  label: string | null;
  locked: boolean;
};

export type TimeEntryItem = {
  id: string;
  date: string;
  taskId: string | null;
  source: "TIMER" | "MANUAL";
  startTs: string;
  endTs: string | null;
  note: string | null;
};

export type DayData = {
  date: string;
  dayPlan: {
    id: string;
    date: string;
    notes: string | null;
  } | null;
  dayTasks: DayTaskItem[];
  scheduleBlocks: ScheduleBlockItem[];
  timeEntries: TimeEntryItem[];
  runningEntry: TimeEntryItem | null;
  totals: {
    plannedMin: number;
    actualMin: number;
  };
};

export type GoalWidgetData = {
  goalId: string;
  widgetId: string | null;
  name: string;
  targetMin: number;
  scope: "DAILY" | "WEEKLY";
  actualMin: number;
  plannedMin: number;
  visible: boolean;
  sortOrder: number;
  displayMode: "ACTUAL" | "PLANNED";
};

export type UserSettings = {
  dayStartMin: number;
  dayEndMin: number;
  timerRoundingMin: 0 | 5 | 15;
};



