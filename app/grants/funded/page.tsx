"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ArrowRight, Coins } from "lucide-react";
import { MilestoneCard } from "@/components/MilestoneCard";
import { MilestoneSkeleton } from "@/components/ProofSkeleton";
import { queryFundedMilestoneEvents, getObject } from "@/lib/tatum/rpc";
import { parseMilestoneFields } from "@/lib/grants/parseMilestone";
import { useNetwork } from "@/lib/networkContext";
import type { GrantMilestone, MilestoneStatus } from "@/types/grants";

type FundedEvent = {
  parsedJson: { milestone_id: string; funder: string; reward_mist: string; funded_at_ms: string };
};

const STATUS_FILTERS: { label: string; value: MilestoneStatus | "all" }[] = [
  { label: "All funded", value: "all" },
  { label: "Awaiting proof", value: "funded" },
  { label: "Proof submitted", value: "submitted" },
  { label: "Released", value: "released" },
  { label: "Cancelled", value: "cancelled" },
];

export default function FunderDashboardPage() {
  const account = useCurrentAccount();
  const { config, network } = useNetwork();
  const [milestones, setMilestones] = useState<GrantMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<MilestoneStatus | "all">("all");
  const [totalEscrowed, setTotalEscrowed] = useState(0n);

  useEffect(() => {
    if (!account?.address || !config.grantsPackageId) return;
    setLoading(true);
    queryFundedMilestoneEvents(config.grantsPackageId)
      .then(async (res) => {
        const events = ((res as { data?: FundedEvent[] }).data ?? []) as FundedEvent[];
        const myEvents = events.filter(
          (e) => e.parsedJson.funder?.toLowerCase() === account.address!.toLowerCase()
        );
        const resolved = await Promise.all(
          myEvents.map(async (e) => {
            try {
              const obj = await getObject(e.parsedJson.milestone_id) as { data?: { content?: { fields?: Record<string, unknown> } } };
              const fields = obj.data?.content?.fields;
              if (!fields) return null;
              return parseMilestoneFields(e.parsedJson.milestone_id, fields);
            } catch { return null; }
          })
        );
        const valid = resolved.filter(Boolean) as GrantMilestone[];
        setMilestones(valid);
        const escrowed = valid
          .filter((m) => m.status === "funded" || m.status === "submitted")
          .reduce((sum, m) => sum + BigInt(m.rewardMist || "0"), 0n);
        setTotalEscrowed(escrowed);
      })
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, [account?.address, network, config.grantsPackageId]);

  const displayed = filter === "all" ? milestones : milestones.filter((m) => m.status === filter);

  const formatSui = (mist: bigint) => {
    const whole = mist / 1_000_000_000n;
    const frac = mist % 1_000_000_000n;
    if (frac === 0n) return `${whole} SUI`;
    return `${whole}.${frac.toString().padStart(9, "0").replace(/0+$/, "")} SUI`;
  };

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Funder Dashboard</span>
          <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl md:text-6xl">YOUR FUNDED MILESTONES.</h1>
          <p className="mt-3 max-w-2xl font-mono text-sm text-ink/60">
            Track every milestone you have funded. Review submitted proofs, release funds, or cancel unfunded milestones.
          </p>
        </div>
        <Link href="/grants" className="btn-neo flex items-center gap-2 bg-white px-5 py-3 text-sm text-ink">
          All milestones <ArrowRight size={14} />
        </Link>
      </div>

      {!account?.address ? (
        <div className="card-neo mt-10 p-10 text-center">
          <Coins size={32} className="mx-auto mb-4 text-ink/30" />
          <p className="font-display text-3xl text-ink">CONNECT YOUR WALLET.</p>
          <p className="mt-3 font-mono text-sm text-ink/60">Connect to see milestones you have funded.</p>
        </div>
      ) : (
        <>
          {/* Stats strip */}
          {milestones.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Total funded", value: milestones.length },
                { label: "In escrow", value: formatSui(totalEscrowed) },
                { label: "Awaiting proof", value: milestones.filter((m) => m.status === "funded").length },
                { label: "Released", value: milestones.filter((m) => m.status === "released").length },
              ].map((stat) => (
                <div key={stat.label} className="card-neo p-4 text-center">
                  <p className="font-display text-2xl text-ink sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 font-mono text-xs text-ink/50 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter */}
          <div className="mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 pb-2 w-max sm:w-auto sm:flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`btn-neo shrink-0 px-3 py-1.5 text-xs ${filter === f.value ? "bg-ink text-white" : "bg-white text-ink"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <MilestoneSkeleton key={i} />)}
              </div>
            ) : displayed.length === 0 ? (
              <div className="card-neo p-10 text-center">
                <p className="font-display text-3xl text-ink">
                  {milestones.length === 0 ? "NO FUNDED MILESTONES YET." : "NONE IN THIS STATUS."}
                </p>
                {milestones.length === 0 && (
                  <>
                    <p className="mt-3 font-mono text-sm text-ink/60">
                      Browse open milestones and fund a builder you believe in.
                    </p>
                    <Link href="/grants" className="btn-neo mt-6 inline-flex bg-ink px-6 py-3 text-sm text-white">
                      Browse milestones
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayed.map((m) => (
                  <MilestoneCard key={m.objectId} milestone={m} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
