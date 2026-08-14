import { Finding } from "@/lib/types";
import { FindingStatusBadge } from "@/components/status-badge";

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-medium text-slate-500">{finding.name}</h3>
      <p className="text-2xl font-semibold text-slate-900">
        {finding.value}{" "}
        <span className="text-base font-normal text-slate-400">
          {finding.unit}
        </span>
      </p>
      <p className="text-sm text-slate-500">
        Reference range: <span className="font-medium">{finding.referenceRange}</span>
      </p>
      <div>
        <FindingStatusBadge status={finding.status} />
      </div>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {finding.explanation}
      </p>
    </div>
  );
}
