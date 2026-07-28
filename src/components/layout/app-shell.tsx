"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuth } from "@/context/auth-context";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";
import { Loader2, DatabaseZap } from "lucide-react";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useNotificationScheduler();

  React.useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/login");
    }
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm animate-fade-in-up">
          <DatabaseZap className="mx-auto h-10 w-10 text-primary" />
          <h1 className="text-xl font-semibold">Connect your database</h1>
          <p className="text-sm text-muted-foreground">
            This app is not connected to Supabase yet. Add{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code>, run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">supabase/schema.sql</code> in your Supabase
            project&apos;s SQL editor, then restart the dev server. See the README for step-by-step
            instructions.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 animate-fade-in-up">{children}</main>
      </div>
    </div>
  );
}
