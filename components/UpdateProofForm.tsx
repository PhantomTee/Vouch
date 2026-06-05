"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { sha256File, sha256String } from "@/lib/hash/sha256";
import { createManifest, type GitHubIdentity } from "@/lib/manifest/createManifest";
import { encryptForOwner } from "@/lib/seal/client";
import { buildUpdateProjectTx } from "@/lib/sui/transactions";
import { uploadToWalrus } from "@/lib/walrus/client";
import type { StoredProof, EvidenceManifestItem } from "@/types/vouch";

const inputClass = "w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-brand-blue focus:shadow-neo-sm";

export function UpdateProofForm({ proof }: { proof: StoredProof }) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showObjectChanges: true, showRawEffects: true },
      }),
  });

  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sealedSet, setSealedSet] = useState<Set<number>>(new Set());
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  if (!account?.address || account.address !== proof.owner) return null;

  async function submit() {
    if (!account?.address) return;
    setStatus("busy"); setErrMsg("");
    try {
      if (files.length === 0) throw new Error("Add at least one updated evidence file.");

      const hashedFiles = await Promise.all(files.map(async (f) => ({ file: f, sha256: await sha256File(f) })));

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

      // Merge with existing evidence
      const allEvidence = [...(proof.manifest.evidence || []), ...evidence];

      const github: GitHubIdentity | undefined = proof.manifest.builder.githubLogin
        ? { githubLogin: proof.manifest.builder.githubLogin, githubUrl: proof.manifest.builder.githubUrl }
        : undefined;
      const updatedManifest = createManifest(
        { name: proof.title, tagline: proof.tagline, category: proof.category, description: proof.manifest.project.description, repoUrl: proof.manifest.links.repo, demoUrl: proof.manifest.links.demo, suiUrl: proof.manifest.links.sui, xUrl: proof.manifest.builder.links.x, linkedinUrl: proof.manifest.builder.links.linkedin, displayName: proof.manifest.builder.displayName },
        account.address,
        allEvidence,
        github,
      );
      const json = JSON.stringify(updatedManifest, null, 2);
      const manifestHash = await sha256String(json);
      const manifestUpload = await uploadToWalrus(new Blob([json], { type: "application/json" }), "application/json");
      if (!manifestUpload.ok) throw new Error(`${manifestUpload.message} ${manifestUpload.setupHint}`);

      const tx = buildUpdateProjectTx({ projectId: proof.objectId, manifestBlobId: manifestUpload.blobId, manifestHash, note: note || "Updated evidence" });
      await signAndExecuteTransaction({ transaction: tx }) as SuiTransactionBlockResponse;

      setStatus("done");
      setFiles([]); setNote("");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Update failed");
      setStatus("error");
    }
  }

  return (
    <div className="mt-10 border-t-4 border-ink pt-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-neo flex items-center gap-2 bg-white px-5 py-3 text-sm text-ink"
      >
        <RefreshCw size={14} /> {open ? "Cancel update" : "Update this proof"}
      </button>

      {open && (
        <div className="card-neo mt-6 p-5 sm:p-6">
          <h3 className="font-display text-2xl text-ink">ADD NEW EVIDENCE</h3>
          <p className="mt-1 font-mono text-xs text-ink/60">New files will be appended to the existing evidence set and the manifest re-anchored on Sui.</p>

          <div className="mt-5">
            <FileDropzone
              files={files}
              onFiles={(next) => {
                setFiles(next);
                setSealedSet((prev) => { const s = new Set<number>(); for (const i of prev) { if (i < next.length) s.add(i); } return s; });
              }}
              sealedSet={sealedSet}
              onToggleSeal={(i) => setSealedSet((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; })}
            />
          </div>

          <label className="mt-4 flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
            Update note (optional)
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Added demo video" className={inputClass} />
          </label>

          {status === "error" && <p className="mt-3 font-mono text-sm text-coral">{errMsg}</p>}
          {status === "done" && (
            <p className="mt-3 flex items-center gap-2 font-mono text-sm text-brand-green">
              <CheckCircle2 size={16} /> Proof updated on-chain.
            </p>
          )}

          <button
            onClick={submit}
            disabled={status === "busy"}
            className="btn-neo mt-5 w-full bg-ink px-6 py-4 text-sm text-white disabled:opacity-60"
          >
            {status === "busy" ? "Updating…" : "ANCHOR UPDATE ON SUI"}
          </button>
        </div>
      )}
    </div>
  );
}
