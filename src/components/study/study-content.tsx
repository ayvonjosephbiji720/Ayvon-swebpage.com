"use client";

import * as React from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useStudySessions } from "@/hooks/useStudySessions";
import { StudyFormDialog } from "./study-form-dialog";
import { formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export function StudyContent() {
  const { sessions, loading, addSession, updateSession, deleteSession } = useStudySessions();
  const [formOpen, setFormOpen] = React.useState(false);

  const bySubject = React.useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s) => map.set(s.subject, (map.get(s.subject) ?? 0) + Number(s.hours)));
    return Array.from(map.entries()).map(([subject, hours]) => ({ subject, hours: Math.round(hours * 100) / 100 }));
  }, [sessions]);

  const totalHours = sessions.reduce((sum, s) => sum + Number(s.hours), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold tabular-nums">{totalHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Total hours logged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold tabular-nums">{sessions.filter((s) => s.completed).length}</p>
              <p className="text-xs text-muted-foreground">Completed sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold tabular-nums">{bySubject.length}</p>
              <p className="text-xs text-muted-foreground">Subjects in progress</p>
            </CardContent>
          </Card>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Log Session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hours by subject</CardTitle>
          <CardDescription>Where your study time is going</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {bySubject.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Log a session to see your progress chart.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySubject} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="hours" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && sessions.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
              No study sessions logged yet.
            </div>
          )}
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Checkbox checked={s.completed} onCheckedChange={(v) => updateSession(s.id, { completed: Boolean(v) })} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${s.completed ? "text-muted-foreground line-through" : ""}`}>
                  {s.subject} {s.topic && <span className="text-muted-foreground">· {s.topic}</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(s.session_date)} · {s.hours}h
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteSession(s.id)} className="hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <StudyFormDialog open={formOpen} onOpenChange={setFormOpen} onSubmit={addSession} />
    </div>
  );
}
