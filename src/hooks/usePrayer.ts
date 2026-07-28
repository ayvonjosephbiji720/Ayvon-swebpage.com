"use client";

import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { PrayerNote, PrayerTime } from "@/lib/supabase/types";
import { toast } from "sonner";

const DEFAULT_PRAYER_TIMES: Array<{ label: string; time_of_day: string }> = [
  { label: "Morning Prayer", time_of_day: "06:30" },
  { label: "Afternoon Prayer", time_of_day: "13:00" },
  { label: "Evening Prayer", time_of_day: "20:30" },
];

export function usePrayer() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [notes, setNotes] = React.useState<PrayerNote[]>([]);
  const [times, setTimes] = React.useState<PrayerTime[]>([]);
  const [streakDates, setStreakDates] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!supabase || !user) {
      setNotes([]);
      setTimes([]);
      setStreakDates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [notesRes, timesRes, streaksRes] = await Promise.all([
      supabase.from("prayer_notes").select("*").order("note_date", { ascending: false }),
      supabase.from("prayer_times").select("*").order("time_of_day", { ascending: true }),
      supabase.from("prayer_streaks").select("prayed_date").order("prayed_date", { ascending: false }),
    ]);
    if (notesRes.error) toast.error("Failed to load prayer notes", { description: notesRes.error.message });
    setNotes(notesRes.data ?? []);
    setTimes(timesRes.data ?? []);
    setStreakDates((streaksRes.data ?? []).map((r) => r.prayed_date));

    if (!timesRes.error && (timesRes.data?.length ?? 0) === 0) {
      await supabase
        .from("prayer_times")
        .insert(DEFAULT_PRAYER_TIMES.map((t) => ({ ...t, user_id: user.id, enabled: true })));
      const refreshed = await supabase.from("prayer_times").select("*").order("time_of_day", { ascending: true });
      setTimes(refreshed.data ?? []);
    }
    setLoading(false);
  }, [supabase, user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const addNote = React.useCallback(
    async (content: string, note_date: string) => {
      if (!supabase || !user) return;
      const { error } = await supabase.from("prayer_notes").insert({ content, note_date, user_id: user.id });
      if (error) {
        toast.error("Could not save note", { description: error.message });
        return;
      }
      toast.success("Prayer note saved");
      await refresh();
    },
    [supabase, user, refresh]
  );

  const deleteNote = React.useCallback(
    async (id: string) => {
      if (!supabase) return;
      await supabase.from("prayer_notes").delete().eq("id", id);
      await refresh();
    },
    [supabase, refresh]
  );

  const updatePrayerTime = React.useCallback(
    async (id: string, input: Partial<Pick<PrayerTime, "label" | "time_of_day" | "enabled">>) => {
      if (!supabase) return;
      await supabase.from("prayer_times").update(input).eq("id", id);
      await refresh();
    },
    [supabase, refresh]
  );

  const markPrayedToday = React.useCallback(async () => {
    if (!supabase || !user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("prayer_streaks")
      .upsert({ user_id: user.id, prayed_date: today }, { onConflict: "user_id,prayed_date" });
    if (!error) {
      toast.success("Marked as prayed today. Keep the streak going!");
      await refresh();
    }
  }, [supabase, user, refresh]);

  const currentStreak = React.useMemo(() => {
    if (streakDates.length === 0) return 0;
    const sorted = [...streakDates].sort().reverse();
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(cursor);
      expected.setDate(cursor.getDate() - i);
      const expectedStr = expected.toISOString().slice(0, 10);
      if (sorted[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [streakDates]);

  return {
    notes,
    times,
    streakDates,
    currentStreak,
    loading,
    addNote,
    deleteNote,
    updatePrayerTime,
    markPrayedToday,
    refresh,
  };
}
