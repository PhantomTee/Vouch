import type { GrantMilestone, MilestoneStatus } from "@/types/grants";
import { MILESTONE_STATUS_MAP, formatSui } from "@/types/grants";

type RawFields = Record<string, unknown>;

function str(fields: RawFields, key: string): string {
  const v = fields[key];
  return typeof v === "string" ? v : "";
}

function msToIso(ms: unknown): string {
  if (!ms || ms === "0") return "";
  return new Date(Number(ms)).toISOString();
}

export function parseMilestoneFields(objectId: string, fields: RawFields): GrantMilestone {
  const statusNum = Number(fields.status ?? 0);
  const status: MilestoneStatus = MILESTONE_STATUS_MAP[statusNum] ?? "open";
  const rewardMist = str(fields, "reward_mist");
  return {
    objectId,
    projectId: str(fields, "project_id"),
    builder: str(fields, "builder"),
    funder: str(fields, "funder"),
    title: str(fields, "title"),
    description: str(fields, "description"),
    rewardMist,
    rewardSui: rewardMist ? formatSui(rewardMist) : "0 SUI",
    status,
    proofBlobId: str(fields, "proof_blob_id"),
    proofHash: str(fields, "proof_hash"),
    createdAtMs: msToIso(fields.created_at_ms),
    fundedAtMs: msToIso(fields.funded_at_ms),
    submittedAtMs: msToIso(fields.submitted_at_ms),
    releasedAtMs: msToIso(fields.released_at_ms),
  };
}
