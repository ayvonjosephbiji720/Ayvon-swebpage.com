"use client";

import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { StudySession } from "@/lib/supabase/types";
import { toast } from "sonner";

export type StudySessionInput = Omit<StudySession, "id" | "user_id" | "created_at">;

export function useStudySessions() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [sessions, setSessions] = React.useState<StudySession[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!supabase || !user) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .order("session_date", { ascending: false });
    if (error) {
      toast.error("Failed to load study sessions", { description: error.message });
    } else {
      setSessions(data ?? []);
    }
    setLoading(false);
  }, [supabase, user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const addSession = React.useCallback(
    async (input: StudySessionInput) => {
      if (!supabase || !user) return { error: "Not connected" };
      const { error } = await supabase.from("study_sessions").insert({ ...input, user_id: user.id });
      if (error) {
        toast.error("Could not add study session", { description: error.message });
        return { error: error.message };
      }
      toast.success("Study session logged");
      await refresh();
      return { error: null };
    },
    [supabase, user, refresh]
  );

  const updateSession = React.useCallback(
    async (id: string, input: Partial<StudySessionInput>) => {
      if (!supabase) return;
      await supabase.from("study_sessions").update(input).eq("id", id);
      await refresh();
    },
    [supabase, refresh]
  );

  const deleteSession = React.useCallback(
    async (id: string) => {
      if (!supabase) return;
      await supabase.from("study_sessions").delete().eq("id", id);
      await refresh();
    },
    [supabase, refresh]
  );

  return { sessions, loading, addSession, updateSession, deleteSession, refresh };
}
