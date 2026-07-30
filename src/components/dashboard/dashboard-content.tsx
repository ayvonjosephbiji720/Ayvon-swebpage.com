"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  CalendarCheck2,
  ClipboardList,
  Trophy,
  XCircle,
  CalendarClock,
  BookOpenCheck,
  HandHeart,
  Target,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useJobs } from "@/hooks/useJobs";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useTasks } from "@/hooks/useTasks";
import { useStudySessions } from "@/hooks/useStudySessions";
import { usePrayer } from "@/hooks/usePrayer";
import { useDailyTarget } from "@/hooks/useDailyTarget";
import { getTodaysPrayerContent } from "@/content/prayer-content";
import { EVENT_TYPE_COLORS } from "@/lib/supabase/types";
import { formatDate, formatTime } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const WEEKLY_STUDY_GOAL_HOURS = 14;

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function DashboardContent() {
  const { jobs, loading: jobsLoading } = useJobs();
  const { events, loading: eventsLoading } = useCalendarEvents();
  const { tasks, toggleTask, seedDailyGoals } = useTasks(new Date().toISOString().slice(0, 10));
  const { sessions } = useStudySessions();
  const { currentStreak, times } = usePrayer();
  const {
    totalAppliedToday,
    totalGoalToday,
    percentComplete: targetPercentComplete,
    remaining: targetRemaining,
    isComplete: targetComplete,
  } = useDailyTarget();

  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedDailyGoals();
    }
  }, [seedDailyGoals]);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalApplied = jobs.length;
  const thisWeek = jobs.filter((j) => new Date(j.date_applied) >= weekStart).length;
  const thisMonth = jobs.filter((j) => new Date(j.date_applied) >= monthStart).length;
  const interviews = jobs.filter((j) =>
    ["Interview", "HR Interview", "Technical Interview", "Final Interview"].includes(j.status)
  ).length;
  const assessments = jobs.filter((j) => j.status === "Assessment").length;
  const offers = jobs.filter((j) => j.status === "Offer").length;
  const rejections = jobs.filter((j) => j.status === "Rejected").length;

  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) >= now)
    .slice(0, 5);

  const todaysTasks = tasks;
  const completedCount = todaysTasks.filter((t) => t.completed).length;
  const taskProgress = todaysTasks.length ? Math.round((completedCount / todaysTasks.length) * 100) : 0;

  const weekHours = sessions
    .filter((s) => new Date(s.session_date) >= weekStart)
    .reduce((sum, s) => sum + Number(s.hours), 0);
  const studyProgress = Math.min(100, Math.round((weekHours / WEEKLY_STUDY_GOAL_HOURS) * 100));

  const verse = getTodaysPrayerContent();
  const nextPrayer = times.find((t) => t.enabled);

  const chartData = React.useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return days.map((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = jobs.filter((j) => {
        const applied = new Date(j.date_applied);
        return applied >= d && applied < next;
      }).length;
      return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), applications: count };
    });
  }, [jobs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Total Jobs Applied" value={jobsLoading ? "…" : totalApplied} icon={Briefcase} tone="primary" />
        <StatCard label="Applications This Week" value={thisWeek} icon={CalendarClock} />
        <StatCard label="Applications This Month" value={thisMonth} icon={CalendarCheck2} />
        <StatCard label="Interviews Scheduled" value={interviews} icon={ClipboardList} tone="warning" />
        <StatCard label="Assessments Pending" value={assessments} icon={ClipboardList} tone="warning" />
        <StatCard label="Offers Received" value={offers} icon={Trophy} tone="success" />
        <StatCard label="Rejections" value={rejections} icon={XCircle} tone="destructive" />
        <StatCard label="Prayer Streak" value={`${currentStreak} day${currentStreak === 1 ? "" : "s"}`} icon={HandHeart} tone="primary" />
      </div>

      <Card className="border-primary/40">
        <CardContent className="flex flex-wrap items-center gap-6 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Today&apos;s Target</p>
              <p className="text-xs text-muted-foreground">
                {targetComplete ? "🎉 Completed!" : `${targetRemaining} applications remaining`}
              </p>
            </div>
          </div>
          <div className="min-w-[10rem] flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {totalAppliedToday}/{totalGoalToday} applied
              </span>
              <span>{targetPercentComplete}%</span>
            </div>
            <Progress value={targetPercentComplete} />
          </div>
          <Link href="/daily-target" className="text-xs text-primary hover:underline shrink-0">
            View Daily Target
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications — last 14 days</CardTitle>
          <CardDescription>Daily count of applications submitted</CardDescription>
        </CardHeader>
        <CardContent className="h-64 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="applications" stroke="var(--color-chart-1)" fill="url(#colorApps)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Interviews, assessments, and reminders on the horizon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventsLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!eventsLoading && upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
            )}
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: EVENT_TYPE_COLORS[ev.type] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(ev.start_time)} · {formatTime(ev.start_time)}
                  </p>
                </div>
                <Badge variant="outline">{ev.type}</Badge>
              </div>
            ))}
            <Link href="/calendar" className="block text-center text-xs text-primary hover:underline">
              View full calendar
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Today&apos;s Tasks</CardTitle>
              <CardDescription>{completedCount}/{todaysTasks.length} complete</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={taskProgress} />
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {todaysTasks.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-2.5 text-sm">
                  <Checkbox checked={t.completed} onCheckedChange={(v) => toggleTask(t.id, Boolean(v))} />
                  <span className={t.completed ? "text-muted-foreground line-through" : ""}>{t.title}</span>
                </label>
              ))}
              {todaysTasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet for today.</p>}
            </div>
            <Link href="/todo" className="block text-center text-xs text-primary hover:underline">
              Manage to-do list
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/10 via-transparent to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="h-4 w-4 text-primary" /> Daily Bible Verse
            </CardTitle>
            <CardDescription>{verse.topic} · {verse.reference}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm leading-relaxed">&ldquo;{verse.english}&rdquo;</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{verse.malayalam}</p>
            {nextPrayer && (
              <p className="pt-2 text-xs text-muted-foreground">
                Next reminder: <span className="font-medium text-foreground">{nextPrayer.label}</span> at{" "}
                {nextPrayer.time_of_day}
              </p>
            )}
            <Link href="/prayer" className="block pt-1 text-center text-xs text-primary hover:underline">
              Open Prayer page
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-primary" /> Study Progress
            </CardTitle>
            <CardDescription>
              {weekHours.toFixed(1)}h of {WEEKLY_STUDY_GOAL_HOURS}h weekly goal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={studyProgress} />
            <p className="text-xs text-muted-foreground">{studyProgress}% of this week&apos;s study goal</p>
            <Link href="/study" className="block text-center text-xs text-primary hover:underline">
              Open Study Planner
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
