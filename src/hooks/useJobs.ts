"use client";

import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { JobApplication } from "@/lib/supabase/types";
import { toast } from "sonner";

export type JobInput = Omit<
  JobApplication,
  "id" | "user_id" | "created_at" | "updated_at" | "date_applied"
> & { date_applied?: string };

export function useJobs() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [jobs, setJobs] = React.useState<JobApplication[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!supabase || !user) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("date_applied", { ascending: false });
    if (error) {
      toast.error("Failed to load job applications", { description: error.message });
    } else {
      setJobs(data ?? []);
    }
    setLoading(false);
  }, [supabase, user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!supabase || !user) return;
    const channel = supabase
      .channel("jobs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs", filter: `user_id=eq.${user.id}` },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, refresh]);

  const createJob = React.useCallback(
    async (input: JobInput) => {
      if (!supabase || !user) return { error: "Not connected" };
      const { error } = await supabase.from("jobs").insert({
        ...input,
        user_id: user.id,
        date_applied: input.date_applied ?? new Date().toISOString(),
      });
      if (error) {
        toast.error("Could not save application", { description: error.message });
        return { error: error.message };
      }
      toast.success("Application added");
      await refresh();
      return { error: null };
    },
    [supabase, user, refresh]
  );

  const updateJob = React.useCallback(
    async (id: string, input: Partial<JobInput>) => {
      if (!supabase) return { error: "Not connected" };
      const { error } = await supabase.from("jobs").update(input).eq("id", id);
      if (error) {
        toast.error("Could not update application", { description: error.message });
        return { error: error.message };
      }
      toast.success("Application updated");
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const deleteJob = React.useCallback(
    async (id: string) => {
      if (!supabase) return { error: "Not connected" };
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) {
        toast.error("Could not delete application", { description: error.message });
        return { error: error.message };
      }
      toast.success("Application deleted");
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const duplicateJob = React.useCallback(
    async (job: JobApplication) => {
      if (!supabase || !user) return { error: "Not connected" };
      const { id, created_at, updated_at, ...rest } = job;
      void id;
      void created_at;
      void updated_at;
      const { error } = await supabase.from("jobs").insert({
        ...rest,
        user_id: user.id,
        company_name: `${rest.company_name} (copy)`,
        date_applied: new Date().toISOString(),
        status: "Applied",
      });
      if (error) {
        toast.error("Could not duplicate application", { description: error.message });
        return { error: error.message };
      }
      toast.success("Application duplicated");
      await refresh();
      return { error: null };
    },
    [supabase, user, refresh]
  );

  return { jobs, loading, createJob, updateJob, deleteJob, duplicateJob, refresh };
}
