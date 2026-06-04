"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MilestoneSubmitForm } from "@/components/MilestoneSubmitForm";
import { getObject } from "@/lib/tatum/rpc";
import { parseMilestoneFields } from "@/lib/grants/parseMilestone";
import type { GrantMilestone } from "@/types/grants";

export default function SubmitProofPage({ params }: { params: { milestoneId: string } }) {
  const { milestoneId } = params;
  const [milestone, setMilestone] = useState<GrantMilestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    getObject(milestoneId)
      .then((res) => {
        const obj = res as { data?: { content?: { fields?: Record<string, unknown> } } };
        const fields = obj.data?.content?.fields;
        if (!fields) throw new Error("Object not found or not a Milestone.");
        setMilestone(parseMilestoneFields(milestoneId, fields));
      })
      .catch((e) => setErrMsg(e instanceof Error ? e.message : "Failed to load milestone."))
      .finally(() => setLoading(false));
  }, [milestoneId]);

  return (
    <main className="mx-auto max-w-5xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <Link href={`/grants/${milestoneId}`} className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-ink/60 hover:text-ink">
        <ArrowLeft size={12} /> Back to milestone
      </Link>

      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Submit Proof</span>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">SUBMIT COMPLETION PROOF.</h1>
      <p className="mt-3 font-mono text-sm text-ink/60">
        Upload evidence to Walrus and anchor the proof hash on Sui. The funder reviews and releases funds when satisfied.
      </p>

      <div className="mt-8">
        {loading ? (
          <div className="card-neo p-8 text-center">
            <p className="font-mono text-sm text-ink/60">Loading milestone via Tatum RPC…</p>
          </div>
        ) : errMsg || !milestone ? (
          <div className="card-neo p-6">
            <p className="font-display text-2xl text-ink">MILESTONE NOT FOUND.</p>
            <p className="mt-2 font-mono text-sm text-ink/60">{errMsg}</p>
          </div>
        ) : milestone.status !== "funded" ? (
          <div className="card-neo p-6">
            <p className="font-display text-2xl text-ink">NOT AVAILABLE.</p>
            <p className="mt-2 font-mono text-sm text-ink/60">
              Proof can only be submitted once a milestone is funded. Current status: <strong>{milestone.status}</strong>.
            </p>
            <Link href={`/grants/${milestoneId}`} className="btn-neo mt-4 inline-block bg-ink px-5 py-2.5 text-sm text-white">
              View milestone
            </Link>
          </div>
        ) : (
          <MilestoneSubmitForm milestone={milestone} />
        )}
      </div>
    </main>
  );
}
