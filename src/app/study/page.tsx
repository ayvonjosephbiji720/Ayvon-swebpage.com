import { AppShell } from "@/components/layout/app-shell";
import { StudyContent } from "@/components/study/study-content";

export default function StudyPage() {
  return (
    <AppShell title="Study Planner">
      <StudyContent />
    </AppShell>
  );
}
