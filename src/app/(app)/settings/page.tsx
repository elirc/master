"use client";

import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, parseError } from "@/lib/api-client";
import type { UserSettings } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<{ settings: UserSettings }>("/api/settings"),
  });

  const settings = settingsQuery.data?.settings;
  const defaults: UserSettings = settings ?? {
    dayStartMin: 6 * 60,
    dayEndMin: 23 * 60,
    timerRoundingMin: 0,
  };

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const dayStartMin = Number(formData.get("dayStartMin"));
    const dayEndMin = Number(formData.get("dayEndMin"));
    const timerRoundingMin = Number(formData.get("timerRoundingMin")) as 0 | 5 | 15;

    try {
      await apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ dayStartMin, dayEndMin, timerRoundingMin }),
      });
      showToast("Settings saved", "success");
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function exportData() {
    try {
      const data = await apiFetch<Record<string, unknown>>("/api/settings/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `master-life-plan-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function importData(file: File) {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await apiFetch("/api/settings/import", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("Import completed", "success");
      await queryClient.invalidateQueries();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  async function resetData() {
    if (!window.confirm("This will remove all your planning data. Continue?")) return;

    try {
      await apiFetch("/api/settings/reset", { method: "POST" });
      showToast("Data reset", "success");
      await queryClient.invalidateQueries();
    } catch (error) {
      showToast(parseError(error), "error");
    }
  }

  if (settingsQuery.isLoading) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Loading settings...</p>;
  }

  if (settingsQuery.isError) {
    return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load settings.</p>;
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-600">Schedule window, timer rounding, backup, and reset.</p>
      </header>

      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Day Window</h2>
        <form onSubmit={saveSettings} className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Start minute</span>
              <input
                type="number"
                name="dayStartMin"
                defaultValue={defaults.dayStartMin}
                className="w-full rounded border border-slate-300 px-3 py-2"
                min={0}
                max={1440}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">End minute</span>
              <input
                type="number"
                name="dayEndMin"
                defaultValue={defaults.dayEndMin}
                className="w-full rounded border border-slate-300 px-3 py-2"
                min={0}
                max={1440}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Timer rounding</span>
              <select
                name="timerRoundingMin"
                defaultValue={String(defaults.timerRoundingMin)}
                className="w-full rounded border border-slate-300 px-3 py-2"
              >
                <option value={0}>None</option>
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </label>
          </div>

          <button type="submit" className="rounded border border-slate-300 px-3 py-2 text-sm">
            Save settings
          </button>
        </form>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Backup</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportData} className="rounded border border-slate-300 px-3 py-2 text-sm">
            Export JSON
          </button>
          <label className="rounded border border-slate-300 px-3 py-2 text-sm">
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void importData(file);
                }
              }}
            />
          </label>
        </div>
      </article>

      <article className="rounded-xl border border-red-200 bg-red-50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-red-800">Danger Zone</h2>
        <button type="button" onClick={resetData} className="rounded border border-red-400 px-3 py-2 text-sm text-red-800">
          Reset all data
        </button>
      </article>
    </section>
  );
}



