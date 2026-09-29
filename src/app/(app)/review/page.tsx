"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { todayKey } from "@/lib/dates";

type DailyReview = {
  date: string;
  totalsByTag: { tag: string; min: number }[];
  totalsByProject: { project: string; min: number }[];
  topTasks: { title: string; min: number }[];
};

type WeeklyReview = {
  start: string;
  end: string;
  totalsByDay: { date: string; min: number }[];
  goalsMet: { goalId: string; name: string; targetMin: number; actualMin: number; met: boolean }[];
  tags: { tag: string; min: number }[];
  projects: { projectId: string; min: number }[];
};

export default function ReviewPage() {
  const [dailyDate, setDailyDate] = useState(todayKey());
  const [weeklyStart, setWeeklyStart] = useState(todayKey());

  const dailyQuery = useQuery({
    queryKey: ["review-daily", dailyDate],
    queryFn: () => apiFetch<DailyReview>(`/api/review/daily?date=${dailyDate}`),
  });

  const weeklyQuery = useQuery({
    queryKey: ["review-weekly", weeklyStart],
    queryFn: () => apiFetch<WeeklyReview>(`/api/review/weekly?start=${weeklyStart}`),
  });

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Review</h1>
        <p className="text-sm text-slate-600">Daily and weekly summaries from actual tracked time.</p>
      </header>

      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Daily Review</h2>
          <input
            type="date"
            value={dailyDate}
            onChange={(e) => setDailyDate(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {dailyQuery.isLoading && <p className="text-sm">Loading...</p>}
        {dailyQuery.isError && <p className="text-sm text-red-700">Failed to load daily review.</p>}

        {dailyQuery.data && (
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-semibold">By Tag</h3>
              <ul className="space-y-1 text-sm">
                {dailyQuery.data.totalsByTag.map((item) => (
                  <li key={item.tag} className="flex justify-between">
                    <span>{item.tag}</span>
                    <span>{item.min}m</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">By Project</h3>
              <ul className="space-y-1 text-sm">
                {dailyQuery.data.totalsByProject.map((item) => (
                  <li key={item.project} className="flex justify-between">
                    <span>{item.project}</span>
                    <span>{item.min}m</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Top Tasks</h3>
              <ul className="space-y-1 text-sm">
                {dailyQuery.data.topTasks.map((item) => (
                  <li key={item.title} className="flex justify-between">
                    <span>{item.title}</span>
                    <span>{item.min}m</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Weekly Review</h2>
          <input
            type="date"
            value={weeklyStart}
            onChange={(e) => setWeeklyStart(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {weeklyQuery.isLoading && <p className="text-sm">Loading...</p>}
        {weeklyQuery.isError && <p className="text-sm text-red-700">Failed to load weekly review.</p>}

        {weeklyQuery.data && (
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Totals by Day</h3>
              <ul className="space-y-1 text-sm">
                {weeklyQuery.data.totalsByDay.map((item) => (
                  <li key={item.date} className="flex justify-between">
                    <span>{item.date}</span>
                    <span>{item.min}m</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Goals Met</h3>
              <ul className="space-y-1 text-sm">
                {weeklyQuery.data.goalsMet.map((item) => (
                  <li key={item.goalId} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{item.met ? "Yes" : "No"}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Top Tags</h3>
              <ul className="space-y-1 text-sm">
                {weeklyQuery.data.tags.map((item) => (
                  <li key={item.tag} className="flex justify-between">
                    <span>{item.tag}</span>
                    <span>{item.min}m</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}



