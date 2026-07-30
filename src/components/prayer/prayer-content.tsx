"use client";

import * as React from "react";
import { HandHeart, Flame, Trash2, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { usePrayer } from "@/hooks/usePrayer";
import { getTodaysPrayerContent } from "@/content/prayer-content";
import { formatDate } from "@/lib/utils";
import { useNotificationPermission } from "@/hooks/useNotificationScheduler";
import { DailyBlessings } from "./daily-blessings";

export function PrayerContent() {
  const { notes, times, currentStreak, streakDates, addNote, deleteNote, updatePrayerTime, markPrayedToday } =
    usePrayer();
  const [noteText, setNoteText] = React.useState("");
  const { permission, requestPermission } = useNotificationPermission();
  const verse = getTodaysPrayerContent();
  const today = new Date().toISOString().slice(0, 10);
  const prayedToday = streakDates.includes(today);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    await addNote(noteText.trim(), today);
    setNoteText("");
  };

  return (
    <div className="space-y-6">
      {permission === "default" && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-primary" />
              <p className="text-sm">Enable browser notifications to get prayer time reminders.</p>
            </div>
            <Button size="sm" onClick={requestPermission}>
              Enable notifications
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-primary" /> {verse.topic}
            </CardTitle>
            <CardDescription>{verse.reference}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">English</p>
              <p className="text-sm leading-relaxed">&ldquo;{verse.english}&rdquo;</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Malayalam</p>
              <p className="text-sm leading-relaxed">{verse.malayalam}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Explanation</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{verse.explanation}</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reflection</p>
              <p className="text-sm">{verse.reflection}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-warning" /> Prayer Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-4xl font-bold tabular-nums">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">consecutive day{currentStreak === 1 ? "" : "s"}</p>
            <Button className="w-full" disabled={prayedToday} onClick={markPrayedToday}>
              {prayedToday ? "Prayed today ✓" : "Mark as prayed today"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <DailyBlessings />

      <Card>
        <CardHeader>
          <CardTitle>Prayer Times</CardTitle>
          <CardDescription>Set daily reminders. Notifications fire while this app is open in a browser tab.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {times.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
              <Input
                className="w-40"
                value={t.label}
                onChange={(e) => updatePrayerTime(t.id, { label: e.target.value })}
              />
              <Input
                type="time"
                className="w-32"
                value={t.time_of_day.slice(0, 5)}
                onChange={(e) => updatePrayerTime(t.id, { time_of_day: e.target.value })}
              />
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t.enabled ? "On" : "Off"}</span>
                <Switch checked={t.enabled} onCheckedChange={(v) => updatePrayerTime(t.id, { enabled: v })} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Prayer Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddNote} className="flex flex-col gap-2 sm:flex-row">
            <Textarea
              className="min-h-9 flex-1"
              placeholder="Write a prayer, request, or gratitude note for today…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Button type="submit" className="sm:self-end">
              Save note
            </Button>
          </form>
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.note_date)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteNote(n.id)} className="hover:text-destructive shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet — write your first one above.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
