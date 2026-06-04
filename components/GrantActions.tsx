"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import Link from "next/link";
import { useState } from "react";
import { FundMilestoneButton } from "@/components/FundMilestoneButton";
import { buildReleaseFundsTx, buildCancelAndRefundTx } from "@/lib/sui/grantTransactions";
import type { GrantMilestone } from "@/types/grants";

export function GrantActions({ milestone, onRefresh }: { milestone: GrantMilestone; onRefresh?: () => void }) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({ transactionBlock: bytes, signature, options: { showEffects: true } }),
  });
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [done, setDone] = useState("");

  if (!account?.address) {
    return (
      <div className="card-neo p-5 text-center">
        <p className="font-mono text-sm text-ink/60">Connect your wallet to take action on this milestone.</p>
      </div>
    );
  }

  const isBuilder = account.address.toLowerCase() === milestone.builder.toLowerCase();
  const isFunder = account.address.toLowerCase() === milestone.funder.toLowerCase();

  async function runTx(txFn: () => ReturnType<typeof buildReleaseFundsTx>, label: string) {
    setBusy(true); setErrMsg(""); setDone("");
    try {
      await signAndExecute({ transaction: txFn() }) as SuiTransactionBlockResponse;
      setDone(label);
      onRefresh?.();
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Transaction failed.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p className="font-mono text-sm font-bold text-brand-green">{done} Refresh to see updated status.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Open: anyone (not the builder) can fund */}
      {milestone.status === "open" && !isBuilder && (
        <FundMilestoneButton milestone={milestone} onFunded={onRefresh} />
      )}

      {/* Open: builder is waiting for funding */}
      {milestone.status === "open" && isBuilder && (
        <div className="card-neo bg-gold/20 p-4">
          <p className="font-mono text-sm text-ink/70">Your milestone is live and awaiting a funder. Share this page to attract funding.</p>
        </div>
      )}

      {/* Funded: builder submits proof */}
      {milestone.status === "funded" && isBuilder && (
        <Link href={`/grants/${milestone.objectId}/submit`} className="btn-neo block w-full bg-ink py-3 text-center text-sm text-white">
          Submit completion proof
        </Link>
      )}

      {/* Funded: funder waiting */}
      {milestone.status === "funded" && isFunder && (
        <div className="space-y-3">
          <div className="card-neo bg-[#87CEEB]/40 p-4">
            <p className="font-mono text-sm text-ink/70">Funds are locked on Sui. Waiting for the builder to submit proof.</p>
          </div>
          <button
            onClick={() => runTx(() => buildCancelAndRefundTx({ milestoneId: milestone.objectId }), "Refund processed.")}
            disabled={busy}
            className="btn-neo bg-white px-5 py-2.5 text-xs text-ink disabled:opacity-60"
          >
            {busy ? "Processing…" : "Cancel and reclaim funds"}
          </button>
        </div>
      )}

      {/* Submitted: funder releases */}
      {milestone.status === "submitted" && isFunder && (
        <div className="space-y-3">
          <div className="card-neo bg-gold/20 p-4">
            <p className="font-mono text-sm text-ink/70">Builder has submitted proof. Review the evidence below and release funds when satisfied.</p>
          </div>
          <button
            onClick={() => runTx(() => buildReleaseFundsTx({ milestoneId: milestone.objectId }), "Funds released to builder.")}
            disabled={busy}
            className="btn-neo bg-ink px-6 py-3 text-sm text-white disabled:opacity-60"
          >
            {busy ? "Releasing…" : `Release ${milestone.rewardSui} to builder`}
          </button>
        </div>
      )}

      {/* Submitted: builder waiting */}
      {milestone.status === "submitted" && isBuilder && (
        <div className="card-neo bg-gold/20 p-4">
          <p className="font-mono text-sm text-ink/70">Proof submitted. Waiting for the funder to review and release funds.</p>
        </div>
      )}

      {errMsg && <p className="font-mono text-xs text-coral">{errMsg}</p>}
    </div>
  );
}
