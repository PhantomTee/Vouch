"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Twitter, XCircle } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { EvidenceTable } from "@/components/EvidenceTable";
import { VerificationBadge } from "@/components/VerificationBadge";
import { ProofTimeline } from "@/components/ProofTimeline";
import { CartoonMascot } from "@/components/CartoonMascot";
import { UpdateProofForm } from "@/components/UpdateProofForm";
import { SuiAddress } from "@/components/SuiAddress";
import { ProofScore } from "@/components/ProofScore";
import { TatumStatusCard } from "@/components/TatumStatusCard";
import { JudgeBriefCard } from "@/components/JudgeBriefCard";
import { JudgeAssistantCard } from "@/components/JudgeAssistantCard";
import { fetchWalrusBlob } from "@/lib/walrus/client";
import { getObject } from "@/lib/tatum/rpc";
import { sha256String } from "@/lib/hash/sha256";
import { absoluteAppUrl } from "@/lib/url";
import type { StoredProof, VouchManifest } from "@/types/vouch";

type ObjectResponse = {
  data?: {
    objectId?: string;
    owner?: unknown;
    previousTransaction?: string;
    content?: { dataType?: string; type?: string; fields?: Record<string, unknown> };
  };
};

function cached(id: string): StoredProof | null {
  if (typeof window === "undefined") return null;
  const all = JSON.parse(localStorage.getItem("vouch.proofs") || "[]") as StoredProof[];
  return all.find((p) => p.objectId === id) || null;
}

function fieldString(fields: Record<string, unknown> | undefined, key: string): string {
  const value = fields?.[key];
  return typeof value === "string" ? value : "";
}

