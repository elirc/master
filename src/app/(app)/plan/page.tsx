"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, parseError } from "@/lib/api-client";
import { todayKey } from "@/lib/dates";
import { useToast } from "@/hooks/use-toast";

type AreaTree = {
  id: string;
  name: string;
  order: number;
  projects: {
    id: string;
    name: string;
    order: number;
    tasks: {
      id: string;
      title: string;
      tags: string[];
      defaultEstimateMin: number;
      archived: boolean;
    }[];
  }[];
};

export default function PlanPage() {
  const [newArea, setNewArea] = useState("");
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [taskTitles, setTaskTitles] = useState<Record<string, string>>({});
  const [taskTags, setTaskTags] = useState<Record<string, string>>({});
  const [taskEstimate, setTaskEstimate] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const areasQuery = useQuery({
    queryKey: ["areas-tree"],
    queryFn: () => apiFetch<{ areas: AreaTree[] }>("/api/areas?include=nested"),
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["areas-tree"] });
    await queryClient.invalidateQueries({ queryKey: ["task-catalog"] });
  }

  async function createArea() {
    if (!newArea.trim()) return;

    try {
      await apiFetch<{ area: AreaTree }>("/api/areas", {
        method: "POST",
        body: JSON.stringify({ name: newArea.trim() }),
      });
      setNewArea("");
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function createProject(areaId: string) {
    const name = projectNames[areaId]?.trim();
    if (!name) return;

    try {
      await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({ areaId, name }),
      });
      setProjectNames((prev) => ({ ...prev, [areaId]: "" }));
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function createTask(projectId: string) {
    const title = taskTitles[projectId]?.trim();
    if (!title) return;

    try {
      await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          title,
          tags: (taskTags[projectId] ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          defaultEstimateMin: taskEstimate[projectId] ?? 30,
        }),
      });

      setTaskTitles((prev) => ({ ...prev, [projectId]: "" }));
      setTaskTags((prev) => ({ ...prev, [projectId]: "" }));
      setTaskEstimate((prev) => ({ ...prev, [projectId]: 30 }));
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function addToToday(taskId: string, estimate = 30) {
    try {
      await apiFetch("/api/daytask", {
        method: "POST",
        body: JSON.stringify({
          date: todayKey(),
          taskId,
          plannedMin: estimate,
        }),
      });
      showToast("Added to today", "success");
      await queryClient.invalidateQueries({ queryKey: ["day", todayKey()] });
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function renameArea(area: AreaTree) {
    const next = window.prompt("Area name", area.name);
    if (!next || next === area.name) return;

    try {
      await apiFetch(`/api/areas/${area.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: next }),
      });
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function renameProject(projectId: string, name: string) {
    const next = window.prompt("Project name", name);
    if (!next || next === name) return;

    try {
      await apiFetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: next }),
      });
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function editTask(task: AreaTree["projects"][number]["tasks"][number], projectId: string) {
    const nextTitle = window.prompt("Task title", task.title);
    if (!nextTitle) return;
    const nextTags = window.prompt("Task tags (comma separated)", task.tags.join(", "));
    const nextEstimate = window.prompt("Default estimate (minutes)", String(task.defaultEstimateMin));

    try {
      await apiFetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          projectId,
          title: nextTitle,
          tags:
            nextTags === null
              ? task.tags
              : nextTags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
          defaultEstimateMin:
            nextEstimate === null ? task.defaultEstimateMin : Math.max(0, Number.parseInt(nextEstimate, 10) || 0),
        }),
      });
      await refresh();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  if (areasQuery.isLoading) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Loading plan...</p>;
  }

  if (areasQuery.isError) {
    return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load plan.</p>;
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Life Plan</h1>
        <p className="text-sm text-slate-600">{"Areas -> Projects -> Tasks"}</p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">New Area</h2>
        <div className="flex gap-2">
          <input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="Area name"
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="button" onClick={createArea} className="rounded border border-slate-300 px-3 py-2 text-sm">
            Add
          </button>
        </div>
      </div>

      {(areasQuery.data?.areas ?? []).map((area) => (
        <article key={area.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{area.name}</h2>
            <button type="button" onClick={() => renameArea(area)} className="rounded border border-slate-300 px-2 py-1 text-xs">
              Rename
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={projectNames[area.id] ?? ""}
              onChange={(e) => setProjectNames((prev) => ({ ...prev, [area.id]: e.target.value }))}
              placeholder="New project"
              className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => createProject(area.id)}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            >
              Add Project
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {area.projects.map((project) => (
              <div key={project.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-medium">{project.name}</h3>
                  <button
                    type="button"
                    onClick={() => renameProject(project.id, project.name)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Rename
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_0.7fr_auto]">
                  <input
                    value={taskTitles[project.id] ?? ""}
                    onChange={(e) => setTaskTitles((prev) => ({ ...prev, [project.id]: e.target.value }))}
                    placeholder="Task title"
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    value={taskTags[project.id] ?? ""}
                    onChange={(e) => setTaskTags((prev) => ({ ...prev, [project.id]: e.target.value }))}
                    placeholder="tags,comma,separated"
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    value={taskEstimate[project.id] ?? 30}
                    onChange={(e) => setTaskEstimate((prev) => ({ ...prev, [project.id]: Number(e.target.value) }))}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => createTask(project.id)}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                  >
                    Add Task
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {project.tasks.map((task) => (
                    <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.tags.join(", ") || "No tags"}</p>
                        <p className="text-xs text-slate-500">Default {task.defaultEstimateMin}m</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addToToday(task.id, task.defaultEstimateMin)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          Add to Today
                        </button>
                        <button
                          type="button"
                          onClick={() => editTask(task, project.id)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}



