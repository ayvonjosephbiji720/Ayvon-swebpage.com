"use client";

import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { CalendarEvent } from "@/lib/supabase/types";
import { toast } from "sonner";

export type CalendarEventInput = Omit<CalendarEvent, "id" | "user_id" | "created_at">;

export function useCalendarEvents() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  // Unique per hook instance so two simultaneous callers never collide on
  // the same Realtime channel topic (see useJobs.ts for the full story).
  const channelSuffix = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  const refresh = React.useCallback(async () => {
    if (!supabase || !user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true });
    if (error) {
      toast.error("Failed to load calendar events", { description: error.message });
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  }, [supabase, user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!supabase || !user) return;
    const channel = supabase.channel(`calendar-changes-${channelSuffix}`);
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "calendar_events", filter: `user_id=eq.${user.id}` },
      () => refresh()
    );
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, refresh, channelSuffix]);

  const createEvent = React.useCallback(
    async (input: CalendarEventInput) => {
      if (!supabase || !user) return { error: "Not connected" };
      const { error } = await supabase.from("calendar_events").insert({ ...input, user_id: user.id });
      if (error) {
        toast.error("Could not save event", { description: error.message });
        return { error: error.message };
      }
      toast.success("Event added");
      await refresh();
      return { error: null };
    },
    [supabase, user, refresh]
  );

  const updateEvent = React.useCallback(
    async (id: string, input: Partial<CalendarEventInput>) => {
      if (!supabase) return { error: "Not connected" };
      const { error } = await supabase.from("calendar_events").update(input).eq("id", id);
      if (error) {
        toast.error("Could not update event", { description: error.message });
        return { error: error.message };
      }
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const deleteEvent = React.useCallback(
    async (id: string) => {
      if (!supabase) return { error: "Not connected" };
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) {
        toast.error("Could not delete event", { description: error.message });
        return { error: error.message };
      }
      toast.success("Event deleted");
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  return { events, loading, createEvent, updateEvent, deleteEvent, refresh };
}
