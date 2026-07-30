"use client";

import * as React from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

export function useEmailReminderSettings() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [enabled, setEnabledState] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("email_reminder_settings")
      .select("enabled")
      .eq("user_id", user.id)
      .maybeSingle();
    setEnabledState(data?.enabled ?? true);
    setLoading(false);
  }, [supabase, user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const setEnabled = React.useCallback(
    async (value: boolean) => {
      if (!supabase || !user) return;
      setEnabledState(value);
      await supabase
        .from("email_reminder_settings")
        .upsert({ user_id: user.id, enabled: value, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    },
    [supabase, user]
  );

  return { enabled, loading, setEnabled };
}
