"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MilestoneCard } from "@/components/MilestoneCard";
import { MilestoneStatusBadge } from "@/components/MilestoneStatusBadge";
import { queryMilestoneEvents, getObject } from "@/lib/tatum/rpc";
import { parseMilestoneFields } from "@/lib/grants/parseMilestone";
import { useNetwork } from "@/lib/networkContext";
import type { GrantMilestone, MilestoneStatus } from "@/types/grants";

const STATUS_FILTERS: { label: string; value: MilestoneStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Funded", value: "funded" },
  { label: "Submitted", value: "submitted" },
  { label: "Released", value: "released" },
];

type EventsResult = {
  data: Array<{
    id: { txDigest: string };
    parsedJson: { milestone_id: string; project_id: string; builder: string; title: string; reward_mist: string };
  }>;
};

export default function GrantsPage() {
  const [milestones, setMilestones] = useState<GrantMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MilestoneStatus | "all">("all");
  const { config, network } = useNetwork();

  useEffect(() => {
    if (!config.grantsPackageId) { setLoading(false); return; }
    setLoading(true);
    queryMilestoneEvents(config.grantsPackageId)
      .then(async (res) => {
        const events = (res as EventsResult).data ?? [];
        const milestoneIds = events.map((e) => e.parsedJson.milestone_id);
        const resolved = await Promise.all(
          milestoneIds.map(async (id) => {
            try {
              const obj = await getObject(id) as { data?: { content?: { fields?: Record<string, unknown> } } };
              const fields = obj.data?.content?.fields;
              if (!fields) return null;
              return parseMilestoneFields(id, fields);
            } catch { return null; }
          })
        );
        setMilestones(resolved.filter(Boolean) as GrantMilestone[]);
      })
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, [network, config.grantsPackageId]);

  const displayed = filter === "all" ? milestones : milestones.filter((m) => m.status === filter);

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Vouch Grants</span>
          <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl md:text-6xl">MILESTONE FUNDING.</h1>
          <p className="mt-3 max-w-2xl font-mono text-sm text-ink/60">
            Fund builders based on verified evidence. SUI is locked on-chain and released only when proof is submitted and approved.
          </p>
        </div>
        <Link href="/grants/create" className="btn-neo flex items-center gap-2 bg-ink px-5 py-3 text-sm text-white">
          Create milestone <ArrowRight size={14} />
        </Link>
      </div>

      {/* Status filter */}
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
          <div className="card-neo p-8 text-center">
            <p className="font-mono text-sm text-ink/60">Loading milestones via Tatum RPC…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="card-neo p-8 text-center">
            <p className="font-display text-3xl text-ink">NO MILESTONES YET.</p>
            <p className="mt-3 font-mono text-sm text-ink/60">Be the first to create a funded milestone for your build.</p>
            <Link href="/grants/create" className="btn-neo mt-6 inline-flex bg-ink px-6 py-3 text-sm text-white">
              Create milestone
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((m) => <MilestoneCard key={m.objectId} milestone={m} />)}
          </div>
        )}
      </div>
    </main>
  );
}
