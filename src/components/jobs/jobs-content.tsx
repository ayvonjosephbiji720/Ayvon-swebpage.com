"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJobs, type JobInput } from "@/hooks/useJobs";
import { JOB_STATUSES, type JobApplication } from "@/lib/supabase/types";
import { JobCard } from "./job-card";
import { JobFormDialog } from "./job-form-dialog";
import { JobDetailDialog } from "./job-detail-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type SortKey = "date_desc" | "date_asc" | "company" | "title" | "status" | "location";

export function JobsContent() {
  const { jobs, loading, createJob, updateJob, deleteJob, duplicateJob } = useJobs();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("date_desc");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<JobApplication | null>(null);
  const [viewingJob, setViewingJob] = React.useState<JobApplication | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<JobApplication | null>(null);

  const filtered = React.useMemo(() => {
    let result = jobs;
    if (statusFilter !== "all") result = result.filter((j) => j.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.company_name.toLowerCase().includes(q) ||
          j.job_title.toLowerCase().includes(q) ||
          (j.job_location ?? "").toLowerCase().includes(q)
      );
    }
    const sorted = [...result];
    switch (sortKey) {
      case "date_asc":
        sorted.sort((a, b) => new Date(a.date_applied).getTime() - new Date(b.date_applied).getTime());
        break;
      case "company":
        sorted.sort((a, b) => a.company_name.localeCompare(b.company_name));
        break;
      case "title":
        sorted.sort((a, b) => a.job_title.localeCompare(b.job_title));
        break;
      case "status":
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "location":
        sorted.sort((a, b) => (a.job_location ?? "").localeCompare(b.job_location ?? ""));
        break;
      default:
        sorted.sort((a, b) => new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime());
    }
    return sorted;
  }, [jobs, search, statusFilter, sortKey]);

  const handleSubmit = async (input: JobInput) => {
    if (editingJob) return updateJob(editingJob.id, input);
    return createJob(input);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company, title, location…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {JOB_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest first</SelectItem>
              <SelectItem value="date_asc">Oldest first</SelectItem>
              <SelectItem value="company">Company (A-Z)</SelectItem>
              <SelectItem value="title">Job title (A-Z)</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setEditingJob(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {loading ? "Loading…" : `${filtered.length} of ${jobs.length} application${jobs.length === 1 ? "" : "s"}`}
      </p>

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No applications match your filters yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onView={() => {
              setViewingJob(job);
              setDetailOpen(true);
            }}
            onEdit={() => {
              setEditingJob(job);
              setFormOpen(true);
            }}
            onDuplicate={() => duplicateJob(job)}
            onDelete={() => setDeleteTarget(job)}
          />
        ))}
      </div>

      <JobFormDialog open={formOpen} onOpenChange={setFormOpen} job={editingJob} onSubmit={handleSubmit} />
      <JobDetailDialog open={detailOpen} onOpenChange={setDetailOpen} job={viewingJob} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this application?"
        description={deleteTarget ? `${deleteTarget.job_title} at ${deleteTarget.company_name} will be permanently removed.` : ""}
        onConfirm={async () => {
          if (deleteTarget) await deleteJob(deleteTarget.id);
        }}
      />
    </div>
  );
}
