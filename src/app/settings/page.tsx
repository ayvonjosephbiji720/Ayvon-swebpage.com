"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { useNotificationPermission } from "@/hooks/useNotificationScheduler";
import { useEmailReminderSettings } from "@/hooks/useEmailReminderSettings";
import { useRouter } from "next/navigation";
import { BellRing, LogOut, Mail, ShieldCheck, MailCheck } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { permission, requestPermission } = useNotificationPermission();
  const { enabled: emailRemindersEnabled, setEnabled: setEmailRemindersEnabled } = useEmailReminderSettings();
  const router = useRouter();

  return (
    <AppShell title="Settings">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium">{user?.email}</p>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Switch between light and dark mode</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Toggle theme</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-4 w-4" /> Notifications
            </CardTitle>
            <CardDescription>
              Browser notifications power reminders for interviews, assessments, prayer times, and deadlines.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <p className="text-sm">
              Status: <span className="font-medium capitalize">{permission}</span>
            </p>
            {permission !== "granted" && permission !== "unsupported" && (
              <Button size="sm" onClick={requestPermission}>
                Enable notifications
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailCheck className="h-4 w-4" /> Email Reminders
            </CardTitle>
            <CardDescription>
              Get an email 1 day and 1 hour before scheduled interviews, with the company, role, time, meeting
              link, and notes included.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="email_reminders" className="cursor-pointer text-sm">
              Send me interview email reminders
            </Label>
            <Switch id="email_reminders" checked={emailRemindersEnabled} onCheckedChange={setEmailRemindersEnabled} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Data &amp; security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              All data is stored in your own Supabase project with row-level security enabled — only your
              authenticated account can read or write your records.
            </p>
            <p>See the README for how to enable optional email integration and the AI assistant with your own API keys.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
