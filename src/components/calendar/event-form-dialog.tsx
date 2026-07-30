"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CALENDAR_EVENT_TYPES, type CalendarEvent, type CalendarEventType } from "@/lib/supabase/types";
import type { CalendarEventInput } from "@/hooks/useCalendarEvents";
import { useJobs } from "@/hooks/useJobs";
import { Loader2, Trash2 } from "lucide-react";

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY = {
  title: "",
  type: "Personal" as CalendarEventType,
  start: "",
  end: "",
  all_day: false,
  location: "",
  notes: "",
  reminder_minutes_before: 30,
  job_id: "",
};

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  initialStart,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  initialStart?: Date | null;
  onSubmit: (input: CalendarEventInput) => Promise<{ error: string | null }>;
  onDelete?: () => void;
}) {
  const [form, setForm] = React.useState(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const { jobs } = useJobs();

  React.useEffect(() => {
    if (!open) return;
    if (event) {
      setForm({
        title: event.title,
        type: event.type,
        start: toLocalInput(event.start_time),
        end: toLocalInput(event.end_time),
        all_day: event.all_day,
        location: event.location ?? "",
        notes: event.notes ?? "",
        reminder_minutes_before: event.reminder_minutes_before ?? 30,
        job_id: event.job_id ?? "",
      });
    } else {
      setForm({ ...EMPTY, start: toLocalInput((initialStart ?? new Date()).toISOString()) });
    }
  }, [open, event, initialStart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.start) return;
    setSubmitting(true);
    const { error } = await onSubmit({
      title: form.title,
      type: form.type,
      start_time: new Date(form.start).toISOString(),
      end_time: form.end ? new Date(form.end).toISOString() : null,
      all_day: form.all_day,
      location: form.location || null,
      notes: form.notes || null,
      job_id: form.job_id || null,
      reminder_minutes_before: form.reminder_minutes_before,
    });
    setSubmitting(false);
    if (!error) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>Interviews, assessments, exams, meetings, reminders, and personal events.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as CalendarEventType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reminder">Reminder (minutes before)</Label>
              <Input
                id="reminder"
                type="number"
                min={0}
                value={form.reminder_minutes_before}
                onChange={(e) => setForm((f) => ({ ...f, reminder_minutes_before: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start">Starts *</Label>
              <Input id="start" type="datetime-local" required value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">Ends</Label>
              <Input id="end" type="datetime-local" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="all_day" className="cursor-pointer">
              All-day event
            </Label>
            <Switch id="all_day" checked={form.all_day} onCheckedChange={(v) => setForm((f) => ({ ...f, all_day: v }))} />
          </div>
          {form.type === "Interview" && (
            <div className="space-y-1.5">
              <Label>Related job application</Label>
              <Select
                value={form.job_id || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, job_id: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link a job (used in email reminders)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.job_title} · {j.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Linking a job fills the company &amp; role name into your email reminders automatically.
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="location">Location / link</Label>
            <Input id="location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <DialogFooter className="sm:justify-between">
            {event && onDelete ? (
              <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {event ? "Save changes" : "Create event"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
