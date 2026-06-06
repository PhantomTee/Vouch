"use client";

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { AlertTriangle, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { FileDropzone } from "@/components/FileDropzone";
import { StepProgress } from "@/components/StepProgress";
import { TatumStatusCard } from "@/components/TatumStatusCard";
import { sha256File, sha256String } from "@/lib/hash/sha256";
import { createManifest, type GitHubIdentity } from "@/lib/manifest/createManifest";
import { encryptForOwner } from "@/lib/seal/client";
import { buildCreateProjectTx } from "@/lib/sui/transactions";
import { uploadToWalrus } from "@/lib/walrus/client";
import { useNetwork } from "@/lib/networkContext";
import type { CreateHackProofInput, EvidenceManifestItem, StoredProof } from "@/types/vouch";

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const inputClass = "w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-brand-blue focus:shadow-neo-sm";

const schema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(80),
  tagline: z.string().trim().min(1, "Short description is required.").max(140),
  description: z.string().trim().min(1, "Project description is required.").max(1200),
  repoUrl: z.string().trim().url("Enter a valid GitHub repo URL."),
  demoUrl: z.string().trim().url("Enter a valid live demo URL."),
  demoVideoUrl: z.string().trim().url("Enter a valid demo video URL."),
  suiReference: z.string().trim().min(1, "Add a Sui package, object, transaction link, or ID."),
  socialPostUrl: z.string().trim().url("Enter a valid X or LinkedIn post URL."),
  hackathonName: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
});

const empty: CreateHackProofInput = {
  name: "",
  tagline: "",
  category: "Hackathon",
  description: "",
  repoUrl: "",
  demoUrl: "",
  demoVideoUrl: "",
  suiReference: "",
  socialPostUrl: "",
  suiUrl: "",
  xUrl: "",
  linkedinUrl: "",
  hackathonName: "Tatum x Build on Sui with Walrus",
  displayName: "",
};

function getCreatedObjectId(result: SuiTransactionBlockResponse): string {
  const createdProject = result.objectChanges?.find(
    (change) => change.type === "created" && "objectType" in change && change.objectType.includes("::vouch::VouchProject")
  );
  if (createdProject && "objectId" in createdProject) return createdProject.objectId;
  throw new Error("Sui transaction succeeded, but the wallet response did not include the created proof object ID.");
}

function cacheProof(proof: StoredProof) {
  const current = JSON.parse(localStorage.getItem("vouch.proofs") || "[]") as StoredProof[];
  localStorage.setItem("vouch.proofs", JSON.stringify([proof, ...current.filter((item) => item.objectId !== proof.objectId)].slice(0, 50)));
}

