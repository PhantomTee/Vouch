import type { MilestoneStatus } from "@/types/grants";

const STYLES: Record<MilestoneStatus, string> = {
  open: "bg-white text-ink",
  funded: "bg-[#87CEEB] text-ink",
  submitted: "bg-gold/60 text-ink",
  released: "bg-brand-green/30 text-ink",
  cancelled: "bg-coral/20 text-ink",
};

const LABELS: Record<MilestoneStatus, string> = {
  open: "Open",
  funded: "Funded",
  submitted: "Proof Submitted",
  released: "Released",
  cancelled: "Cancelled",
};

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  return (
    <span className={`btn-neo px-3 py-1 text-xs ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
