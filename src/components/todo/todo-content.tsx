"use client";

import * as React from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/hooks/useTasks";

export function TodoContent() {
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const { tasks, loading, addTask, toggleTask, deleteTask, seedDailyGoals } = useTasks(date);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");

  const completed = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask({ title: title.trim(), category: category || null, due_date: date, completed: false, is_auto_suggested: false });
    setTitle("");
    setCategory("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          <Button variant="outline" onClick={seedDailyGoals}>
            <Sparkles className="h-4 w-4" /> Suggest daily goals
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>
            {completed} of {tasks.length} tasks complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="What do you need to get done?" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" />
            <Input placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48" />
            <Button type="submit">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks for this day yet.</p>
          )}
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Checkbox checked={t.completed} onCheckedChange={(v) => toggleTask(t.id, Boolean(v))} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${t.completed ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                {t.category && <p className="text-xs text-muted-foreground">{t.category}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)} className="hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
