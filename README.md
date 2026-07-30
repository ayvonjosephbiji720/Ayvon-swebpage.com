# Pathway — Personal Career & Productivity Dashboard

A personal job application tracker, calendar, study planner, prayer planner,
and analytics dashboard — all in one place. Built with Next.js, TypeScript,
Tailwind CSS, and Supabase.

## Features

- **Dashboard** — key stats (applications, interviews, offers, rejections),
  a 14-day application trend chart, upcoming events, today's tasks, daily
  Bible verse, prayer streak, and study progress.
- **Job Application Tracker** — full CRUD with company, title, location,
  type, salary, portal, application link, auto-recorded date/time applied,
  a 10-stage status pipeline (Applied → Under Review → Assessment →
  Interview stages → Offer/Rejected/Withdrawn), recruiter contact info,
  resume/cover-letter version tracking, notes, and view/edit/duplicate/delete
  actions. Search, filter by status, and sort by company/title/status/date/location.
- **Calendar** — month/week/day/list views (FullCalendar) with drag-and-drop
  rescheduling, color-coded event types (Interview, Assessment, Exam,
  Meeting, Reminder, Personal), and per-event reminder lead time.
- **Study Planner** — log subject/topic/hours/completion, see hours-by-subject
  and weekly trend charts.
- **Prayer** — a rotating daily prayer topic with English + Malayalam verse
  text, explanation, and reflection prompt; personal prayer notes; a prayer
  streak counter; and configurable prayer-time reminders.
- **Smart To-Do List** — daily tasks with a one-click "suggest daily goals"
  seeder (apply to jobs, study, pray, exercise, follow up, etc.), progress bar.
