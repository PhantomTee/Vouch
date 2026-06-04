"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { useState } from "react";
import { buildFundMilestoneTx } from "@/lib/sui/grantTransactions";
import type { GrantMilestone } from "@/types/grants";

export function FundMilestoneButton({
  milestone,
  onFunded,
}: {
  milestone: GrantMilestone;
  onFunded?: () => void;
}) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showObjectChanges: true },
      }),
  });
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  if (!account?.address) return null;
  if (account.address.toLowerCase() === milestone.builder.toLowerCase()) return null;

  async function fund() {
    setStatus("busy");
    setErrMsg("");
    try {
      const tx = buildFundMilestoneTx({
        milestoneId: milestone.objectId,
        rewardMist: BigInt(milestone.rewardMist),
      });
      await signAndExecute({ transaction: tx }) as SuiTransactionBlockResponse;
      setStatus("done");
      onFunded?.();
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Transaction failed.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="font-mono text-sm font-bold text-brand-green">Funded! Refresh to see updated status.</p>;
  }

  return (
    <div className="space-y-2">
      <button
        onClick={fund}
        disabled={status === "busy"}
        className="btn-neo bg-ink px-6 py-3 text-sm text-white disabled:opacity-60"
      >
        {status === "busy" ? "Funding…" : `Fund milestone — ${milestone.rewardSui}`}
      </button>
      {errMsg && <p className="font-mono text-xs text-coral">{errMsg}</p>}
    </div>
  );
}
