import { AppShell } from "@/components/layout/app-shell";
import { DailyTargetContent } from "@/components/daily-target/daily-target-content";

export default function DailyTargetPage() {
  return (
    <AppShell title="Daily Target">
      <DailyTargetContent />
    </AppShell>
  );
}
