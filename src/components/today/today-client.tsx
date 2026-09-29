"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { apiFetch, parseError } from "@/lib/api-client";
import { buildTimeOptions, todayKey } from "@/lib/dates";
import type { DayData, DayTaskItem, GoalWidgetData, ScheduleBlockItem, TimeEntryItem } from "@/types/api";
import { GoalWidget } from "@/components/today/goal-widget";
import { TaskRow } from "@/components/today/task-row";
import { ScheduleBlockRow } from "@/components/today/schedule-block-row";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { useOfflineMutation } from "@/hooks/use-offline-mutation";

type Me = { id: string; username: string };
type TaskCatalog = {
  tasks: {
    id: string;
    title: string;
    defaultEstimateMin: number;
  }[];
};

export function TodayClient() {
  const [date, setDate] = useState(todayKey());
  const [showCompleted, setShowCompleted] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntryItem | null>(null);
  const [manualTaskId, setManualTaskId] = useState<string>("");
  const [manualStart, setManualStart] = useState("09:00");
  const [manualEnd, setManualEnd] = useState("09:30");
  const [manualNote, setManualNote] = useState("");
  const [newTaskId, setNewTaskId] = useState("");
  const [newBlockStart, setNewBlockStart] = useState(9 * 60);
  const [newBlockEnd, setNewBlockEnd] = useState(10 * 60);
  const [newBlockLabel, setNewBlockLabel] = useState("");
  const [newBlockTaskId, setNewBlockTaskId] = useState<string>("");

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<Me>("/api/me"),
  });

  const offlineMutation = useOfflineMutation(meQuery.data?.id ?? "");

  const dayQuery = useQuery({
    queryKey: ["day", date],
    queryFn: () => apiFetch<DayData>(`/api/day?date=${date}`),
  });

  const goalsQuery = useQuery({
    queryKey: ["goals", date],
    queryFn: async () => apiFetch<{ dashboard: GoalWidgetData[] }>(`/api/goals?date=${date}`),
  });

  const tasksQuery = useQuery({
    queryKey: ["task-catalog"],
    queryFn: () => apiFetch<TaskCatalog>("/api/tasks"),
  });

  const displayedTasks = useMemo(() => {
    const rows = dayQuery.data?.dayTasks ?? [];
    return showCompleted ? rows : rows.filter((row) => row.status !== "COMPLETED");
  }, [dayQuery.data?.dayTasks, showCompleted]);

  useEffect(() => {
    const running = dayQuery.data?.runningEntry;
    if (running) {
      localStorage.setItem("runningTimer", JSON.stringify(running));
    } else {
      localStorage.removeItem("runningTimer");
    }
  }, [dayQuery.data?.runningEntry]);

  function optimisticDay(update: (current: DayData) => DayData) {
    queryClient.setQueryData<DayData>(["day", date], (current) => (current ? update(current) : current));
  }

  async function addTaskToToday() {
    if (!newTaskId) return;

    const existing = dayQuery.data?.dayTasks.find((row) => row.taskId === newTaskId);
    if (existing) {
      showToast("Task already added for today", "info");
      return;
    }

    const task = tasksQuery.data?.tasks.find((item) => item.id === newTaskId);

    try {
      await offlineMutation.mutateWithQueue<{ dayTask: DayTaskItem }>({
        endpoint: "/api/daytask",
        method: "POST",
        mutationType: "daytask.create",
        payload: {
          date,
          taskId: newTaskId,
          plannedMin: task?.defaultEstimateMin ?? 30,
        },
      });

      setNewTaskId("");
      await queryClient.invalidateQueries({ queryKey: ["day", date] });
      showToast("Task added", "success");
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function toggleComplete(item: DayTaskItem) {
    const next = item.status === "COMPLETED" ? "ACTIVE" : "COMPLETED";

    try {
      await offlineMutation.mutateWithQueue<{ dayTask: DayTaskItem }>({
        endpoint: `/api/daytask/${item.id}`,
        method: "PATCH",
        mutationType: "daytask.update",
        payload: { id: item.id, status: next },
        applyOptimistic: () => {
          optimisticDay((current) => ({
            ...current,
            dayTasks: current.dayTasks.map((row) => (row.id === item.id ? { ...row, status: next } : row)),
          }));
        },
      });
    } catch (error) {
      showToast(parseError(error), "error");
      await queryClient.invalidateQueries({ queryKey: ["day", date] });
    }
  }

  async function startTimer(taskId: string) {
    try {
      const data = await apiFetch<{ entry: TimeEntryItem }>("/api/time-entries", {
        method: "POST",
        body: JSON.stringify({ action: "start", taskId }),
      });

      localStorage.setItem("runningTimer", JSON.stringify(data.entry));
      await queryClient.invalidateQueries({ queryKey: ["day", date] });
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function stopTimer() {
    try {
      await apiFetch<{ entry: TimeEntryItem }>("/api/time-entries", {
        method: "POST",
        body: JSON.stringify({ action: "stop" }),
      });

      localStorage.removeItem("runningTimer");
      await queryClient.invalidateQueries({ queryKey: ["day", date] });
      await queryClient.invalidateQueries({ queryKey: ["goals", date] });
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function incrementPlanned(item: DayTaskItem, delta: number) {
    try {
      await offlineMutation.mutateWithQueue<{ dayTask: DayTaskItem }>({
        endpoint: `/api/daytask/${item.id}`,
        method: "PATCH",
        mutationType: "daytask.update",
        payload: {
          id: item.id,
          plannedMin: item.plannedMin + delta,
        },
        applyOptimistic: () => {
          optimisticDay((current) => ({
            ...current,
            dayTasks: current.dayTasks.map((row) =>
              row.id === item.id ? { ...row, plannedMin: row.plannedMin + delta } : row,
            ),
          }));
        },
      });

      const selectedBlock = dayQuery.data?.scheduleBlocks.find((block) => block.id === selectedBlockId);
      if (selectedBlock) {
        if (selectedBlock.taskId && selectedBlock.taskId !== item.taskId) {
          const approved = window.confirm("Selected block is linked to another task. Link and extend this block?");
          if (!approved) {
            return;
          }
        }

        try {
          await offlineMutation.mutateWithQueue<{ block: ScheduleBlockItem }>({
            endpoint: `/api/schedule-blocks/${selectedBlock.id}`,
            method: "PATCH",
            mutationType: "schedule.update",
            payload: {
              id: selectedBlock.id,
              taskId: item.taskId,
              extendByMin: delta,
            },
          });
        } catch {
          showToast("Could not extend selected schedule block (overlap).", "error");
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["goals", date] });
    } catch (error) {
      showToast(parseError(error), "error");
      await queryClient.invalidateQueries({ queryKey: ["day", date] });
    }
  }

  function openManualModal(item: DayTaskItem) {
    setEditingEntry(null);
    setManualTaskId(item.taskId);
    setManualStart("09:00");
    setManualEnd("09:30");
    setManualNote("");
    setManualModalOpen(true);
  }

  function editEntry(entry: TimeEntryItem) {
    setEditingEntry(entry);
    setManualTaskId(entry.taskId ?? "");
    setManualStart(entry.startTs.substring(11, 16));
    setManualEnd((entry.endTs ?? entry.startTs).substring(11, 16));
    setManualNote(entry.note ?? "");
    setManualModalOpen(true);
  }

  async function submitManualEntry(e: React.FormEvent) {
    e.preventDefault();

    const startTs = `${date}T${manualStart}:00.000Z`;
    const endTs = `${date}T${manualEnd}:00.000Z`;

    if (parseISO(endTs).getTime() <= parseISO(startTs).getTime()) {
      showToast("End must be later than start", "error");
      return;
    }

    try {
      if (editingEntry) {
        await offlineMutation.mutateWithQueue<{ entry: TimeEntryItem }>({
          endpoint: `/api/time-entries/${editingEntry.id}`,
          method: "PATCH",
          mutationType: "time.update",
          payload: {
            id: editingEntry.id,
            taskId: manualTaskId || null,
            startTs,
            endTs,
            note: manualNote || null,
            date,
          },
        });
      } else {
        await offlineMutation.mutateWithQueue<{ entry: TimeEntryItem }>({
          endpoint: "/api/time-entries",
          method: "POST",
          mutationType: "time.create",
          payload: {
            action: "manual",
            taskId: manualTaskId || null,
            startTs,
            endTs,
            note: manualNote || null,
            date,
            source: "MANUAL",
          },
        });
      }

      setManualModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["day", date] });
      await queryClient.invalidateQueries({ queryKey: ["goals", date] });
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function createBlock() {
    if (newBlockEnd <= newBlockStart) {
      showToast("Schedule block end must be after start", "error");
      return;
    }

    try {
      await offlineMutation.mutateWithQueue<{ block: ScheduleBlockItem }>({
        endpoint: "/api/schedule-blocks",
        method: "POST",
        mutationType: "schedule.create",
        payload: {
          date,
          startMin: newBlockStart,
          endMin: newBlockEnd,
          taskId: newBlockTaskId || null,
          label: newBlockLabel || null,
          locked: true,
        },
      });

      setNewBlockLabel("");
      await queryClient.invalidateQueries({ queryKey: ["day", date] });
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  const options = buildTimeOptions(30);

  if (dayQuery.isLoading || goalsQuery.isLoading || meQuery.isLoading) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Loading...</p>;
  }

  if (dayQuery.isError || goalsQuery.isError || meQuery.isError) {
    return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load today view.</p>;
  }

  const runningTaskId = dayQuery.data?.runningEntry?.taskId;
  const runningTaskTitle =
    (tasksQuery.data?.tasks ?? []).find((task) => task.id === runningTaskId)?.title ?? "Unlinked task";

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Checklist Today</h1>
          <p className="text-sm text-slate-600">Primary checklist with locked schedule blocks.</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </header>

      {dayQuery.data?.runningEntry && (
        <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-emerald-900">
              Timer running: <span className="font-semibold">{runningTaskTitle}</span>
            </p>
            <button
              type="button"
              onClick={stopTimer}
              className="rounded border border-emerald-700 px-3 py-1 text-xs font-medium text-emerald-900"
            >
              Stop timer
            </button>
          </div>
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-3">
        {(goalsQuery.data?.dashboard ?? []).filter((item) => item.visible).map((item) => (
          <GoalWidget key={item.goalId} item={item} />
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Checklist</h2>
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
            Show completed
          </label>
        </div>

        <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 p-2">
          <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs text-slate-600">
            Add task to today
            <select
              value={newTaskId}
              onChange={(e) => setNewTaskId(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">Select task</option>
              {(tasksQuery.data?.tasks ?? []).map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={addTaskToToday} className="rounded border border-slate-300 px-3 py-2 text-sm">
            Add
          </button>
        </div>

        <div className="space-y-2">
          {displayedTasks.map((item) => (
            <TaskRow
              key={item.id}
              item={item}
              running={runningTaskId === item.taskId}
              onStart={startTimer}
              onStop={stopTimer}
              onAdd30={(row) => incrementPlanned(row, 30)}
              onAdd60={(row) => incrementPlanned(row, 60)}
              onEdit={openManualModal}
              onToggleComplete={toggleComplete}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={() => setScheduleOpen((open) => !open)}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-medium"
        >
          {scheduleOpen ? "Hide" : "Show"} Schedule
        </button>

        {scheduleOpen && (
          <div className="space-y-3">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <select
                value={newBlockStart}
                onChange={(e) => setNewBlockStart(Number(e.target.value))}
                className="rounded border border-slate-300 px-2 py-2 text-sm"
              >
                {options.map((option) => (
                  <option key={`start-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={newBlockEnd}
                onChange={(e) => setNewBlockEnd(Number(e.target.value))}
                className="rounded border border-slate-300 px-2 py-2 text-sm"
              >
                {options.map((option) => (
                  <option key={`end-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={newBlockTaskId}
                onChange={(e) => setNewBlockTaskId(e.target.value)}
                className="rounded border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="">No task link</option>
                {(tasksQuery.data?.tasks ?? []).map((task) => (
                  <option key={`block-${task.id}`} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>

              <input
                value={newBlockLabel}
                onChange={(e) => setNewBlockLabel(e.target.value)}
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="Label"
              />

              <button type="button" onClick={createBlock} className="rounded border border-slate-300 px-3 py-2 text-sm">
                Add block
              </button>
            </div>

            <div className="space-y-2">
              {(dayQuery.data?.scheduleBlocks ?? []).map((block) => (
                <ScheduleBlockRow
                  key={block.id}
                  block={block}
                  selected={selectedBlockId === block.id}
                  onSelect={setSelectedBlockId}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Time Entries</h2>
        <div className="space-y-2">
          {(dayQuery.data?.timeEntries ?? []).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm">
              <div>
                <p>
                  {entry.startTs.substring(11, 16)} - {(entry.endTs ?? "running").substring(11, 16)}
                </p>
                <p className="text-xs text-slate-500">{entry.note || "No note"}</p>
              </div>
              <button
                type="button"
                onClick={() => editEntry(entry)}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </section>

      <Modal open={manualModalOpen} title={editingEntry ? "Edit Time Entry" : "Add Manual Time"} onClose={() => setManualModalOpen(false)}>
        <form onSubmit={submitManualEntry} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Task</span>
            <select
              value={manualTaskId}
              onChange={(e) => setManualTaskId(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-2"
            >
              <option value="">No task</option>
              {(tasksQuery.data?.tasks ?? []).map((task) => (
                <option key={`manual-${task.id}`} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Start</span>
              <input
                type="time"
                value={manualStart}
                onChange={(e) => setManualStart(e.target.value)}
                step={1800}
                className="w-full rounded border border-slate-300 px-2 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">End</span>
              <input
                type="time"
                value={manualEnd}
                onChange={(e) => setManualEnd(e.target.value)}
                step={1800}
                className="w-full rounded border border-slate-300 px-2 py-2"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Note</span>
            <textarea
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-2"
              rows={3}
            />
          </label>

          <button type="submit" className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">
            Save entry
          </button>
        </form>
      </Modal>
    </section>
  );
}



