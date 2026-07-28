import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/lib/supabase/types";

const STATUS_VARIANT: Record<JobStatus, "default" | "secondary" | "destructive" | "success" | "warning" | "outline"> = {
  Applied: "secondary",
  "Under Review": "warning",
  Assessment: "warning",
  Interview: "default",
  "HR Interview": "default",
  "Technical Interview": "default",
  "Final Interview": "default",
  Offer: "success",
  Rejected: "destructive",
  Withdrawn: "outline",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
