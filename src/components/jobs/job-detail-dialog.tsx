"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "./status-badge";
import type { JobApplication } from "@/lib/supabase/types";
import { formatDate, formatTime } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function JobDetailDialog({
  open,
  onOpenChange,
  job,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobApplication | null;
}) {
  if (!job) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{job.job_title}</DialogTitle>
            <StatusBadge status={job.status} />
          </div>
          <DialogDescription>{job.company_name}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Location" value={job.job_location} />
          <Field label="Job type" value={job.job_type} />
          <Field label="IT job category" value={job.job_category} />
          <Field label="Salary" value={job.salary} />
          <Field label="Website / Portal" value={job.website} />
          <Field label="Date applied" value={`${formatDate(job.date_applied)} · ${formatTime(job.date_applied)}`} />
          <Field label="Contact person" value={job.contact_person} />
          <Field label="Recruiter email" value={job.recruiter_email} />
          <Field label="Recruiter phone" value={job.recruiter_phone} />
          <Field label="Resume version" value={job.resume_version} />
          <Field label="Cover letter version" value={job.cover_letter_version} />
        </div>
        {job.notes && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="whitespace-pre-wrap text-sm">{job.notes}</p>
          </div>
        )}
        {job.application_link && (
          <a
            href={job.application_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            View application <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}
