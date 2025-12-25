import React from "react";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  new_request: { label: "New Request", color: "bg-blue-100 text-blue-700 border-blue-200" },
  work_started: { label: "Work Started", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200" },
  waiting_for_parts: { label: "Waiting for Parts", color: "bg-orange-100 text-orange-700 border-orange-200" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  on_hold: { label: "On Hold", color: "bg-slate-100 text-slate-700 border-slate-200" },
  cancelled: { label: "Cancelled", color: "bg-rose-100 text-rose-700 border-rose-200" },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-slate-100 text-slate-600 border-slate-200" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-600 border-blue-200" },
  high: { label: "High", color: "bg-orange-100 text-orange-600 border-orange-200" },
  urgent: { label: "Urgent", color: "bg-rose-100 text-rose-600 border-rose-200" },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: "bg-slate-100 text-slate-700" };
  return (
    <Badge variant="outline" className={`${config.color} font-medium`}>
      {config.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { label: priority, color: "bg-slate-100 text-slate-600" };
  return (
    <Badge variant="outline" className={`${config.color} font-medium text-xs`}>
      {config.label}
    </Badge>
  );
}

export function CustomerStatusBadge({ status }) {
  const config = status === "active" 
    ? { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
    : { label: "Inactive", color: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <Badge variant="outline" className={`${config.color} font-medium`}>
      {config.label}
    </Badge>
  );
}