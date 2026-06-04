"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { FileDropzone } from "@/components/FileDropzone";
import { GitHubImportButton, type ImportedRepoData } from "@/components/GitHubImportButton";
import { StepProgress } from "@/components/StepProgress";
import { CartoonMascot } from "@/components/CartoonMascot";
import { sha256File, sha256String } from "@/lib/hash/sha256";
import { createManifest } from "@/lib/manifest/createManifest";
import { encryptForOwner } from "@/lib/seal/client";
import { buildCreateProjectTx } from "@/lib/sui/transactions";
import { uploadToWalrus } from "@/lib/walrus/client";
import type { CreateVouchInput, EvidenceManifestItem, StoredProof } from "@/types/vouch";
import { useNetwork } from "@/lib/network";

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const formSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(80),
  tagline: z.string().trim().min(1, "Tagline is required.").max(140),
  category: z.string().trim().min(1, "Category is required."),
  description: z.string().trim().min(1, "Description is required.").max(1000),
  repoUrl: z.string().trim().url("Enter a valid GitHub repository URL."),
  demoUrl: z.string().trim().url("Enter a valid demo URL.").optional().or(z.literal("")),
  suiUrl: z.string().trim().url("Enter a valid Sui URL.").optional().or(z.literal("")),
  xUrl: z.string().trim().url("Enter a valid X URL.").optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("Enter a valid LinkedIn URL.").optional().or(z.literal("")),
  displayName: z.string().trim().optional()
});

const emptyInput: CreateVouchInput = {
  name: "", tagline: "", category: "", description: "",
  repoUrl: "", demoUrl: "", suiUrl: "", xUrl: "", linkedinUrl: "", displayName: ""
};

function getCreatedObjectId(result: SuiTransactionBlockResponse): string {
  const createdProject = result.objectChanges?.find(
    (change) => change.type === "created" && "objectType" in change && change.objectType.includes("::vouch::VouchProject")
  );
  if (createdProject && "objectId" in createdProject) return createdProject.objectId;
  throw new Error("Sui transaction succeeded, but the wallet response did not include the created VouchProject object ID.");
}

function cacheProof(proof: StoredProof) {
  const current = JSON.parse(localStorage.getItem("vouch.proofs") || "[]") as StoredProof[];
  const next = [proof, ...current.filter((item) => item.objectId !== proof.objectId)].slice(0, 50);
  localStorage.setItem("vouch.proofs", JSON.stringify(next));
}

const inputClass = "w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-brand-blue focus:shadow-neo-sm";

