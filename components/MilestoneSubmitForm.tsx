"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { StepProgress } from "@/components/StepProgress";
import { sha256File, sha256String } from "@/lib/hash/sha256";
import { encryptForOwner } from "@/lib/seal/client";
import { buildSubmitProofTx } from "@/lib/sui/grantTransactions";
import { uploadToWalrus } from "@/lib/walrus/client";
import type { EvidenceManifestItem } from "@/types/vouch";
import type { GrantMilestone, MilestoneCompletionManifest } from "@/types/grants";

const steps = [
  "Hashing evidence files",
  "Uploading evidence to Walrus",
  "Uploading completion manifest to Walrus",
  "Anchoring proof on Sui",
  "Done",
];

const inputClass = "w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-brand-blue";

export function MilestoneSubmitForm({ milestone }: { milestone: GrantMilestone }) {
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

  const [files, setFiles] = useState<File[]>([]);
  const [sealedSet, setSealedSet] = useState<Set<number>>(new Set());
  const [note, setNote] = useState("");
  const [step, setStep] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [done, setDone] = useState(false);

  if (!account?.address) return <p className="font-mono text-sm text-ink/60">Connect your wallet to submit proof.</p>;

  async function submit() {
    if (!account?.address) return;
    if (files.length === 0) { setErrMsg("Add at least one evidence file."); return; }
    setErrMsg("");

    try {
      setStep(0);
      const hashedFiles = await Promise.all(files.map(async (f) => ({ file: f, sha256: await sha256File(f) })));

      setStep(1);
      const evidence: EvidenceManifestItem[] = [];
      for (let i = 0; i < hashedFiles.length; i++) {
        const item = hashedFiles[i];
        const isSealed = sealedSet.has(i);
        let uploadBlob: Blob;
        let sealId: string | undefined;
        if (isSealed) {
          const fileData = new Uint8Array(await item.file.arrayBuffer());
          const encrypted = await encryptForOwner(suiClient, fileData, account.address);
          uploadBlob = new Blob([encrypted.encryptedBytes.slice()], { type: "application/octet-stream" });
          sealId = encrypted.sealId;
        } else {
          uploadBlob = item.file;
        }
        const uploaded = await uploadToWalrus(uploadBlob, isSealed ? "application/octet-stream" : item.file.type || "application/octet-stream");
        if (!uploaded.ok) throw new Error(`${uploaded.message} ${uploaded.setupHint}`);
        evidence.push({ type: item.file.type || "file", name: item.file.name, mimeType: item.file.type || "application/octet-stream", size: item.file.size, walrusBlobId: uploaded.blobId, sha256: item.sha256, sealed: isSealed || undefined, sealId });
      }

      setStep(2);
      const manifest: MilestoneCompletionManifest = {
        schema: "vouch.grant.milestone.v1",
        milestoneId: milestone.objectId,
        projectId: milestone.projectId,
        title: milestone.title,
        completionNote: note,
        evidence,
        submittedAt: new Date().toISOString(),
        builderWallet: account.address,
      };
      const json = JSON.stringify(manifest, null, 2);
      const proofHash = await sha256String(json);
      const manifestUpload = await uploadToWalrus(new Blob([json], { type: "application/json" }), "application/json");
      if (!manifestUpload.ok) throw new Error(`${manifestUpload.message} ${manifestUpload.setupHint}`);

      setStep(3);
      const tx = buildSubmitProofTx({ milestoneId: milestone.objectId, proofBlobId: manifestUpload.blobId, proofHash });
      await signAndExecute({ transaction: tx }) as SuiTransactionBlockResponse;

      setStep(4);
      setDone(true);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Submission failed.");
    }
  }

  if (done) {
    return (
      <div className="card-neo bg-brand-green/10 p-6 text-center">
        <CheckCircle2 size={36} className="mx-auto text-brand-green" />
        <p className="mt-3 font-display text-2xl text-ink">PROOF SUBMITTED.</p>
        <p className="mt-2 font-mono text-sm text-ink/60">Evidence is on Walrus and the proof hash is anchored on Sui. The funder will now review and release funds.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card-neo space-y-5 p-5 sm:p-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink/50">Milestone</p>
          <p className="mt-1 font-display text-xl text-ink">{milestone.title}</p>
          <p className="font-mono text-sm text-ink/60">Reward: {milestone.rewardSui}</p>
        </div>

        <label className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
          Completion note (optional)
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brief summary of what you built" className={inputClass} />
        </label>

        <FileDropzone
          files={files}
          onFiles={(next) => { setFiles(next); setSealedSet((prev) => { const s = new Set<number>(); for (const i of prev) { if (i < next.length) s.add(i); } return s; }); }}
          sealedSet={sealedSet}
          onToggleSeal={(i) => setSealedSet((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; })}
        />

        {errMsg && (
          <div className="flex items-center gap-2 font-mono text-sm text-coral">
            <AlertTriangle size={14} /> {errMsg}
          </div>
        )}

        <button onClick={submit} className="btn-neo w-full bg-ink py-4 text-sm text-white">
          SUBMIT PROOF ON SUI
        </button>
      </div>

      <div className="card-neo p-5">
        <h2 className="mb-4 font-display text-xl text-ink">PROGRESS</h2>
        <StepProgress currentStep={step} error={errMsg} steps={steps} />
      </div>
    </div>
  );
}
