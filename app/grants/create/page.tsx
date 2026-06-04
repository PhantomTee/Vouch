"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { buildCreateMilestoneTx } from "@/lib/sui/grantTransactions";
import { suiToMist } from "@/types/grants";
import type { StoredProof } from "@/types/vouch";
import type { CreateMilestoneInput } from "@/types/grants";

const inputClass = "w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-brand-blue";

function getCreatedMilestoneId(result: SuiTransactionBlockResponse): string {
  const created = result.objectChanges?.find(
    (c) => c.type === "created" && "objectType" in c && c.objectType.includes("::grants::Milestone"),
  );
  if (created && "objectId" in created) return created.objectId;
  throw new Error("Transaction succeeded but milestone object ID not found in response.");
}

export default function CreateMilestonePage() {
  const account = useCurrentAccount();
  const { data: session } = useSession();
  const suiClient = useSuiClient();
  const router = useRouter();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showObjectChanges: true },
      }),
  });

  const [proofs, setProofs] = useState<StoredProof[]>([]);
  const [input, setInput] = useState<CreateMilestoneInput>({ projectId: "", title: "", description: "", rewardSui: "" });
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem("vouch.proofs") || "[]") as StoredProof[];
    if (account?.address) {
      setProofs(cached.filter((p) => p.owner.toLowerCase() === account.address!.toLowerCase()));
    }
  }, [account?.address]);

  async function submit() {
    if (!account?.address) { setErrMsg("Connect your Sui wallet."); setStatus("error"); return; }
    if (!input.projectId) { setErrMsg("Select a project to attach this milestone to."); setStatus("error"); return; }
    if (!input.title.trim()) { setErrMsg("Milestone title is required."); setStatus("error"); return; }
    if (!input.rewardSui || isNaN(Number(input.rewardSui)) || Number(input.rewardSui) <= 0) {
      setErrMsg("Enter a valid SUI reward amount."); setStatus("error"); return;
    }
    setStatus("busy"); setErrMsg("");
    try {
      const rewardMist = suiToMist(input.rewardSui);
      const tx = buildCreateMilestoneTx({ projectId: input.projectId, title: input.title, description: input.description, rewardMist });
      const result = await signAndExecute({ transaction: tx }) as SuiTransactionBlockResponse;
      const milestoneId = getCreatedMilestoneId(result);
      setStatus("done");
      setTimeout(() => router.push(`/grants/${milestoneId}`), 1200);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Transaction failed.");
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-2xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Vouch Grants</span>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">CREATE MILESTONE.</h1>
      <p className="mt-3 font-mono text-sm text-ink/60">
        Attach a funded milestone to one of your Vouch proofs. Funders will lock SUI on-chain; you receive it after submitting verified evidence.
      </p>

      {!account?.address ? (
        <div className="card-neo mt-8 p-6 text-center">
          <p className="font-display text-2xl text-ink">CONNECT YOUR WALLET.</p>
        </div>
      ) : (
        <div className="card-neo mt-8 space-y-5 p-5 sm:p-6">
          {/* Project selector */}
          <label className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
            Vouch project
            {proofs.length > 0 ? (
              <select
                value={input.projectId}
                onChange={(e) => setInput({ ...input, projectId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select a project</option>
                {proofs.map((p) => (
                  <option key={p.objectId} value={p.objectId}>{p.title} ({p.objectId.slice(0, 10)}…)</option>
                ))}
              </select>
            ) : (
              <>
                <input
                  value={input.projectId}
                  onChange={(e) => setInput({ ...input, projectId: e.target.value })}
                  placeholder="Paste a VouchProject object ID (0x…)"
                  className={inputClass}
                />
                <span className="font-mono text-xs text-ink/50 normal-case">No cached proofs found for this wallet. Paste the object ID directly.</span>
              </>
            )}
          </label>

          <label className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
            Milestone title
            <input value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} placeholder="e.g. MVP deployed and live" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
            Description
            <textarea value={input.description} onChange={(e) => setInput({ ...input, description: e.target.value })} rows={3} placeholder="What does the builder need to prove to claim this milestone?" className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
            Reward (SUI)
            <input value={input.rewardSui} onChange={(e) => setInput({ ...input, rewardSui: e.target.value })} placeholder="0.5" type="number" step="0.001" min="0" className={inputClass} />
          </label>

          {errMsg && (
            <div className="flex items-center gap-2 font-mono text-sm text-coral">
              <AlertTriangle size={14} /> {errMsg}
            </div>
          )}
          {status === "done" && (
            <div className="flex items-center gap-2 font-mono text-sm text-brand-green">
              <CheckCircle2 size={14} /> Milestone created! Redirecting…
            </div>
          )}

          <button onClick={submit} disabled={status === "busy" || status === "done"} className="btn-neo w-full bg-ink py-4 text-sm text-white disabled:opacity-60">
            {status === "busy" ? "Creating…" : "CREATE MILESTONE ON SUI"}
          </button>
        </div>
      )}
    </main>
  );
}
