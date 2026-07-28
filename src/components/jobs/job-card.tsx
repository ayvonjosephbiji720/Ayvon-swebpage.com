"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { MapPin, Eye, Pencil, Copy, Trash2, ExternalLink } from "lucide-react";
import type { JobApplication } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";

export function JobCard({
  job,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  job: JobApplication;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="animate-fade-in-up transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{job.job_title}</p>
            <p className="truncate text-sm text-muted-foreground">{job.company_name}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {job.job_location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {job.job_location}
            </span>
          )}
          {job.job_type && <span>{job.job_type}</span>}
          <span>Applied {formatDate(job.date_applied)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onView} aria-label="View">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDuplicate} aria-label="Duplicate">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete" className="hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {job.application_link && (
            <a
              href={job.application_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Portal <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
