"use client";

import { cn } from "@/lib/utils";
import type { DayTaskItem } from "@/types/api";

export function TaskRow({
  item,
  running,
  onStart,
  onStop,
  onAdd30,
  onAdd60,
  onEdit,
  onToggleComplete,
}: {
  item: DayTaskItem;
  running: boolean;
  onStart: (taskId: string) => void;
  onStop: () => void;
  onAdd30: (item: DayTaskItem) => void;
  onAdd60: (item: DayTaskItem) => void;
  onEdit: (item: DayTaskItem) => void;
  onToggleComplete: (item: DayTaskItem) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-3 shadow-sm",
        item.status === "COMPLETED" ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={cn("text-sm font-medium", item.status === "COMPLETED" && "line-through text-slate-500")}>{item.task.title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {item.task.project.area.name} / {item.task.project.name}
          </p>
          <p className="mt-1 text-xs text-slate-500">P {item.plannedMin}m · A {item.actualMin}m</p>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={item.status === "COMPLETED"}
            onChange={() => onToggleComplete(item)}
            className="h-4 w-4"
          />
          Done
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!running ? (
          <button
            type="button"
            onClick={() => onStart(item.taskId)}
            className="rounded border border-emerald-500 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
          >
            Start
          </button>
        ) : (
          <button
            type="button"
            onClick={onStop}
            className="rounded border border-red-500 bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
          >
            Stop
          </button>
        )}

        <button
          type="button"
          onClick={() => onAdd30(item)}
          className="rounded border border-slate-300 px-2 py-1 text-xs"
        >
          +30m
        </button>

        <button
          type="button"
          onClick={() => onAdd60(item)}
          className="rounded border border-slate-300 px-2 py-1 text-xs"
        >
          +1h
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded border border-slate-300 px-2 py-1 text-xs"
        >
          Edit
        </button>
      </div>
    </div>
  );
}



