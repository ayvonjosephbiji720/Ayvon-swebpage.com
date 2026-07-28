import { AppShell } from "@/components/layout/app-shell";
import { CalendarContent } from "@/components/calendar/calendar-content";

export default function CalendarPage() {
  return (
    <AppShell title="Calendar">
      <CalendarContent />
    </AppShell>
  );
}
