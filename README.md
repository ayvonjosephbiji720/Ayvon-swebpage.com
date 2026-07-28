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
- **Analytics** — applications per month, interview/assessment/offer/rejection
  rate, study hours per week, prayer streak, and a 7-day productivity trend.
- **Reminders** — browser notifications for upcoming calendar events (based
  on each event's reminder lead time) and daily prayer times, checked once a
  minute while the app is open.
- **AI Assistant** *(optional)* — a chat UI for resume feedback, cover
  letters, interview prep, ATS review, and email drafting. Enabled by adding
  your own `OPENAI_API_KEY`; the page explains itself gracefully when the key
  is missing.
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
| Notifications | Browser Notification API |
| AI Assistant | OpenAI-compatible Chat Completions API (bring your own key) |
| Deployment | Vercel |

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (the free tier is enough to start).
2. In your project, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates every
   table (`jobs`, `calendar_events`, `tasks`, `study_sessions`, `prayer_notes`,
   `prayer_times`, `prayer_streaks`), enables Row Level Security, and adds
   policies so each user can only see their own data.
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
   (Optional: turn off "Confirm email" during local testing so you can sign
   in immediately after signing up.)
4. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public key**.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`OPENAI_API_KEY` is optional — only needed for the AI Assistant page.

## 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account on the
sign-up page, and start tracking.

## Data & persistence

Every record (jobs, events, tasks, study sessions, prayer notes/times) is
read from and written to your Supabase Postgres database through the
Supabase JS client, scoped to the signed-in user via Row Level Security. Data
persists across refreshes, devices, and days — there is no local-only state.
List views also subscribe to Supabase Realtime, so changes made in one
browser tab or device appear in others automatically.

## Deploying to Vercel

1. Push this repository to GitHub (already done if you're reading this on
   the `claude/job-tracker-dashboard-awe0ji` branch).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel
   project's **Settings → Environment Variables**.
4. Deploy. Vercel will run `next build` automatically.

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
  app/                # Next.js App Router pages (one route per feature)
  components/
    ui/                # Reusable Radix-based primitives (button, dialog, select, ...)
    layout/            # Sidebar, topbar, app shell (auth-gated)
    dashboard/ jobs/ calendar/ study/ prayer/ todo/ analytics/ assistant/
  hooks/               # Data hooks — one per entity, each wrapping Supabase CRUD
  context/             # Auth context (Supabase session)
  content/             # Rotating daily prayer/verse content pool
  lib/supabase/        # Supabase client + generated-style TS types
supabase/schema.sql    # Full Postgres schema + RLS policies (run this first)
```

## Notes on prayer content

The Malayalam Bible verse text in `src/content/prayer-content.ts` is
best-effort — cross-check against your preferred translation (e.g. the POC
Malayalam Bible) if exact wording matters to you, and feel free to edit or
extend the list with your own verses and reflections.
