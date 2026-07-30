import "server-only";
import { Resend } from "resend";
import type { EmailReminderType } from "@/lib/supabase/types";

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export interface InterviewReminderInput {
  to: string;
  reminderType: EmailReminderType;
  companyName: string;
  jobTitle: string;
  startTime: string;
  meetingLink: string | null;
  notes: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildReminderSubject(input: InterviewReminderInput): string {
  const lead = input.reminderType === "1_day" ? "Tomorrow" : "In 1 hour";
  return `${lead}: ${input.jobTitle} interview at ${input.companyName}`;
}

export function buildReminderHtml(input: InterviewReminderInput): string {
  const when = new Date(input.startTime).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const leadText = input.reminderType === "1_day" ? "tomorrow" : "in about 1 hour";

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
    <h2 style="margin-bottom: 4px;">Interview reminder</h2>
    <p style="color: #666; margin-top: 0;">Your interview is ${leadText}.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 0; color: #666; width: 120px;">Company</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(input.companyName)}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Role</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(input.jobTitle)}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">When</td><td style="padding: 6px 0; font-weight: 600;">${when}</td></tr>
      ${input.meetingLink ? `<tr><td style="padding: 6px 0; color: #666;">Meeting link</td><td style="padding: 6px 0;"><a href="${escapeHtml(input.meetingLink)}" style="color: #4f46e5;">${escapeHtml(input.meetingLink)}</a></td></tr>` : ""}
    </table>
    ${input.notes ? `<p style="color: #666; white-space: pre-wrap;"><strong>Notes:</strong><br/>${escapeHtml(input.notes)}</p>` : ""}
    <p style="color: #999; font-size: 12px; margin-top: 32px;">Sent by your Pathway job tracker. Manage reminders in Settings.</p>
  </div>`;
}

export async function sendInterviewReminderEmail(input: InterviewReminderInput) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resend || !from) {
    return { error: "Email sending is not configured (missing RESEND_API_KEY or RESEND_FROM_EMAIL)." };
  }
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: buildReminderSubject(input),
    html: buildReminderHtml(input),
  });
  return { error: error?.message ?? null };
}
