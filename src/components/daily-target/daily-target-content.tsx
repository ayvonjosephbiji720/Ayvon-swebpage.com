"use client";

import * as React from "react";
import { Target, Flame, Trophy, PartyPopper, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDailyTarget } from "@/hooks/useDailyTarget";
import { formatDate } from "@/lib/utils";

function groupBy<T>(items: T[], keyFn: (item: T) => string) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return map;
}

export function DailyTargetContent() {
  const {
    loading,
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
  } = useDailyTarget();

  const weekly = React.useMemo(() => {
    // ISO-ish week key: year + week number derived from the date string.
    const withWeekKey = history.map((h) => {
      const d = new Date(h.date + "T00:00:00");
      const firstJan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - firstJan.getTime()) / 86400000 + firstJan.getDay() + 1) / 7);
      return { ...h, weekKey: `${d.getFullYear()}-W${week}` };
    });
    const grouped = groupBy(withWeekKey, (h) => h.weekKey);
    return Array.from(grouped.entries())
      .map(([key, days]) => ({
        key,
        applied: days.reduce((s, d) => s + d.applied, 0),
        goal: days.reduce((s, d) => s + d.goal, 0),
        daysCompleted: days.filter((d) => d.completed).length,
        totalDays: days.length,
      }))
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .slice(0, 8);
  }, [history]);

  const monthly = React.useMemo(() => {
    const grouped = groupBy(history, (h) => h.date.slice(0, 7));
    return Array.from(grouped.entries())
      .map(([key, days]) => ({
        key,
        applied: days.reduce((s, d) => s + d.applied, 0),
        goal: days.reduce((s, d) => s + d.goal, 0),
        daysCompleted: days.filter((d) => d.completed).length,
        totalDays: days.length,
      }))
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .slice(0, 6);
  }, [history]);

  const totalJobsApplied = history.reduce((s, d) => s + d.applied, 0);
  const totalTargetDays = history.length;
  const overallCompletionPct = totalTargetDays
    ? Math.round((history.filter((d) => d.completed).length / totalTargetDays) * 100)
    : 0;

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading today&apos;s target…</p>;
  }

  return (
    <div className="space-y-6">
      {createError && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm">Couldn&apos;t create today&apos;s target: {createError}</p>
            </div>
            <Button size="sm" variant="outline" onClick={retryCreateTodayTarget}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {isComplete && (
        <Card className="border-success/40 bg-success/10">
          <CardContent className="flex items-center gap-3 p-4">
            <PartyPopper className="h-5 w-5 text-success" />
            <p className="text-sm font-medium">🎉 Congratulations! You completed today&apos;s target.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">
              {totalAppliedToday}/{totalGoalToday}
            </p>
            <p className="text-xs text-muted-foreground">Today&apos;s progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{remaining}</p>
            <p className="text-xs text-muted-foreground">Remaining applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{percentComplete}%</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Today&apos;s Target
          </CardTitle>
          <CardDescription>15 applications a day, spread across 3 rotating IT categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall</span>
              <span>{percentComplete}%</span>
            </div>
            <Progress value={percentComplete} />
          </div>
          {todaysCategoryProgress.map((c) => (
            <div key={c.category}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{c.category}</span>
                <span className="text-muted-foreground">
                  {c.applied}/{c.goal}
                </span>
              </div>
              <Progress value={Math.min(100, Math.round((c.applied / c.goal) * 100))} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Set a job&apos;s &ldquo;IT job category&rdquo; when you add it in the Job Tracker so it counts toward
            the matching category here.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{totalJobsApplied}</p>
            <p className="text-xs text-muted-foreground">Total jobs applied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{overallCompletionPct}%</p>
            <p className="text-xs text-muted-foreground">Target completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current streak (days)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">Longest streak (days)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {bestCategory && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">Best-performing category</p>
            <Badge>
              {bestCategory.category} · {bestCategory.count} applied
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Target History</CardTitle>
          <CardDescription>Daily, weekly, and monthly completion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Daily</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {history.slice(0, 14).map((d) => (
                <div key={d.date} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{formatDate(d.date)}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {d.applied}/{d.goal}
                    </span>
                    <Badge variant={d.completed ? "success" : "outline"}>{d.completed ? "Completed" : "In progress"}</Badge>
                  </span>
                </div>
              ))}
              {history.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Weekly</p>
            <div className="space-y-1.5">
              {weekly.map((w) => (
                <div key={w.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{w.key}</span>
                  <span className="text-muted-foreground">
                    {w.applied}/{w.goal} · {w.daysCompleted}/{w.totalDays} days completed
                  </span>
                </div>
              ))}
              {weekly.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Monthly</p>
            <div className="space-y-1.5">
              {monthly.map((m) => (
                <div key={m.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{m.key}</span>
                  <span className="text-muted-foreground">
                    {m.applied}/{m.goal} · {m.daysCompleted}/{m.totalDays} days completed
                  </span>
                </div>
              ))}
              {monthly.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