export function CreateVouchForm() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { data: session } = useSession();
  const { network } = useNetwork();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showObjectChanges: true, showRawEffects: true }
      })
  });

  const [input, setInput] = useState<CreateVouchInput>(emptyInput);
  const [files, setFiles] = useState<File[]>([]);
  const [sealedSet, setSealedSet] = useState<Set<number>>(new Set());
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    setInput((prev) => ({
      ...prev,
      displayName: prev.displayName || session.user.name || session.user.login || "",
      xUrl: prev.xUrl || "",
    }));
  }, [session]);

  function handleImport(data: ImportedRepoData) {
    setInput((prev) => ({
      ...prev,
      name: data.name || prev.name,
      tagline: data.tagline || prev.tagline,
      category: data.category || prev.category,
      description: data.description || prev.description,
      repoUrl: data.repoUrl || prev.repoUrl,
      demoUrl: data.demoUrl || prev.demoUrl,
    }));
    if (data.readmeFile) {
      setFiles((prev) => {
        if (prev.some((f) => f.name === "README.md")) return prev;
        return [data.readmeFile!, ...prev].slice(0, 5);
      });
    }
  }
  const [error, setError] = useState("");
  const [manifestJson, setManifestJson] = useState("");
  const [doneUrl, setDoneUrl] = useState("");

  const categories = useMemo(() => ["DeFi", "Gaming", "Infrastructure", "Tooling", "Social", "Public goods", "Other"], []);

  async function submit() {
    setError(""); setDoneUrl(""); setManifestJson("");
    try {
      if (!session?.user?.login) throw new Error("Sign in with GitHub before creating a Vouch — this verifies you own the GitHub account you're linking.");
      if (!account?.address) throw new Error("Connect a Sui wallet before creating a Vouch.");
      const parsed = formSchema.parse(input);
      if (files.length < 1) throw new Error("Add at least one evidence file.");
      if (files.length > MAX_FILES) throw new Error(`The MVP supports up to ${MAX_FILES} evidence files.`);
      const tooLarge = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
      if (tooLarge) throw new Error(`${tooLarge.name} is larger than 5MB.`);

      setStep(0);
      setStep(1);
      const hashedFiles = await Promise.all(files.map(async (file) => ({ file, sha256: await sha256File(file) })));

      setStep(2);
      const evidence: EvidenceManifestItem[] = [];
      for (let i = 0; i < hashedFiles.length; i++) {
        const item = hashedFiles[i];
        const isSealed = sealedSet.has(i);
        let uploadBlob: Blob;
        let sealId: string | undefined;
        if (isSealed) {
          const fileData = new Uint8Array(await item.file.arrayBuffer());
          const encrypted = await encryptForOwner(suiClient as Parameters<typeof encryptForOwner>[0], fileData, account.address);
          uploadBlob = new Blob([encrypted.encryptedBytes.slice()], { type: "application/octet-stream" });
          sealId = encrypted.sealId;
        } else {
          uploadBlob = item.file;
        }
        const uploaded = await uploadToWalrus(uploadBlob, isSealed ? "application/octet-stream" : (item.file.type || "application/octet-stream"));
        if (!uploaded.ok) throw new Error(`${uploaded.message} ${uploaded.setupHint}`);
        evidence.push({ type: item.file.type || "file", name: item.file.name, mimeType: item.file.type || "application/octet-stream", size: item.file.size, walrusBlobId: uploaded.blobId, sha256: item.sha256, sealed: isSealed || undefined, sealId });
      }

      setStep(3);
      const manifest = createManifest(parsed, account.address, evidence);
      const json = JSON.stringify(manifest, null, 2);
      setManifestJson(json);
      const manifestHash = await sha256String(json);
      const manifestUpload = await uploadToWalrus(new Blob([json], { type: "application/json" }), "application/json");
      if (!manifestUpload.ok) throw new Error(`${manifestUpload.message} ${manifestUpload.setupHint}`);

      setStep(4);
      const tx = buildCreateProjectTx({ title: parsed.name, tagline: parsed.tagline, category: parsed.category, manifestBlobId: manifestUpload.blobId, manifestHash });
      const result = await signAndExecuteTransaction({ transaction: tx });
      const objectId = getCreatedObjectId(result as SuiTransactionBlockResponse);

      const proof: StoredProof = {
        objectId, txDigest: result.digest, owner: account.address,
        manifestBlobId: manifestUpload.blobId, manifestHash,
        title: parsed.name, tagline: parsed.tagline, category: parsed.category,
        createdAt: manifest.createdAt, version: 1, manifest, network
      };

      cacheProof(proof);
      setStep(5);
      setDoneUrl(`/vouch/${objectId}`);
      window.location.href = `/vouch/${objectId}`;
    } catch (cause) {
      setError(
        cause instanceof z.ZodError
          ? cause.errors.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")
          : cause instanceof Error ? cause.message : "Unknown error creating Vouch"
      );
    }
  }

  const urlFields = new Set(["repoUrl", "demoUrl", "suiUrl", "xUrl", "linkedinUrl"]);

  function handleFieldBlur(key: keyof CreateVouchInput, value: string) {
    if (!urlFields.has(key) || !value) return;
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      setInput((prev) => ({ ...prev, [key]: `https://${value}` }));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="card-neo min-w-0 p-4 sm:p-6">
        <GitHubImportButton onImport={handleImport} />
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ["name", "Project name"],
            ["tagline", "Tagline"],
            ["repoUrl", "GitHub repo URL"],
            ["demoUrl", "Demo URL (optional)"],
            ["suiUrl", "Sui package/object URL (optional)"],
            ["displayName", "Builder display name (optional)"],
            ["xUrl", "X URL (optional)"],
            ["linkedinUrl", "LinkedIn URL (optional)"]
          ] as [keyof CreateVouchInput, string][]).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              {label}
              <input
                value={String(input[key] || "")}
                onChange={(e) => setInput({ ...input, [key]: e.target.value })}
                onBlur={(e) => handleFieldBlur(key, e.target.value)}
                placeholder={urlFields.has(key) && key !== "name" && key !== "tagline" && key !== "displayName" ? "https://" : undefined}
                className={inputClass}
              />
            </label>
          ))}

          <label className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
            Category
            <select
              value={input.category}
              onChange={(e) => setInput({ ...input, category: e.target.value })}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink sm:col-span-2">
            Short description
            <textarea
              value={input.description}
              onChange={(e) => setInput({ ...input, description: e.target.value })}
              rows={5}
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-6">
          <FileDropzone
            files={files}
            onFiles={(next) => {
              setFiles(next);
              setSealedSet((prev) => {
                const updated = new Set<number>();
                for (const idx of prev) { if (idx < next.length) updated.add(idx); }
                return updated;
              });
            }}
            sealedSet={sealedSet}
            onToggleSeal={(i) => setSealedSet((prev) => {
              const next = new Set(prev);
              next.has(i) ? next.delete(i) : next.add(i);
              return next;
            })}
          />
        </div>

        {!session?.user && (
          <div className="mt-5 card-neo border-gold bg-gold/20 p-4">
            <p className="font-mono text-sm font-bold text-ink">GitHub sign-in required</p>
            <p className="mt-1 font-mono text-xs text-ink/70">Sign in with GitHub to prove you own the account you&apos;re linking. This prevents impersonation.</p>
            <button
              type="button"
              onClick={() => signIn("github")}
              className="btn-neo mt-3 bg-ink px-4 py-2 text-xs text-white"
            >
              Sign in with GitHub
            </button>
          </div>
        )}

        {session?.user && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border-2 border-brand-green bg-brand-green/10 px-4 py-3">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="h-8 w-8 rounded-full border-2 border-ink" />
            )}
            <div>
              <p className="font-mono text-xs font-bold text-ink">✓ GitHub verified</p>
              <p className="font-mono text-xs text-ink/60">@{session.user.login}</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="mt-5 card-neo border-coral bg-red-50 p-4 shadow-[4px_4px_0_#FF6B5B]">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-coral">
              <AlertTriangle size={16} /> Error
            </div>
            <p className="mt-1 font-mono text-sm text-ink/80">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {manifestJson ? (
                <button onClick={() => navigator.clipboard.writeText(manifestJson)} className="btn-neo bg-white px-3 py-1.5 text-xs text-ink">
                  Copy manifest JSON
                </button>
              ) : null}
              <button onClick={submit} className="btn-neo bg-ink px-3 py-1.5 text-xs text-white">
                Retry
              </button>
            </div>
          </div>
        ) : null}

        <button
          onClick={submit}
          className="btn-neo mt-6 w-full bg-ink px-6 py-4 text-sm text-white"
          style={{ borderRadius: "1rem" }}
        >
          CREATE VERIFIABLE VOUCH
        </button>

        {doneUrl ? (
          <p className="mt-4 flex items-center gap-2 font-mono text-sm text-brand-green">
            <CheckCircle2 size={16} /> Proof created: {doneUrl}
          </p>
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="card-neo flex items-center justify-center p-8" style={{ backgroundColor: "var(--color-surface)" }}>
          <CartoonMascot className="w-40 animate-peek" />
        </div>
        <div className="card-neo p-5">
          <h2 className="mb-4 font-display text-2xl text-ink">PROGRESS</h2>
          <StepProgress currentStep={step} error={error} />
        </div>
      </aside>
    </div>
  );
}
