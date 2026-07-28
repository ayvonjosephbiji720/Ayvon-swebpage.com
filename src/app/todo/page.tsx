import { AppShell } from "@/components/layout/app-shell";
import { TodoContent } from "@/components/todo/todo-content";

export default function TodoPage() {
  return (
    <AppShell title="Smart To-Do List">
      <TodoContent />
    </AppShell>
  );
}
