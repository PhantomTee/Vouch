import Link from "next/link";
import type { GrantMilestone } from "@/types/grants";
import { MilestoneStatusBadge } from "@/components/MilestoneStatusBadge";

export function MilestoneCard({ milestone }: { milestone: GrantMilestone }) {
  return (
    <Link
      href={`/grants/${milestone.objectId}`}
      className="card-neo block min-w-0 overflow-hidden p-5 transition-transform hover:-translate-y-1"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <MilestoneStatusBadge status={milestone.status} />
        <span className="font-display text-2xl text-ink">{milestone.rewardSui}</span>
      </div>
      <h2 className="mt-3 line-clamp-2 font-display text-2xl text-ink">{milestone.title.toUpperCase()}</h2>
      {milestone.description && (
        <p className="mt-1 line-clamp-2 font-mono text-xs text-ink/60">{milestone.description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        {milestone.projectId && (
          <span className="font-mono text-xs text-ink/40 truncate">
            Project: {milestone.projectId.slice(0, 10)}…
          </span>
        )}
        <span className="font-mono text-xs text-ink/40 truncate">
          Builder: {milestone.builder.slice(0, 10)}…
        </span>
      </div>
    </Link>
  );
}
