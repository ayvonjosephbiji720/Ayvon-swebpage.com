import { AppShell } from "@/components/layout/app-shell";
import { AssistantContent } from "@/components/assistant/assistant-content";

export default function AssistantPage() {
  return (
    <AppShell title="AI Assistant">
      <AssistantContent />
    </AppShell>
  );
}
