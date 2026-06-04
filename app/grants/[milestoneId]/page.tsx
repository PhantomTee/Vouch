"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { MilestoneStatusBadge } from "@/components/MilestoneStatusBadge";
import { GrantActions } from "@/components/GrantActions";
import { SuiAddress } from "@/components/SuiAddress";
import { getObject } from "@/lib/tatum/rpc";
import { parseMilestoneFields } from "@/lib/grants/parseMilestone";
import { useNetwork } from "@/lib/networkContext";
import type { GrantMilestone } from "@/types/grants";

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card-neo min-w-0 p-3 sm:p-4">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">{label}</p>
      <div className="mt-2 break-all font-mono text-xs text-ink sm:text-sm">{children}</div>
    </div>
  );
}

export default function MilestonePage({ params }: { params: { milestoneId: string } }) {
  const { milestoneId } = params;
  const [milestone, setMilestone] = useState<GrantMilestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const { config } = useNetwork();

  async function load() {
    setLoading(true);
    try {
      const res = await getObject(milestoneId) as { data?: { content?: { fields?: Record<string, unknown> } } };
      const fields = res.data?.content?.fields;
      if (!fields) throw new Error("Object not found or not a Milestone.");
      setMilestone(parseMilestoneFields(milestoneId, fields));
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Failed to load milestone.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [milestoneId]);

  if (loading) return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-sm text-ink/60">Loading milestone via Tatum RPC…</p>
    </main>
  );

  if (errMsg || !milestone) return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="card-neo p-6">
        <p className="font-display text-2xl text-ink">MILESTONE NOT FOUND.</p>
        <p className="mt-2 font-mono text-sm text-ink/60">{errMsg}</p>
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-4xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <MilestoneStatusBadge status={milestone.status} />
            <span className="font-display text-2xl text-ink">{milestone.rewardSui}</span>
          </div>

          <h1 className="font-display text-3xl text-ink sm:text-4xl">{milestone.title.toUpperCase()}</h1>
          {milestone.description && (
            <p className="mt-3 font-mono text-sm leading-relaxed text-ink/70">{milestone.description}</p>
          )}

          {/* Metadata grid */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <InfoCard label="Builder"><SuiAddress address={milestone.builder} /></InfoCard>
            <InfoCard label="Funder">
              {milestone.funder && milestone.funder !== "0x0000000000000000000000000000000000000000000000000000000000000000"
                ? <SuiAddress address={milestone.funder} />
                : "Awaiting funder"}
            </InfoCard>
            <InfoCard label="Milestone ID">{milestoneId}</InfoCard>
            {milestone.projectId && (
              <InfoCard label="Vouch project">
                <Link href={`/vouch/${milestone.projectId}`} className="text-brand-blue hover:underline">
                  {milestone.projectId.slice(0, 16)}…
                </Link>
              </InfoCard>
            )}
            {milestone.createdAtMs && <InfoCard label="Created">{new Date(milestone.createdAtMs).toLocaleString()}</InfoCard>}
            {milestone.fundedAtMs && <InfoCard label="Funded">{new Date(milestone.fundedAtMs).toLocaleString()}</InfoCard>}
            {milestone.submittedAtMs && <InfoCard label="Proof submitted">{new Date(milestone.submittedAtMs).toLocaleString()}</InfoCard>}
            {milestone.releasedAtMs && <InfoCard label="Funds released">{new Date(milestone.releasedAtMs).toLocaleString()}</InfoCard>}
          </div>

          {/* Completion proof (if submitted) */}
          {(milestone.status === "submitted" || milestone.status === "released") && milestone.proofBlobId && (
            <div className="mt-6 card-neo p-5">
              <h2 className="mb-3 font-display text-xl text-ink">COMPLETION PROOF</h2>
              <div className="space-y-2">
                <InfoCard label="Proof manifest (Walrus blob)">{milestone.proofBlobId}</InfoCard>
                <InfoCard label="Proof manifest hash">{milestone.proofHash}</InfoCard>
              </div>
            </div>
          )}

          {/* SuiScan link */}
          <div className="mt-6">
            <a
              href={`${config.suiscanBase}/object/${milestoneId}`}
              target="_blank" rel="noreferrer"
              className="btn-neo inline-flex items-center gap-1.5 bg-white px-3 py-2 text-xs text-ink"
            >
              View on SuiScan <ExternalLink size={12} />
            </a>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="card-neo p-5">
            <h2 className="mb-4 font-display text-xl text-ink">ACTIONS</h2>
            <GrantActions milestone={milestone} onRefresh={load} />
          </div>
        </aside>
      </div>
    </main>
  );
}
