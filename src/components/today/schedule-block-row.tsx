"use client";

import { minutesToLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ScheduleBlockItem } from "@/types/api";

export function ScheduleBlockRow({
  block,
  selected,
  onSelect,
}: {
  block: ScheduleBlockItem;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(block.id)}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm",
        selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800",
      )}
    >
      <span>
        {minutesToLabel(block.startMin)} - {minutesToLabel(block.endMin)}
      </span>
      <span className="max-w-[55%] truncate text-xs opacity-85">{block.label || "(No label)"}</span>
    </button>
  );
}



