"use client";

import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useJobs } from "@/hooks/useJobs";
import type { DailyTarget } from "@/lib/supabase/types";
import { pickDailyCategories, dateStrDaysAgo, todayStr, TOTAL_DAILY_GOAL, toLocalDateStr } from "@/lib/daily-target";

export interface CategoryProgress {
  category: string;
  goal: number;
  applied: number;
}

export function useDailyTarget() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const { jobs, loading: jobsLoading } = useJobs();
  const [targets, setTargets] = React.useState<DailyTarget[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createError, setCreateError] = React.useState<string | null>(null);
  // Tracks which target_date we've already attempted to auto-create this
  // session, so a failed insert (bad RLS, network blip, etc.) surfaces an
  // error once instead of retrying in a tight loop on every re-render.
  const attemptedDateRef = React.useRef<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!supabase || !user) {
      setTargets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_targets")
      .select("*")
      .order("target_date", { ascending: false });
    if (!error) setTargets(data ?? []);
    setLoading(false);
  }, [supabase, user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const today = todayStr();
  const todayTarget = targets.find((t) => t.target_date === today) ?? null;

  const createTodayTarget = React.useCallback(async () => {
    if (!supabase || !user) return;
    setCreateError(null);
    const yesterday = dateStrDaysAgo(today, 1);
    const yesterdayRow = targets.find((t) => t.target_date === yesterday);
    const previousCategories = yesterdayRow ? yesterdayRow.categories.map((c) => c.category) : [];
    const categories = pickDailyCategories(today, previousCategories);
    const { error } = await supabase.from("daily_targets").insert({
      user_id: user.id,
      target_date: today,
      categories,
      total_goal: TOTAL_DAILY_GOAL,
    });
    // 23505 = unique_violation: another tab/request already created today's
    // row between our check and this insert — not a real failure.
    if (error && error.code !== "23505") {
      setCreateError(error.message);
    }
    await refresh();
  }, [supabase, user, today, targets, refresh]);

  // Auto-create today's target the first time this loads, avoiding
  // yesterday's categories. Only ever attempted once per date per session —
  // see attemptedDateRef comment above.
  React.useEffect(() => {
    if (!supabase || !user || loading || todayTarget) return;
    if (attemptedDateRef.current === today) return;
    attemptedDateRef.current = today;
    createTodayTarget();
  }, [supabase, user, loading, todayTarget, today, createTodayTarget]);

  const retryCreateTodayTarget = React.useCallback(() => {
    attemptedDateRef.current = null;
    setCreateError(null);
  }, []);

  // Jobs applied today, grouped by category (jobs without a category don't count toward any target category).
  const todaysCategoryProgress: CategoryProgress[] = React.useMemo(() => {
    if (!todayTarget) return [];
    const appliedToday = jobs.filter((j) => toLocalDateStr(new Date(j.date_applied)) === today);
    return todayTarget.categories.map((c) => ({
      category: c.category,
      goal: c.goal,
      applied: appliedToday.filter((j) => j.job_category === c.category).length,
    }));
  }, [todayTarget, jobs, today]);

  const totalAppliedToday = React.useMemo(
    () => jobs.filter((j) => toLocalDateStr(new Date(j.date_applied)) === today).length,
    [jobs, today]
  );

  const totalGoalToday = todayTarget?.total_goal ?? TOTAL_DAILY_GOAL;
  const percentComplete = totalGoalToday > 0 ? Math.min(100, Math.round((totalAppliedToday / totalGoalToday) * 100)) : 0;
  const remaining = Math.max(0, totalGoalToday - totalAppliedToday);
  const isComplete = totalAppliedToday >= totalGoalToday;

  // History stats: for each past daily_target row, did that day's applications meet the goal?
  const history = React.useMemo(() => {
    return targets.map((t) => {
      const appliedThatDay = jobs.filter((j) => toLocalDateStr(new Date(j.date_applied)) === t.target_date).length;
      return {
        date: t.target_date,
        goal: t.total_goal,
        applied: appliedThatDay,
        completed: appliedThatDay >= t.total_goal,
        categories: t.categories,
      };
    });
  }, [targets, jobs]);

  const { currentStreak, longestStreak } = React.useMemo(() => {
    const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
    let current = 0;
    for (let i = 0; i < sorted.length; i++) {
      const expected = dateStrDaysAgo(today, i);
      if (sorted[i]?.date === expected && sorted[i].completed) {
        current++;
      } else {
        break;
      }
    }
    let longest = 0;
    let run = 0;
    const chronological = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));
    for (const day of chronological) {
      if (day.completed) {
        run++;
        longest = Math.max(longest, run);
      } else {
        run = 0;
      }
    }
    return { currentStreak: current, longestStreak: longest };
  }, [history, today]);

  const bestCategory = React.useMemo(() => {
    const counts = new Map<string, number>();
    jobs.forEach((j) => {
      if (j.job_category) counts.set(j.job_category, (counts.get(j.job_category) ?? 0) + 1);
    });
    const entries = Array.from(counts.entries()).map(([category, count]) => ({ category, count }));
    if (entries.length === 0) return null;
    return entries.reduce((best, entry) => (entry.count > best.count ? entry : best), entries[0]);
  }, [jobs]);

  return {
    loading: loading || jobsLoading,
    todayTarget,
    todaysCategoryProgress,
    totalAppliedToday,
    totalGoalToday,
    percentComplete,
    remaining,
    isComplete,
    history,
    currentStreak,
    longestStreak,
    bestCategory,
    createError,
    retryCreateTodayTarget,
    refresh,
  };
}
