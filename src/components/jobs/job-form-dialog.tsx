"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_STATUSES, JOB_TYPES, type JobApplication, type JobStatus, type JobType } from "@/lib/supabase/types";
import type { JobInput } from "@/hooks/useJobs";
import { Loader2 } from "lucide-react";

const EMPTY_FORM = {
  company_name: "",
  job_title: "",
  job_location: "",
  job_type: "" as JobType | "",
  salary: "",
  website: "",
  application_link: "",
  status: "Applied" as JobStatus,
  contact_person: "",
  recruiter_email: "",
  recruiter_phone: "",
  notes: "",
  resume_version: "",
  cover_letter_version: "",
};

export function JobFormDialog({
  open,
  onOpenChange,
  job,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobApplication | null;
  onSubmit: (input: JobInput) => Promise<{ error: string | null }>;
}) {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(
        job
          ? {
              company_name: job.company_name,
              job_title: job.job_title,
              job_location: job.job_location ?? "",
              job_type: (job.job_type as JobType) ?? "",
              salary: job.salary ?? "",
              website: job.website ?? "",
              application_link: job.application_link ?? "",
              status: job.status,
              contact_person: job.contact_person ?? "",
              recruiter_email: job.recruiter_email ?? "",
              recruiter_phone: job.recruiter_phone ?? "",
              notes: job.notes ?? "",
              resume_version: job.resume_version ?? "",
              cover_letter_version: job.cover_letter_version ?? "",
            }
          : EMPTY_FORM
      );
    }
  }, [open, job]);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await onSubmit({
      ...form,
      job_type: form.job_type || null,
      job_location: form.job_location || null,
      salary: form.salary || null,
      website: form.website || null,
      application_link: form.application_link || null,
      contact_person: form.contact_person || null,
      recruiter_email: form.recruiter_email || null,
      recruiter_phone: form.recruiter_phone || null,
      notes: form.notes || null,
      resume_version: form.resume_version || null,
      cover_letter_version: form.cover_letter_version || null,
    });
    setSubmitting(false);
    if (!error) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{job ? "Edit application" : "Add job application"}</DialogTitle>
          <DialogDescription>
            {job ? "Update the details of this application." : "Track a new job application. Date and time applied are recorded automatically."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company name *</Label>
            <Input id="company_name" required value={form.company_name} onChange={update("company_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job_title">Job title *</Label>
            <Input id="job_title" required value={form.job_title} onChange={update("job_title")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job_location">Location</Label>
            <Input id="job_location" value={form.job_location} onChange={update("job_location")} placeholder="City, remote…" />
          </div>
          <div className="space-y-1.5">
            <Label>Job type</Label>
            <Select value={form.job_type} onValueChange={(v) => setForm((f) => ({ ...f, job_type: v as JobType }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="salary">Salary (optional)</Label>
            <Input id="salary" value={form.salary} onChange={update("salary")} placeholder="$80,000 - $100,000" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as JobStatus }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website / portal</Label>
            <Input id="website" value={form.website} onChange={update("website")} placeholder="LinkedIn, Indeed…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="application_link">Application link</Label>
            <Input id="application_link" type="url" value={form.application_link} onChange={update("application_link")} placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_person">Contact person</Label>
            <Input id="contact_person" value={form.contact_person} onChange={update("contact_person")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recruiter_email">Recruiter email</Label>
            <Input id="recruiter_email" type="email" value={form.recruiter_email} onChange={update("recruiter_email")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recruiter_phone">Recruiter phone</Label>
            <Input id="recruiter_phone" value={form.recruiter_phone} onChange={update("recruiter_phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resume_version">Resume version used</Label>
            <Input id="resume_version" value={form.resume_version} onChange={update("resume_version")} placeholder="e.g. Resume_v3_SOC.pdf" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cover_letter_version">Cover letter version used</Label>
            <Input id="cover_letter_version" value={form.cover_letter_version} onChange={update("cover_letter_version")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={form.notes} onChange={update("notes")} placeholder="Interview prep notes, referral info, follow-ups…" />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {job ? "Save changes" : "Add application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