function normalizeUrl(value: string) {
  if (!value || value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

export function HackProofForm() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { data: session } = useSession();
  const { network } = useNetwork();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showObjectChanges: true, showRawEffects: true },
      }),
  });

  const [input, setInput] = useState<CreateHackProofInput>(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [sealedSet, setSealedSet] = useState<Set<number>>(new Set());
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [doneUrl, setDoneUrl] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    setInput((prev) => ({
      ...prev,
      displayName: prev.displayName || session.user.name || session.user.login || "",
    }));
  }, [session]);

  async function submit() {
    setError("");
    setDoneUrl("");
    try {
      if (!session?.user?.login) throw new Error("Sign in with GitHub before creating HackProof.");
      if (!account?.address) throw new Error("Connect a Sui wallet before creating HackProof.");
      const normalized = {
        ...input,
        repoUrl: normalizeUrl(input.repoUrl),
        demoUrl: normalizeUrl(input.demoUrl || ""),
        demoVideoUrl: normalizeUrl(input.demoVideoUrl || ""),
        socialPostUrl: normalizeUrl(input.socialPostUrl || ""),
        suiUrl: input.suiReference || input.suiUrl || "",
        xUrl: input.socialPostUrl?.includes("x.com") || input.socialPostUrl?.includes("twitter.com") ? input.socialPostUrl : input.xUrl,
        linkedinUrl: input.socialPostUrl?.includes("linkedin.com") ? input.socialPostUrl : input.linkedinUrl,
      };
      const parsed = schema.parse(normalized);
      if (files.length < 1) throw new Error("Add at least one screenshot or evidence file.");
      if (files.length > MAX_FILES) throw new Error(`HackProof supports up to ${MAX_FILES} evidence files.`);
      const tooLarge = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
      if (tooLarge) throw new Error(`${tooLarge.name} is larger than 5MB.`);

      setStep(1);
      const hashedFiles = await Promise.all(files.map(async (file) => ({ file, sha256: await sha256File(file) })));

      setStep(2);
      const evidence: EvidenceManifestItem[] = [];
      for (let i = 0; i < hashedFiles.length; i++) {
        const item = hashedFiles[i];
        const isSealed = sealedSet.has(i);
        let uploadBlob: Blob = item.file;
        let sealId: string | undefined;
        if (isSealed) {
          const fileData = new Uint8Array(await item.file.arrayBuffer());
          const encrypted = await encryptForOwner(suiClient as Parameters<typeof encryptForOwner>[0], fileData, account.address);
          uploadBlob = new Blob([encrypted.encryptedBytes.slice()], { type: "application/octet-stream" });
          sealId = encrypted.sealId;
        }
        const uploaded = await uploadToWalrus(uploadBlob, isSealed ? "application/octet-stream" : item.file.type || "application/octet-stream");
        if (!uploaded.ok) throw new Error(`${uploaded.message} ${uploaded.setupHint}`);
        evidence.push({
          type: item.file.type || "file",
          name: item.file.name,
          mimeType: item.file.type || "application/octet-stream",
          size: item.file.size,
          walrusBlobId: uploaded.blobId,
          sha256: item.sha256,
          sealed: isSealed || undefined,
          sealId,
        });
      }

      setStep(3);
      const github: GitHubIdentity = { githubLogin: session.user.login, githubUrl: `https://github.com/${session.user.login}` };
      const manifest = createManifest(
        { ...normalized, name: parsed.name, tagline: parsed.tagline, category: "HackProof", description: parsed.description },
        account.address,
        evidence,
        github,
        {
          proofType: "hackproof",
          network,
          hackProof: {
            hackathonName: parsed.hackathonName || "Hackathon submission",
            demoVideoUrl: parsed.demoVideoUrl,
            suiReference: parsed.suiReference,
            socialPostUrl: parsed.socialPostUrl,
          },
        }
      );
      const json = JSON.stringify(manifest, null, 2);
      const manifestHash = await sha256String(json);
      const manifestUpload = await uploadToWalrus(new Blob([json], { type: "application/json" }), "application/json");
      if (!manifestUpload.ok) throw new Error(`${manifestUpload.message} ${manifestUpload.setupHint}`);

      setStep(4);
      const tx = buildCreateProjectTx({
        title: parsed.name,
        tagline: parsed.tagline,
        category: "HackProof",
        manifestBlobId: manifestUpload.blobId,
        manifestHash,
      });
      const result = await signAndExecuteTransaction({ transaction: tx });
      const objectId = getCreatedObjectId(result as SuiTransactionBlockResponse);
      const proof: StoredProof = {
        objectId,
        txDigest: result.digest,
        owner: account.address,
        manifestBlobId: manifestUpload.blobId,
        manifestHash,
        title: parsed.name,
        tagline: parsed.tagline,
        category: "HackProof",
        createdAt: manifest.createdAt,
        version: 1,
        manifest,
        network,
      };
      cacheProof(proof);
      setStep(5);
      const url = `/vouch/${objectId}`;
      setDoneUrl(url);
      window.location.href = url;
    } catch (cause) {
      setError(
        cause instanceof z.ZodError
          ? cause.errors.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")
          : cause instanceof Error ? cause.message : "Unknown error creating HackProof"
      );
    }
  }

  const fields: [keyof CreateHackProofInput, string, string][] = [
    ["name", "Project name", "Vouch"],
    ["tagline", "Short description", "Proof-of-build layer for hackathon submissions"],
    ["repoUrl", "GitHub repo URL", "https://github.com/..."],
    ["demoUrl", "Live demo URL", "https://..."],
    ["demoVideoUrl", "Demo video URL", "https://..."],
    ["suiReference", "Sui package/object/transaction", "0x... or https://suiscan.xyz/..."],
    ["socialPostUrl", "X/LinkedIn post URL", "https://..."],
    ["hackathonName", "Hackathon", "Tatum x Build on Sui with Walrus"],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="card-neo min-w-0 p-4 sm:p-6">
        <div className="mb-5 flex items-start gap-3 rounded-xl border-2 border-ink bg-gold/20 p-4">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-ink" />
          <div>
            <p className="font-mono text-sm font-bold text-ink">HackProof by Vouch</p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-ink/70">
              Creates a public certificate with Walrus evidence, Sui proof metadata, and Tatum-powered verification checks for judges.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, placeholder]) => (
            <label key={key} className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              {label}
              <input
                value={String(input[key] || "")}
                onChange={(e) => setInput({ ...input, [key]: e.target.value })}
                onBlur={(e) => setInput({ ...input, [key]: key.toLowerCase().includes("url") ? normalizeUrl(String(input[key] || "")) : input[key] })}
                placeholder={placeholder}
                className={inputClass}
              />
            </label>
          ))}
          <label className="flex flex-col gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink sm:col-span-2">
            Project description
            <textarea
              value={input.description}
              onChange={(e) => setInput({ ...input, description: e.target.value })}
              rows={5}
              placeholder="What did you build, what is on Sui, and what should judges verify?"
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
                for (const idx of prev) if (idx < next.length) updated.add(idx);
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

        {!session?.user ? (
          <div className="mt-5 card-neo border-gold bg-gold/20 p-4">
            <p className="font-mono text-sm font-bold text-ink">GitHub sign-in required</p>
            <p className="mt-1 font-mono text-xs text-ink/70">Judges see the GitHub identity anchored in the proof manifest.</p>
            <button type="button" onClick={() => signIn("github")} className="btn-neo mt-3 bg-ink px-4 py-2 text-xs text-white">
              Sign in with GitHub
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border-2 border-brand-green bg-brand-green/10 px-4 py-3 font-mono text-xs text-ink">
            GitHub verified: @{session.user.login}
          </div>
        )}

        {error ? (
          <div className="mt-5 card-neo border-coral bg-red-50 p-4 shadow-[4px_4px_0_#FF6B5B]">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-coral">
              <AlertTriangle size={16} /> Error
            </div>
            <p className="mt-1 font-mono text-sm text-ink/80">{error}</p>
          </div>
        ) : null}

        <button onClick={submit} className="btn-neo mt-6 w-full bg-ink px-6 py-4 text-sm text-white">
          CREATE HACKPROOF CERTIFICATE
        </button>
        {doneUrl ? (
          <p className="mt-4 flex items-center gap-2 font-mono text-sm text-brand-green">
            <CheckCircle2 size={16} /> Certificate created: {doneUrl}
          </p>
        ) : null}
      </section>

      <aside className="space-y-6">
        <TatumStatusCard />
        <div className="card-neo p-5">
          <h2 className="mb-4 font-display text-2xl text-ink">PROGRESS</h2>
          <StepProgress currentStep={step} error={error} />
        </div>
        <div className="card-neo p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">Judge output</p>
          <div className="mt-3 space-y-2 font-mono text-xs text-ink/70">
            <p>Public certificate page</p>
            <p>Walrus blob IDs and manifest hash</p>
            <p>Sui proof object and network</p>
            <p>Pass/fail checks verified through Tatum</p>
          </div>
          <a href="/verify" className="btn-neo mt-4 inline-flex items-center gap-1.5 bg-white px-3 py-2 text-xs text-ink">
            Verifier <ExternalLink size={12} />
          </a>
        </div>
      </aside>
    </div>
  );
}