export function ProofViewer({ objectId }: { objectId: string }) {
  const [proof, setProof] = useState<StoredProof | null>(null);
  const [chain, setChain] = useState<ObjectResponse | null>(null);
  const [message, setMessage] = useState("Loading proof…");
  const [manifestText, setManifestText] = useState("");
  const [computedManifestHash, setComputedManifestHash] = useState("");
  const proofUrl = useMemo(
    () => absoluteAppUrl(`/vouch/${objectId}`, typeof window === "undefined" ? undefined : window.location.origin),
    [objectId]
  );

  useEffect(() => {
    const local = cached(objectId);
    if (local) {
      const localText = JSON.stringify(local.manifest, null, 2);
      setProof(local);
      setManifestText(localText);
      sha256String(localText).then(setComputedManifestHash).catch(() => undefined);
    }

    getObject(objectId)
      .then((res) => {
        const object = res as ObjectResponse;
        setChain(object);
        const fields = object.data?.content?.fields;
        const blob = fieldString(fields, "manifest_blob_id");
        if (blob && !local) {
          fetchWalrusBlob(blob).then((fetched) => {
            if (fetched.ok) {
              setManifestText(fetched.text);
              sha256String(fetched.text).then(setComputedManifestHash).catch(() => undefined);
              try {
                const manifest = JSON.parse(fetched.text) as VouchManifest;
                const msToIso = (ms: unknown) =>
                  ms ? new Date(Number(ms)).toISOString() : "";
                setProof({
                  objectId,
                  txDigest: object.data?.previousTransaction,
                  owner: fieldString(fields, "owner"),
                  manifestBlobId: blob,
                  manifestHash: fieldString(fields, "manifest_hash"),
                  title: fieldString(fields, "title"),
                  tagline: fieldString(fields, "tagline"),
                  category: fieldString(fields, "category"),
                  createdAt: msToIso(fields?.created_at_ms),
                  updatedAt: msToIso(fields?.updated_at_ms),
                  version: Number(fields?.latest_version || 1),
                  manifest,
                  network: manifest.network,
                });
              } catch { setMessage("Fetched manifest but could not parse JSON."); }
            } else { setMessage(fetched.message); }
          });
        }
        setMessage("");
      })
      .catch((e) => setMessage(`Tatum RPC read failed: ${e instanceof Error ? e.message : "Unknown error"}`));
  }, [objectId]);

  const fields = chain?.data?.content?.fields;
  const title = proof?.title || fieldString(fields, "title") || "Vouch proof";
  const manifestHash = proof?.manifestHash || fieldString(fields, "manifest_hash");
  const manifestBlobId = proof?.manifestBlobId || fieldString(fields, "manifest_blob_id");
  const owner = proof?.owner || fieldString(fields, "owner");
  const digest = proof?.txDigest || chain?.data?.previousTransaction;
  const manifest = proof?.manifest;
  const network = proof?.network || manifest?.network || "testnet";
  const isHackProof = manifest?.proofType === "hackproof" || proof?.category === "HackProof";
  const evidence = manifest?.evidence || [];
  const walletMatches = Boolean(owner && manifest?.builder?.wallet && owner.toLowerCase() === manifest.builder.wallet.toLowerCase());
  const hashMatches = Boolean(manifestHash && computedManifestHash && manifestHash === computedManifestHash);
  const timestamp = proof?.createdAt || (fields?.created_at_ms ? new Date(Number(fields.created_at_ms)).toISOString() : "");
  const suiscanBase = network === "mainnet" ? "https://suiscan.xyz/mainnet" : "https://suiscan.xyz/testnet";

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <VerificationBadge status={chain || proof ? "verified" : "pending"} />
            <span className="font-mono text-xs text-ink/50">{message}</span>
          </div>

          <h1 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">{isHackProof ? "HACKPROOF CERTIFICATE" : title.toUpperCase()}</h1>
          {isHackProof ? <p className="mt-2 font-display text-2xl text-ink sm:text-3xl">{title.toUpperCase()}</p> : null}
          <p className="mt-3 font-mono text-sm text-ink/70 sm:text-base">{proof?.tagline || fieldString(fields, "tagline")}</p>

          <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2">
            <div className="card-neo min-w-0 p-3 sm:p-4">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">Owner wallet</p>
              <p className="mt-2 break-all font-mono text-xs text-ink sm:text-sm">
                {owner ? <SuiAddress address={owner} /> : "Pending"}
              </p>
            </div>
            <Info label="Sui object ID" value={objectId} />
            <Info label="Transaction digest" value={digest || "Unavailable"} />
            <Info label="Walrus manifest blob ID" value={manifestBlobId} />
            <Info label="Manifest hash" value={manifestHash} />
            <Info label="Version" value={`v${proof?.version || Number(fields?.latest_version || 1)}`} />
            <Info label="Network" value={network} />
            <Info label="Timestamp" value={timestamp ? new Date(timestamp).toLocaleString() : "Pending"} />
          </div>

          {isHackProof && manifest ? (
            <div className="mt-8 card-neo p-5 sm:p-6">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">HackProof submission details</p>
              <p className="mt-3 font-mono text-sm leading-relaxed text-ink/70">{manifest.project.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <CertificateLink label="GitHub repo" href={manifest.links.repo} />
                <CertificateLink label="Live demo" href={manifest.links.demo} />
                <CertificateLink label="Demo video" href={manifest.links.video || manifest.hackProof?.demoVideoUrl} />
                <CertificateLink label="X/LinkedIn post" href={manifest.links.socialPost || manifest.hackProof?.socialPostUrl} />
                <Info label="Sui package/object/transaction" value={manifest.hackProof?.suiReference || manifest.links.sui} />
                <Info label="Hackathon" value={manifest.hackProof?.hackathonName || "Hackathon submission"} />
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="card-neo p-5">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">Pass/fail verification checks</p>
              <div className="mt-4 space-y-2">
                <ProofCheck label="Sui proof object exists" ok={Boolean(chain?.data || proof)} detail={objectId} />
                <ProofCheck label="Proof was read using Tatum RPC" ok={Boolean(chain?.data)} detail={chain?.data ? "Verified through Tatum Sui RPC" : message || "Pending"} />
                <ProofCheck label="Manifest hash matches" ok={hashMatches} detail={computedManifestHash ? `${computedManifestHash.slice(0, 16)}...` : "Waiting for Walrus manifest"} />
                <ProofCheck label="Walrus evidence is present" ok={evidence.length > 0} detail={`${evidence.length} evidence file${evidence.length === 1 ? "" : "s"}`} />
                <ProofCheck label="GitHub repo URL exists in metadata" ok={Boolean(manifest?.links.repo)} detail={manifest?.links.repo || "Missing"} />
                <ProofCheck label="Demo URL exists in metadata" ok={Boolean(manifest?.links.demo)} detail={manifest?.links.demo || "Missing"} />
                <ProofCheck label="Wallet address matches proof creator" ok={walletMatches || !manifest?.builder?.wallet} detail={walletMatches ? "Manifest wallet matches on-chain owner" : "Unavailable or mismatch"} />
                <ProofCheck label="Network and timestamp visible" ok={Boolean(network && timestamp)} detail={`${network} · ${timestamp ? new Date(timestamp).toLocaleString() : "Pending"}`} />
              </div>
            </div>
            <div className="card-neo p-5">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">Walrus evidence</p>
              <p className="mt-3 font-mono text-sm font-bold text-ink">Stored on Walrus decentralized storage</p>
              <div className="mt-4 space-y-2 font-mono text-xs text-ink/70">
                <p className="break-all">Manifest blob: {manifestBlobId || "Pending"}</p>
                <p className="break-all">Manifest hash: {manifestHash || "Pending"}</p>
                <p>Evidence files: {evidence.length}</p>
                {evidence.slice(0, 3).map((item) => (
                  <p key={`${item.name}-${item.walrusBlobId}`} className="break-all">{item.name}: {item.walrusBlobId}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <CopyButton text={proofUrl} label="Copy proof link" />
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just anchored proof of "${title}" on Sui — verified forever on-chain with @VouchProof`)}&url=${encodeURIComponent(proofUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-neo flex items-center gap-1.5 bg-white px-3 py-2 text-xs text-ink"
            >
              <Twitter size={12} /> Share on X
            </a>
            {manifestText ? (
              <button
                className="btn-neo bg-white px-3 py-2 text-xs text-ink"
                onClick={() => {
                  const url = URL.createObjectURL(new Blob([manifestText], { type: "application/json" }));
                  const a = document.createElement("a");
                  a.href = url; a.download = `${objectId}-manifest.json`; a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download manifest
              </button>
            ) : null}
            <a
              className="btn-neo bg-white px-3 py-2 text-xs text-ink"
              href={`${suiscanBase}/object/${objectId}`}
              target="_blank" rel="noreferrer"
            >
              SuiScan <ExternalLink size={12} />
            </a>
            <Link
              href={`/verify?id=${objectId}`}
              className="btn-neo bg-white px-3 py-2 text-xs text-ink"
            >
              Verify independently
            </Link>
            <a
              className="btn-neo bg-white px-3 py-2 text-xs text-ink"
              href={`https://testnet.suivision.xyz/object/${objectId}`}
              target="_blank" rel="noreferrer"
            >
              SuiVision <ExternalLink size={12} />
            </a>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 font-display text-3xl text-ink">FILE EVIDENCE</h2>
            <EvidenceTable evidence={evidence} />
          </div>

          <div className="mt-8 flex gap-4">
            {manifest?.links.repo ? (
              <a className="btn-neo bg-ink px-4 py-2 text-xs text-white" href={manifest.links.repo} target="_blank" rel="noreferrer">Repository</a>
            ) : null}
            {manifest?.links.demo ? (
              <a className="btn-neo bg-gold px-4 py-2 text-xs text-ink" href={manifest.links.demo} target="_blank" rel="noreferrer">Demo</a>
            ) : null}
          </div>

          {proof && <UpdateProofForm proof={proof} />}
        </section>

        <aside className="space-y-5">
          <TatumStatusCard objectId={objectId} />
          <JudgeBriefCard objectId={objectId} network={network} />
          <JudgeAssistantCard objectId={objectId} network={network} />
          <div className="card-neo flex items-center justify-center p-8" style={{ backgroundColor: "var(--color-surface)" }}>
            <CartoonMascot className="w-36 animate-float" />
          </div>
          <ProofTimeline createdAt={proof?.createdAt} updatedAt={proof?.updatedAt} version={proof?.version} />
          {proof && <ProofScore proof={proof} chainVerified={!!chain} />}
        </aside>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="card-neo min-w-0 p-3 sm:p-4">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">{label}</p>
      <p className="mt-2 break-all font-mono text-xs text-ink sm:text-sm">{value || "Pending"}</p>
    </div>
  );
}

function CertificateLink({ label, href }: { label: string; href?: string }) {
  return href ? (
    <a className="card-neo min-w-0 bg-white p-3 sm:p-4" href={href} target="_blank" rel="noreferrer">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">{label}</p>
      <p className="mt-2 break-all font-mono text-xs text-brand-blue sm:text-sm">{href}</p>
    </a>
  ) : <Info label={label} value="Missing" />;
}

function ProofCheck({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-start gap-2">
      {ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-green" /> : <XCircle size={15} className="mt-0.5 shrink-0 text-coral" />}
      <div className="min-w-0">
        <p className="font-mono text-xs font-bold text-ink">{label} <span className={ok ? "text-brand-green" : "text-coral"}>{ok ? "PASS" : "FAIL"}</span></p>
        <p className="break-all font-mono text-[11px] text-ink/50">{detail}</p>
      </div>
    </div>
  );
}
