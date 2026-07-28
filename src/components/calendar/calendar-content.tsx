"use client";

import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, { type EventResizeDoneArg } from "@fullcalendar/interaction";
import type { EventClickArg, DateSelectArg, EventContentArg, EventDropArg } from "@fullcalendar/core";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { EventFormDialog } from "./event-form-dialog";
import type { CalendarEvent } from "@/lib/supabase/types";
import { EVENT_TYPE_COLORS, CALENDAR_EVENT_TYPES } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CalendarContent() {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [initialStart, setInitialStart] = React.useState<Date | null>(null);

  const fcEvents = React.useMemo(
    () =>
      events.map((ev) => ({
        id: ev.id,
        title: ev.title,
        start: ev.start_time,
        end: ev.end_time ?? undefined,
        allDay: ev.all_day,
        backgroundColor: EVENT_TYPE_COLORS[ev.type],
        borderColor: EVENT_TYPE_COLORS[ev.type],
        extendedProps: { type: ev.type, location: ev.location },
      })),
    [events]
  );

  const handleEventClick = (arg: EventClickArg) => {
    const ev = events.find((e) => e.id === arg.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setFormOpen(true);
    }
  };

  const handleSelect = (arg: DateSelectArg) => {
    setSelectedEvent(null);
    setInitialStart(arg.start);
    setFormOpen(true);
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    const ev = events.find((e) => e.id === arg.event.id);
    if (!ev) return;
    await updateEvent(ev.id, {
      start_time: arg.event.start ? arg.event.start.toISOString() : ev.start_time,
      end_time: arg.event.end ? arg.event.end.toISOString() : null,
    });
  };

  const handleEventResize = async (arg: EventResizeDoneArg) => {
    const ev = events.find((e) => e.id === arg.event.id);
    if (!ev) return;
    await updateEvent(ev.id, {
      start_time: arg.event.start ? arg.event.start.toISOString() : ev.start_time,
      end_time: arg.event.end ? arg.event.end.toISOString() : null,
    });
  };

  const renderEventContent = (arg: EventContentArg) => (
    <div className="truncate px-1 text-[11px] font-medium text-white">{arg.event.title}</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {CALENDAR_EVENT_TYPES.map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
              {t}
            </span>
          ))}
        </div>
        <Button
          onClick={() => {
            setSelectedEvent(null);
            setInitialStart(new Date());
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-5">
          {loading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Loading calendar…</p>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              height="auto"
              selectable
              editable
              events={fcEvents}
              eventClick={handleEventClick}
              select={handleSelect}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              eventContent={renderEventContent}
              dayMaxEvents={3}
            />
          )}
        </CardContent>
      </Card>

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={selectedEvent}
        initialStart={initialStart}
        onSubmit={(input) => (selectedEvent ? updateEvent(selectedEvent.id, input) : createEvent(input))}
        onDelete={
          selectedEvent
            ? async () => {
                await deleteEvent(selectedEvent.id);
                setFormOpen(false);
              }
            : undefined
        }
      />
    </div>
  );
}
