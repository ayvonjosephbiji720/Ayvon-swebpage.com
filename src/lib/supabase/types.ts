export type JobStatus =
  | "Applied"
  | "Under Review"
  | "Assessment"
  | "Interview"
  | "HR Interview"
  | "Technical Interview"
  | "Final Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export const JOB_STATUSES: JobStatus[] = [
  "Applied",
  "Under Review",
  "Assessment",
  "Interview",
  "HR Interview",
  "Technical Interview",
  "Final Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote" | "Hybrid" | "On-site";

export const JOB_TYPES: JobType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
  "Hybrid",
  "On-site",
];

export type JobApplication = {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_location: string | null;
  job_type: JobType | null;
  salary: string | null;
  website: string | null;
  application_link: string | null;
  date_applied: string;
  status: JobStatus;
  contact_person: string | null;
  recruiter_email: string | null;
  recruiter_phone: string | null;
  notes: string | null;
  resume_version: string | null;
  cover_letter_version: string | null;
  created_at: string;
  updated_at: string;
}

export type CalendarEventType =
  | "Interview"
  | "Assessment"
  | "Exam"
  | "Meeting"
  | "Reminder"
  | "Personal";

export const CALENDAR_EVENT_TYPES: CalendarEventType[] = [
  "Interview",
  "Assessment",
  "Exam",
  "Meeting",
  "Reminder",
  "Personal",
];

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  Interview: "#6d5cf5",
  Assessment: "#f5a623",
  Exam: "#e5484d",
  Meeting: "#12a594",
  Reminder: "#5b9edb",
  Personal: "#d6409f",
};

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  type: CalendarEventType;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  location: string | null;
  notes: string | null;
  job_id: string | null;
  reminder_minutes_before: number | null;
  created_at: string;
}

export type Task = {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  due_date: string | null;
  completed: boolean;
  is_auto_suggested: boolean;
  created_at: string;
}

export type StudySession = {
  id: string;
  user_id: string;
  subject: string;
  topic: string | null;
  hours: number;
  completed: boolean;
  session_date: string;
  created_at: string;
}

export type PrayerNote = {
  id: string;
  user_id: string;
  note_date: string;
  content: string;
  created_at: string;
}

export type PrayerTime = {
  id: string;
  user_id: string;
  label: string;
  time_of_day: string;
  enabled: boolean;
}

export type PrayerStreak = {
  id: string;
  user_id: string;
  prayed_date: string;
};

type TableDef<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      jobs: TableDef<JobApplication>;
      calendar_events: TableDef<CalendarEvent>;
      tasks: TableDef<Task>;
      study_sessions: TableDef<StudySession>;
      prayer_notes: TableDef<PrayerNote>;
      prayer_times: TableDef<PrayerTime>;
      prayer_streaks: TableDef<PrayerStreak>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
