import { cn } from "@/lib/utils";
import { FindingStatus, OverallStatus } from "@/lib/types";

const FINDING_STYLES: Record<
  FindingStatus,
  { label: string; dot: string; className: string }
> = {
  normal: {
    label: "Within reference range",
    dot: "🟢",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  low: {
    label: "Below reference range",
    dot: "🔴",
    className: "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
  high: {
    label: "Above reference range",
    dot: "🔴",
    className: "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
  attention: {
    label: "Requires attention",
    dot: "🟠",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
};

export function FindingStatusBadge({ status }: { status: FindingStatus }) {
  const s = FINDING_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        s.className
      )}
    >
      <span>{s.dot}</span>
      {s.label}
    </span>
  );
}

const OVERALL_STYLES: Record<OverallStatus, string> = {
  Normal: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Needs Review": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Attention Required": "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export function OverallStatusBadge({ status }: { status: OverallStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
        OVERALL_STYLES[status]
      )}
    >
      Overall: {status}
    </span>
  );
}

const TABLE_LABEL: Record<FindingStatus, string> = {
  normal: "Normal",
  low: "Low",
  high: "High",
  attention: "Attention",
};

export function TableStatusBadge({ status }: { status: FindingStatus }) {
  const s = FINDING_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        s.className
      )}
    >
      {TABLE_LABEL[status]}
    </span>
  );
}
