"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { FileDropzone } from "@/components/FileDropzone";
import { LottieHero } from "@/components/LottieHero";
import { StepProgress } from "@/components/StepProgress";
import { sha256File, sha256String } from "@/lib/hash/sha256";
import { createManifest } from "@/lib/manifest/createManifest";
import { buildCreateProjectTx } from "@/lib/sui/transactions";
import { uploadToWalrus } from "@/lib/walrus/client";
import type { CreateVouchInput, EvidenceManifestItem, StoredProof } from "@/types/vouch";

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
  name: "",
  tagline: "",
  category: "",
  description: "",
  repoUrl: "",
  demoUrl: "",
  suiUrl: "",
  xUrl: "",
  linkedinUrl: "",
  displayName: ""
};

function getCreatedObjectId(result: SuiTransactionBlockResponse): string {
  const createdProject = result.objectChanges?.find(
    (change) => change.type === "created" && "objectType" in change && change.objectType.includes("::vouch::VouchProject")
  );

  if (createdProject && "objectId" in createdProject) {
    return createdProject.objectId;
  }

  throw new Error("Sui transaction succeeded, but the wallet response did not include the created VouchProject object ID.");
}

function cacheProof(proof: StoredProof) {
  const current = JSON.parse(localStorage.getItem("vouch.proofs") || "[]") as StoredProof[];
  const next = [proof, ...current.filter((item) => item.objectId !== proof.objectId)].slice(0, 50);
  localStorage.setItem("vouch.proofs", JSON.stringify(next));
}

export function CreateVouchForm() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showRawEffects: true
        }
      })
  });

  const [input, setInput] = useState<CreateVouchInput>(emptyInput);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [manifestJson, setManifestJson] = useState("");
  const [doneUrl, setDoneUrl] = useState("");

  const categories = useMemo(() => ["DeFi", "Gaming", "Infrastructure", "Tooling", "Social", "Public goods", "Other"], []);

  async function submit() {
    setError("");
    setDoneUrl("");
    setManifestJson("");

    try {
      if (!account?.address) {
        throw new Error("Connect a Sui wallet before creating a Vouch.");
      }

      const parsed = formSchema.parse(input);

      if (files.length < 1) {
        throw new Error("Add at least one evidence file.");
      }

      if (files.length > MAX_FILES) {
        throw new Error(`The MVP supports up to ${MAX_FILES} evidence files.`);
      }

      const tooLarge = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
      if (tooLarge) {
        throw new Error(`${tooLarge.name} is larger than 5MB.`);
      }

      setStep(1);
      const hashedFiles = await Promise.all(files.map(async (file) => ({ file, sha256: await sha256File(file) })));

      setStep(2);
      const evidence: EvidenceManifestItem[] = [];

      for (const item of hashedFiles) {
        const uploaded = await uploadToWalrus(item.file, item.file.type || "application/octet-stream");
        if (!uploaded.ok) {
          throw new Error(`${uploaded.message} ${uploaded.setupHint}`);
        }

        evidence.push({
          type: item.file.type || "file",
          name: item.file.name,
          mimeType: item.file.type || "application/octet-stream",
          size: item.file.size,
          walrusBlobId: uploaded.blobId,
          sha256: item.sha256
        });
      }

      setStep(3);
      const manifest = createManifest(parsed, account.address, evidence);
      const json = JSON.stringify(manifest, null, 2);
      setManifestJson(json);

      const manifestHash = await sha256String(json);
      const manifestUpload = await uploadToWalrus(new Blob([json], { type: "application/json" }), "application/json");
      if (!manifestUpload.ok) {
        throw new Error(`${manifestUpload.message} ${manifestUpload.setupHint}`);
      }

      setStep(4);
      const tx = buildCreateProjectTx({
        title: parsed.name,
        tagline: parsed.tagline,
        category: parsed.category,
        manifestBlobId: manifestUpload.blobId,
        manifestHash
      });

      const result = await signAndExecuteTransaction({
        transaction: tx as Parameters<typeof signAndExecuteTransaction>[0]["transaction"]
      });
      const objectId = getCreatedObjectId(result as SuiTransactionBlockResponse);

      const proof: StoredProof = {
        objectId,
        txDigest: result.digest,
        owner: account.address,
        manifestBlobId: manifestUpload.blobId,
        manifestHash,
        title: parsed.name,
        tagline: parsed.tagline,
        category: parsed.category,
        createdAt: manifest.createdAt,
        version: 1,
        manifest
      };

      cacheProof(proof);
      setStep(5);
      setDoneUrl(`/vouch/${objectId}`);
      window.location.href = `/vouch/${objectId}`;
    } catch (cause) {
      setError(
        cause instanceof z.ZodError
          ? cause.errors.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")
          : cause instanceof Error
            ? cause.message
            : "Unknown error creating Vouch"
      );
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="rounded-[2rem] border border-line bg-panel p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["name", "Project name"],
            ["tagline", "Tagline"],
            ["repoUrl", "GitHub repo URL"],
            ["demoUrl", "Demo URL (optional)"],
            ["suiUrl", "Sui package/object URL (optional)"],
            ["displayName", "Builder display name (optional)"],
            ["xUrl", "X URL (optional)"],
            ["linkedinUrl", "LinkedIn URL (optional)"]
          ].map(([key, label]) => (
            <label key={key} className="space-y-2 text-sm font-medium text-slate-300">
              {label}
              <input
                value={String(input[key as keyof CreateVouchInput] || "")}
                onChange={(event) => setInput({ ...input, [key]: event.target.value })}
                className="w-full rounded-2xl border border-line bg-ink px-4 py-3 text-white outline-none focus:border-brand-blue"
              />
            </label>
          ))}

          <label className="space-y-2 text-sm font-medium text-slate-300">
            Category
            <select
              value={input.category}
              onChange={(event) => setInput({ ...input, category: event.target.value })}
              className="w-full rounded-2xl border border-line bg-ink px-4 py-3 text-white outline-none focus:border-brand-blue"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-300 md:col-span-2">
            Short description
            <textarea
              value={input.description}
              onChange={(event) => setInput({ ...input, description: event.target.value })}
              rows={5}
              className="w-full rounded-2xl border border-line bg-ink px-4 py-3 text-white outline-none focus:border-brand-blue"
            />
          </label>
        </div>

        <div className="mt-6">
          <FileDropzone files={files} onFiles={setFiles} />
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-brand-red/40 bg-brand-red/10 p-4 text-sm text-brand-red">
            <AlertTriangle className="mb-2" />
            {error}
            <div className="mt-3 flex flex-wrap gap-2">
              {manifestJson ? (
                <button onClick={() => navigator.clipboard.writeText(manifestJson)} className="rounded-xl bg-white/10 px-3 py-2">
                  Copy manifest JSON
                </button>
              ) : null}
              <button onClick={submit} className="rounded-xl bg-white/10 px-3 py-2">
                Retry
              </button>
            </div>
          </div>
        ) : null}

        <button onClick={submit} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple px-6 py-4 font-bold text-white">
          Create verifiable Vouch
        </button>

        {doneUrl ? (
          <p className="mt-4 flex items-center gap-2 text-brand-green">
            <CheckCircle2 /> Proof created: {doneUrl}
          </p>
        ) : null}
      </section>

      <aside className="space-y-5">
        <LottieHero src="/animations/upload-storage.json" label="Upload progress animation" variant="upload" />
        <div className="rounded-[2rem] border border-line bg-panel p-5">
          <h2 className="mb-4 text-lg font-bold">Progress</h2>
          <StepProgress currentStep={step} error={error} />
        </div>
      </aside>
    </div>
  );
}
