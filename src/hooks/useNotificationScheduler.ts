"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";

const CHECK_INTERVAL_MS = 60_000;
const NOTIFIED_KEY = "pathway:notified-ids";
const NOTIFIED_PRAYER_KEY = "pathway:notified-prayer";

function readNotified(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function writeNotified(set: Set<string>) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(Array.from(set)));
}

function fireNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

/**
 * Client-side reminder scheduler. Polls calendar events, prayer times, and
 * unfinished daily tasks once a minute and fires browser notifications when
 * something is due. This intentionally runs entirely in the browser (no
 * server-side push) — the tab needs to be open for reminders to fire.
 */
export function useNotificationScheduler() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  React.useEffect(() => {
    if (!supabase || !user) return;

    const check = async () => {
      const now = new Date();
      const notified = readNotified();

      const { data: events } = await supabase
        .from("calendar_events")
        .select("id, title, type, start_time, reminder_minutes_before")
        .gte("start_time", now.toISOString())
        .lte("start_time", new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString());

      (events ?? []).forEach((ev) => {
        const start = new Date(ev.start_time).getTime();
        const lead = (ev.reminder_minutes_before ?? 30) * 60 * 1000;
        const fireAt = start - lead;
        if (now.getTime() >= fireAt && now.getTime() < start && !notified.has(ev.id)) {
          fireNotification(`Upcoming ${ev.type}: ${ev.title}`, `Starts at ${new Date(ev.start_time).toLocaleTimeString()}`);
          notified.add(ev.id);
        }
      });

      const { data: prayerTimes } = await supabase
        .from("prayer_times")
        .select("id, label, time_of_day, enabled")
        .eq("enabled", true);

      const today = now.toISOString().slice(0, 10);
      const prayerNotified: Record<string, string> = JSON.parse(
        localStorage.getItem(NOTIFIED_PRAYER_KEY) || "{}"
      );
      (prayerTimes ?? []).forEach((pt) => {
        const [h, m] = pt.time_of_day.split(":").map(Number);
        const target = new Date(now);
        target.setHours(h, m, 0, 0);
        const diffMinutes = (now.getTime() - target.getTime()) / 60000;
        if (diffMinutes >= 0 && diffMinutes < 5 && prayerNotified[pt.id] !== today) {
          fireNotification(pt.label, "It's time to pause and pray.");
          prayerNotified[pt.id] = today;
        }
      });
      localStorage.setItem(NOTIFIED_PRAYER_KEY, JSON.stringify(prayerNotified));

      writeNotified(notified);
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [supabase, user]);
}

export function useNotificationPermission() {
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">("default");

  React.useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = React.useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  return { permission, requestPermission };
}
