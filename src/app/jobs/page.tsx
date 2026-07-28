import { AppShell } from "@/components/layout/app-shell";
import { JobsContent } from "@/components/jobs/jobs-content";

export default function JobsPage() {
  return (
    <AppShell title="Job Application Tracker">
      <JobsContent />
    </AppShell>
  );
}
