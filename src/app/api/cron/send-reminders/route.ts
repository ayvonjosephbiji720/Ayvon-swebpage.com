import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendInterviewReminderEmail } from "@/lib/email/reminder-email";
import type { EmailReminderType } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

// Windows are wider than the reminder lead time itself so that whatever
// interval the cron scheduler actually runs at (every 15-30 min is typical),
// each interview is still guaranteed to fall inside a check at least once.
// The email_reminder_log table's unique constraint stops duplicate sends
// even if an event ends up inside a window on more than one run.
const REMINDER_WINDOWS: { type: EmailReminderType; from: number; to: number }[] = [
  { type: "1_day", from: ONE_DAY_MS - ONE_HOUR_MS, to: ONE_DAY_MS + ONE_HOUR_MS },
  { type: "1_hour", from: ONE_HOUR_MS - 15 * 60 * 1000, to: ONE_HOUR_MS + 15 * 60 * 1000 },
];

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized. Set CRON_SECRET and call this route with an 'Authorization: Bearer <CRON_SECRET>' header." },
      { status: 401 }
    );
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Email reminders are not configured (missing SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 501 }
    );
  }

  const now = Date.now();
  const results: { eventId: string; type: EmailReminderType; status: string }[] = [];

  for (const window of REMINDER_WINDOWS) {
    const from = new Date(now + window.from).toISOString();
    const to = new Date(now + window.to).toISOString();

    const { data: events, error } = await admin
      .from("calendar_events")
      .select("id, user_id, title, type, start_time, location, notes, job_id")
      .eq("type", "Interview")
      .gte("start_time", from)
      .lte("start_time", to);

    if (error || !events) continue;

    for (const event of events) {
      const { data: existingLog } = await admin
        .from("email_reminder_log")
        .select("id")
        .eq("calendar_event_id", event.id)
        .eq("reminder_type", window.type)
        .maybeSingle();
      if (existingLog) continue;

      const { data: settings } = await admin
        .from("email_reminder_settings")
        .select("enabled")
        .eq("user_id", event.user_id)
        .maybeSingle();
      if (settings && settings.enabled === false) continue;

      const { data: userRes } = await admin.auth.admin.getUserById(event.user_id);
      const email = userRes?.user?.email;
      if (!email) continue;

      let companyName = event.title;
      let jobTitle = event.title;
      if (event.job_id) {
        const { data: job } = await admin
          .from("jobs")
          .select("company_name, job_title")
          .eq("id", event.job_id)
          .maybeSingle();
        if (job) {
          companyName = job.company_name;
          jobTitle = job.job_title;
        }
      }

      const { error: sendError } = await sendInterviewReminderEmail({
        to: email,
        reminderType: window.type,
        companyName,
        jobTitle,
        startTime: event.start_time,
        meetingLink: event.location,
        notes: event.notes,
      });

      if (!sendError) {
        await admin.from("email_reminder_log").insert({ calendar_event_id: event.id, reminder_type: window.type });
        results.push({ eventId: event.id, type: window.type, status: "sent" });
      } else {
        results.push({ eventId: event.id, type: window.type, status: `error: ${sendError}` });
      }
    }
  }

  return NextResponse.json({ checked: results.length, results });
}
