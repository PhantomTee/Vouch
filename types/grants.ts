import type { EvidenceManifestItem } from "@/types/vouch";

export type MilestoneStatus = "open" | "funded" | "submitted" | "released" | "cancelled";

export const MILESTONE_STATUS_MAP: Record<number, MilestoneStatus> = {
  0: "open",
  1: "funded",
  2: "submitted",
  3: "released",
  4: "cancelled",
};

export type GrantMilestone = {
  objectId: string;
  projectId: string;
  builder: string;
  funder: string;
  title: string;
  description: string;
  rewardMist: string;
  rewardSui: string;
  status: MilestoneStatus;
  proofBlobId: string;
  proofHash: string;
  createdAtMs: string;
  fundedAtMs: string;
  submittedAtMs: string;
  releasedAtMs: string;
};

export type MilestoneCompletionManifest = {
  schema: "vouch.grant.milestone.v1";
  milestoneId: string;
  projectId: string;
  title: string;
  completionNote: string;
  evidence: EvidenceManifestItem[];
  submittedAt: string;
  builderWallet: string;
};

export type CreateMilestoneInput = {
  projectId: string;
  title: string;
  description: string;
  rewardSui: string;
};

export function formatSui(mist: string | number): string {
  const n = typeof mist === "string" ? BigInt(mist) : BigInt(mist);
  const whole = n / 1_000_000_000n;
  const frac = n % 1_000_000_000n;
  if (frac === 0n) return `${whole} SUI`;
  return `${whole}.${frac.toString().padStart(9, "0").replace(/0+$/, "")} SUI`;
}

export function suiToMist(sui: string): bigint {
  const [whole = "0", frac = "0"] = sui.split(".");
  const fracPadded = frac.padEnd(9, "0").slice(0, 9);
  return BigInt(whole) * 1_000_000_000n + BigInt(fracPadded);
}
