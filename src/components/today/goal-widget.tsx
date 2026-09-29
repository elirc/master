"use client";

import type { GoalWidgetData } from "@/types/api";

export function GoalWidget({ item }: { item: GoalWidgetData }) {
  const numerator = item.displayMode === "PLANNED" ? item.plannedMin : item.actualMin;
  const progress = Math.min(100, Math.round((numerator / Math.max(1, item.targetMin)) * 100));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">{item.name}</h3>
        <span className="text-xs text-slate-500">{item.scope === "DAILY" ? "Daily" : "Weekly"}</span>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        {item.displayMode === "PLANNED" ? "Planned" : "Actual"}: {numerator} / {item.targetMin} min
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}



