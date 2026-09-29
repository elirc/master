"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, parseError } from "@/lib/api-client";
import { todayKey } from "@/lib/dates";
import { useToast } from "@/hooks/use-toast";

type Goal = {
  id: string;
  name: string;
  scope: "DAILY" | "WEEKLY";
  targetMin: number;
  matchType: "TAG" | "PROJECT" | "TASK" | "CUSTOM";
  matchTagNames: string[];
  matchProjectIds: string[];
  matchTaskIds: string[];
  showOnDashboard: boolean;
};

type Widget = {
  id: string;
  goalId: string;
  sortOrder: number;
  visible: boolean;
  displayMode: "ACTUAL" | "PLANNED";
  goal: Goal;
};

export default function GoalsPage() {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [targetMin, setTargetMin] = useState(60);
  const [matchType, setMatchType] = useState<"TAG" | "PROJECT" | "TASK" | "CUSTOM">("TAG");
  const [tagsText, setTagsText] = useState("");
  const [projectsText, setProjectsText] = useState("");
  const [tasksText, setTasksText] = useState("");
  const [showOnDashboard, setShowOnDashboard] = useState(true);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const goalsQuery = useQuery({
    queryKey: ["goals", todayKey()],
    queryFn: () => apiFetch<{ goals: Goal[]; dashboard: unknown[] }>(`/api/goals?date=${todayKey()}`),
  });

  const widgetsQuery = useQuery({
    queryKey: ["widgets"],
    queryFn: () => apiFetch<{ widgets: Widget[] }>("/api/widgets"),
  });

  const orderedWidgets = useMemo(
    () => [...(widgetsQuery.data?.widgets ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [widgetsQuery.data?.widgets],
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["goals"] });
    await queryClient.invalidateQueries({ queryKey: ["widgets"] });
  }

  function parseList(raw: string) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();

    try {
      await apiFetch("/api/goals", {
        method: "POST",
        body: JSON.stringify({
          name,
          scope,
          targetMin,
          matchType,
          matchTagNames: parseList(tagsText),
          matchProjectIds: parseList(projectsText),
          matchTaskIds: parseList(tasksText),
          showOnDashboard,
        }),
      });

      setName("");
      setTargetMin(60);
      setTagsText("");
      setProjectsText("");
      setTasksText("");
      await refresh();
      showToast("Goal created", "success");
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function deleteGoal(goalId: string) {
    if (!window.confirm("Delete this goal?")) return;

    try {
      await apiFetch(`/api/goals/${goalId}`, { method: "DELETE" });
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function toggleDashboard(goal: Goal) {
    try {
      await apiFetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ showOnDashboard: !goal.showOnDashboard }),
      });
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function updateWidget(widget: Widget, patch: Partial<Widget>) {
    try {
      await apiFetch(`/api/widgets/${widget.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function reorderWidgets(targetWidgetId: string) {
    if (!draggedWidgetId || draggedWidgetId === targetWidgetId) return;

    const reordered = [...orderedWidgets];
    const fromIdx = reordered.findIndex((widget) => widget.id === draggedWidgetId);
    const toIdx = reordered.findIndex((widget) => widget.id === targetWidgetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    try {
      await Promise.all(
        reordered.map((widget, index) =>
          apiFetch(`/api/widgets/${widget.id}`, {
            method: "PATCH",
            body: JSON.stringify({ sortOrder: index }),
          }),
        ),
      );
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    } finally {
      setDraggedWidgetId(null);
    }
  }

  if (goalsQuery.isLoading || widgetsQuery.isLoading) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Loading goals...</p>;
  }

  if (goalsQuery.isError || widgetsQuery.isError) {
    return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load goals.</p>;
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Goals</h1>
        <p className="text-sm text-slate-600">Create goals and customize dashboard widgets.</p>
      </header>

      <form onSubmit={createGoal} className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">New Goal</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goal name"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />

          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "DAILY" | "WEEKLY")}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>

          <input
            type="number"
            min={1}
            value={targetMin}
            onChange={(e) => setTargetMin(Number(e.target.value))}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />

          <select
            value={matchType}
            onChange={(e) => setMatchType(e.target.value as "TAG" | "PROJECT" | "TASK" | "CUSTOM")}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="TAG">By Tag</option>
            <option value="PROJECT">By Project</option>
            <option value="TASK">By Task</option>
            <option value="CUSTOM">Custom</option>
          </select>

          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="Tag list (comma separated)"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />

          <input
            value={projectsText}
            onChange={(e) => setProjectsText(e.target.value)}
            placeholder="Project IDs (comma separated)"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />

          <input
            value={tasksText}
            onChange={(e) => setTasksText(e.target.value)}
            placeholder="Task IDs (comma separated)"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />

          <label className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
            <input type="checkbox" checked={showOnDashboard} onChange={(e) => setShowOnDashboard(e.target.checked)} />
            Show on dashboard
          </label>
        </div>

        <button type="submit" className="mt-3 rounded border border-slate-300 px-3 py-2 text-sm">
          Create goal
        </button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Goals</h2>
        <div className="space-y-2">
          {(goalsQuery.data?.goals ?? []).map((goal) => (
            <div key={goal.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{goal.name}</p>
                <p className="text-xs text-slate-500">
                  {goal.scope} · {goal.targetMin} min · {goal.matchType}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleDashboard(goal)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                >
                  {goal.showOnDashboard ? "Hide" : "Show"} Widget
                </button>
                <button
                  type="button"
                  onClick={() => deleteGoal(goal.id)}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Dashboard Widgets</h2>
        <p className="mb-3 text-xs text-slate-500">Drag to reorder. Toggle visibility and display mode.</p>

        <div className="space-y-2">
          {orderedWidgets.map((widget) => (
            <div
              key={widget.id}
              draggable
              onDragStart={() => setDraggedWidgetId(widget.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => reorderWidgets(widget.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 px-3 py-2 text-sm"
            >
              <p className="font-medium">{widget.goal.name}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateWidget(widget, { visible: !widget.visible })}
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                >
                  {widget.visible ? "Hide" : "Show"}
                </button>

                <select
                  value={widget.displayMode}
                  onChange={(e) => updateWidget(widget, { displayMode: e.target.value as "ACTUAL" | "PLANNED" })}
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                >
                  <option value="ACTUAL">Actual</option>
                  <option value="PLANNED">Planned</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}