- **Smart Daily Target** — every day, automatically picks 3 of 25 entry-level
  IT job categories (never repeating yesterday's picks) with a goal of 5
  applications each, 15/day total. Progress updates automatically from the
  job category you pick when adding an application. Includes daily/weekly/
  monthly history, current & longest streaks, and best-performing category.
- **Analytics** — applications per month, interview/assessment/offer/rejection
  rate, study hours per week, prayer streak, and a 7-day productivity trend.
- **Browser reminders** — notifications for upcoming calendar events (based
  on each event's reminder lead time) and daily prayer times, checked once a
  minute while the app is open.
- **Email reminders** *(optional)* — interview reminder emails 1 day and 1
  hour before, with company, role, date/time, meeting link, and notes. Sent
  via [Resend](https://resend.com) on a schedule (Vercel Cron), can be turned
  on/off per-user in Settings.
- **Daily Blessings** *(optional)* — on the Prayer page: the latest video
  from a YouTube channel (embedded player, title, date, description) plus
  the previous 10 as a thumbnail grid, refreshed automatically every ~30 min.
- **AI Assistant** *(optional)* — a chat UI for resume feedback, cover
  letters, interview prep, ATS review, and email drafting. Enabled by adding
  a `GROQ_API_KEY` (free tier available) or `OPENAI_API_KEY`; the page
  explains itself gracefully when neither key is set.
- **Auth & security** — Supabase Auth (email/password) with Postgres
  row-level security, so every table only ever exposes a signed-in user's own
  rows.
- **Light/dark mode**, responsive layout, and a persistent sidebar navigation.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, hand-rolled shadcn/ui-style components on Radix UI primitives |
| Database & Auth | Supabase (Postgres + Auth + Row Level Security + Realtime) |
| Calendar | FullCalendar (day/week/month/list, drag-and-drop) |
| Charts | Recharts |
| Notifications | Browser Notification API + email via Resend |
| Scheduling | Vercel Cron (calls a protected API route every 15 min) |
| AI Assistant | OpenAI-compatible Chat Completions API (Groq or OpenAI, bring your own key) |
| Video | YouTube Data API v3 |
| Deployment | Vercel |

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (the free tier is enough to start).
2. In your project, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates every
   table, enables Row Level Security, and adds policies so each user can only
   see their own data.
   - **Already ran `schema.sql` before?** Just run
     [`supabase/migrations/002_email_youtube_daily_target.sql`](./supabase/migrations/002_email_youtube_daily_target.sql)
     instead — it only adds the new tables/columns for email reminders and
     the Daily Target feature, without touching what's already there.
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
   (Optional: turn off "Confirm email" during local testing so you can sign
   in immediately after signing up.)
4. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public key** (and, if you want email reminders, the **service_role
   key** too — keep this one extra secret, it bypasses all data security
   rules).

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

At minimum, fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Everything else in `.env.local.example` is optional and gates one specific
feature — the app runs fine without them, that feature just shows a friendly
"not configured" message instead. See **Optional features setup** below for
each one.

> **Never commit `.env.local`, and never create/edit it through the GitHub
> website.** It should only ever exist on your own computer (or in your
> hosting provider's Environment Variables settings when deployed). If a real
> key ever ends up in a GitHub commit, treat it as compromised and rotate it
> at the provider immediately — deleting the file afterwards does not undo
> the exposure.

## 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account on the
sign-up page, and start tracking.

## Optional features setup

### AI Assistant

Pick one:
- **Groq** (has a free tier) — create a key at [console.groq.com](https://console.groq.com/keys), set `GROQ_API_KEY`.
- **OpenAI** (paid) — create a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys), set `OPENAI_API_KEY`.

Restart the dev server after adding either one.

### Email reminders (Resend + Vercel Cron)

1. Create a free account at [resend.com](https://resend.com), go to **API Keys**, create one, set `RESEND_API_KEY`.
2. Set `RESEND_FROM_EMAIL`. For quick testing without your own domain, use
   `onboarding@resend.dev` (Resend's shared test sender — works out of the
   box, but only Resend account holders can be the "from"). To send from your
   own address, verify a domain under **Domains** in Resend first.
3. Set `SUPABASE_SERVICE_ROLE_KEY` (from Supabase → Project Settings → API →
   `service_role` — see step 2 above).
4. Set `CRON_SECRET` to any random string you make up (e.g. run
   `openssl rand -hex 24` in a terminal, or just mash the keyboard).
5. Deploy to Vercel (see below) — `vercel.json` already defines a Cron Job
   that hits `/api/cron/send-reminders` every 15 minutes and authenticates
   itself using `CRON_SECRET` automatically.
   - **Vercel's free "Hobby" plan limits how often Cron Jobs can run** — if
     15-minute crons aren't available on your plan, either upgrade, widen the
     schedule in `vercel.json` (e.g. once a day), or use a free external
     scheduler like [cron-job.org](https://cron-job.org) to call
     `https://<your-app>/api/cron/send-reminders` with an
     `Authorization: Bearer <your CRON_SECRET>` header on whatever interval
     you like.
6. In the app, go to **Settings** and make sure "Send me interview email
   reminders" is on (it defaults to on). Reminders only fire for calendar
   events of type **Interview** — link one to a job application in the event
   form so the email includes the company name and role.

### Daily Blessings (YouTube)

1. Go to [console.cloud.google.com](https://console.cloud.google.com/), create
   a project (or use an existing one), enable **YouTube Data API v3** under
   "APIs & Services", then create an API key under **Credentials**.
2. Set `YOUTUBE_API_KEY`.
3. `YOUTUBE_CHANNEL_HANDLE` already defaults to `frmathewvayalamannil` — change
   it if you want a different channel.

## Data & persistence

Every record (jobs, events, tasks, study sessions, prayer notes/times) is
read from and written to your Supabase Postgres database through the
Supabase JS client, scoped to the signed-in user via Row Level Security. Data
persists across refreshes, devices, and days — there is no local-only state.
List views also subscribe to Supabase Realtime, so changes made in one
browser tab or device appear in others automatically.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add your environment variables in the Vercel project's **Settings →
   Environment Variables** — paste in the same values from your local
   `.env.local`. **Do this in Vercel's UI, never by committing a `.env` file
   to the repo.**
4. Deploy. Vercel will run `next build` automatically, and will pick up the
   Cron Job defined in `vercel.json` (hits `/api/cron/send-reminders` every
   15 minutes) once `CRON_SECRET` is set.

## Optional / future integrations

The spec this app was built from also asked for a few integrations that need
either a live third-party account/API key or a native mobile shell, which
aren't things a code generator can provision on your behalf:

- **Gmail / Outlook email detection** — auto-creating calendar events from
  interview/assessment/offer/rejection emails requires OAuth against your
  mailbox. The data model (`calendar_events.job_id`, `notes`) already
  supports linking an event back to a job application, so this can be added
  as a server route that polls the Gmail/Graph API and calls the same
  `calendar_events` insert path the UI uses.
- **LinkedIn / Indeed / Glassdoor / Naukri / Foundit / GitHub integrations,
  automatic job import, AI job matching** — each requires that platform's
  API credentials and terms-of-service review.
- **Mobile apps (iOS/Android)** — the schema and RLS policies are
  platform-agnostic, so a React Native or native client could reuse the same
  Supabase backend without any schema changes.
- **Resume version manager / cover letter library / mock interview
  recorder / voice AI assistant** — natural extensions of the existing
  `resume_version` / `cover_letter_version` fields and the AI Assistant chat,
  intentionally left out of this pass to keep the initial build focused.

## Project structure

```
src/
  app/                       # Next.js App Router pages (one route per feature)
    api/assistant/           # AI chat proxy (Groq/OpenAI)
    api/cron/send-reminders/ # Email reminder cron endpoint (protected by CRON_SECRET)
    api/youtube/videos/      # Daily Blessings video feed (keeps YOUTUBE_API_KEY server-only)
  components/
    ui/                # Reusable Radix-based primitives (button, dialog, select, ...)
    layout/            # Sidebar, topbar, app shell (auth-gated)
    dashboard/ jobs/ calendar/ study/ prayer/ todo/ analytics/ assistant/ daily-target/
  hooks/               # Data hooks — one per entity, each wrapping Supabase CRUD
  context/             # Auth context (Supabase session)
  content/             # Rotating daily prayer/verse content, IT job categories
  lib/supabase/        # Browser + service-role Supabase clients, generated-style TS types
  lib/email/           # Resend email template + sender
  lib/daily-target.ts  # Deterministic day-to-day category picker
supabase/schema.sql             # Full Postgres schema + RLS policies (fresh installs)
supabase/migrations/            # Incremental SQL for existing installs
vercel.json                     # Cron Job schedule for email reminders
```

## Notes on prayer content

The Malayalam Bible verse text in `src/content/prayer-content.ts` is
best-effort — cross-check against your preferred translation (e.g. the POC
Malayalam Bible) if exact wording matters to you, and feel free to edit or
extend the list with your own verses and reflections.
