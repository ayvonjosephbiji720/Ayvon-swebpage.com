"use client";

import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { Task } from "@/lib/supabase/types";
import { toast } from "sonner";

export type TaskInput = Omit<Task, "id" | "user_id" | "created_at">;

export const DEFAULT_DAILY_GOALS: string[] = [
  "Apply for 10 jobs today",
  "Practice interview for 1 hour",
  "Study for 2 hours",
  "Complete one lab",
  "Pray",
  "Exercise",
  "Update resume if needed",
  "Follow up with recruiters",
];

export function useTasks(dateFilter?: string) {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  // Unique per hook instance so two simultaneous callers never collide on
  // the same Realtime channel topic (see useJobs.ts for the full story).
  const channelSuffix = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  const refresh = React.useCallback(async () => {
    if (!supabase || !user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase.from("tasks").select("*").order("created_at", { ascending: true });
    if (dateFilter) query = query.eq("due_date", dateFilter);
    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load tasks", { description: error.message });
    } else {
      setTasks(data ?? []);
    }
    setLoading(false);
  }, [supabase, user, dateFilter]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!supabase || !user) return;
    const channel = supabase.channel(`tasks-changes-${channelSuffix}`);
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` },
      () => refresh()
    );
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, refresh, channelSuffix]);

  const addTask = React.useCallback(
    async (input: TaskInput) => {
      if (!supabase || !user) return { error: "Not connected" };
      const { error } = await supabase.from("tasks").insert({ ...input, user_id: user.id });
      if (error) {
        toast.error("Could not add task", { description: error.message });
        return { error: error.message };
      }
      await refresh();
      return { error: null };
    },
    [supabase, user, refresh]
  );

  const toggleTask = React.useCallback(
    async (id: string, completed: boolean) => {
      if (!supabase) return;
      await supabase.from("tasks").update({ completed }).eq("id", id);
      await refresh();
    },
    [supabase, refresh]
  );

  const updateTask = React.useCallback(
    async (id: string, input: Partial<TaskInput>) => {
      if (!supabase) return;
      await supabase.from("tasks").update(input).eq("id", id);
      await refresh();
    },
    [supabase, refresh]
  );

  const deleteTask = React.useCallback(
    async (id: string) => {
      if (!supabase) return;
      await supabase.from("tasks").delete().eq("id", id);
      await refresh();
    },
    [supabase, refresh]
  );

  const seedDailyGoals = React.useCallback(async () => {
    if (!supabase || !user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
      .from("tasks")
      .select("id")
      .eq("due_date", today)
      .eq("is_auto_suggested", true);
    if (existing && existing.length > 0) return;
    const rows = DEFAULT_DAILY_GOALS.map((title) => ({
      title,
      user_id: user.id,
      due_date: today,
      completed: false,
      is_auto_suggested: true,
      category: "Daily Goal",
    }));
    await supabase.from("tasks").insert(rows);
    await refresh();
  }, [supabase, user, refresh]);

  return { tasks, loading, addTask, toggleTask, updateTask, deleteTask, seedDailyGoals, refresh };
}
