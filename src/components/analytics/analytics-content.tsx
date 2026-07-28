"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useJobs } from "@/hooks/useJobs";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useTasks } from "@/hooks/useTasks";
import { usePrayer } from "@/hooks/usePrayer";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const RATE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function AnalyticsContent() {
  const { jobs } = useJobs();
  const { sessions } = useStudySessions();
  const { tasks } = useTasks();
  const { currentStreak, streakDates } = usePrayer();

  const monthly = React.useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i), 1);
      return d;
    });
    return months.map((m) => {
      const next = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      const count = jobs.filter((j) => {
        const applied = new Date(j.date_applied);
        return applied >= m && applied < next;
      }).length;
      return { month: monthLabel(m), applications: count };
    });
  }, [jobs]);

  const total = jobs.length || 1;
  const interviews = jobs.filter((j) => ["Interview", "HR Interview", "Technical Interview", "Final Interview"].includes(j.status)).length;
  const assessments = jobs.filter((j) => j.status === "Assessment").length;
  const offers = jobs.filter((j) => j.status === "Offer").length;
  const rejections = jobs.filter((j) => j.status === "Rejected").length;

  const rateData = [
    { name: "Interview Rate", value: Math.round((interviews / total) * 100) },
    { name: "Assessment Rate", value: Math.round((assessments / total) * 100) },
    { name: "Offer Rate", value: Math.round((offers / total) * 100) },
    { name: "Rejection Rate", value: Math.round((rejections / total) * 100) },
  ];
  const successRate = Math.round((offers / total) * 100);

  const studyByWeek = React.useMemo(() => {
    const weeks = Array.from({ length: 8 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (7 - i) * 7);
      return d;
    });
    return weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const hours = sessions
        .filter((s) => {
          const sd = new Date(s.session_date);
          return sd >= weekStart && sd < weekEnd;
        })
        .reduce((sum, s) => sum + Number(s.hours), 0);
      return { week: monthLabel(weekStart) + " w" + Math.ceil(weekStart.getDate() / 7), hours: Math.round(hours * 10) / 10 };
    });
  }, [sessions]);

  const productivity = React.useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => {
      const dateStr = d.toISOString().slice(0, 10);
      const dayTasks = tasks.filter((t) => t.due_date === dateStr);
      const pct = dayTasks.length ? Math.round((dayTasks.filter((t) => t.completed).length / dayTasks.length) * 100) : 0;
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), productivity: pct };
    });
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{successRate}%</p>
            <p className="text-xs text-muted-foreground">Success rate (offers)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{jobs.length}</p>
            <p className="text-xs text-muted-foreground">Total applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{sessions.reduce((s, x) => s + Number(x.hours), 0).toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Study hours logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold tabular-nums">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Prayer streak ({streakDates.length} total days)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jobs applied per month</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="applications" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline breakdown</CardTitle>
            <CardDescription>Interview / assessment / offer / rejection rate</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rateData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {rateData.map((_, i) => (
                    <Cell key={i} fill={RATE_COLORS[i % RATE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study hours per week</CardTitle>
            <CardDescription>Last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyByWeek} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="hours" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily productivity</CardTitle>
            <CardDescription>Task completion rate, last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivity} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="productivity" stroke="var(--color-chart-4)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
