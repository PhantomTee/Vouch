"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { EvidenceTable } from "@/components/EvidenceTable";
import { VerificationBadge } from "@/components/VerificationBadge";
import { ProofTimeline } from "@/components/ProofTimeline";
import { LottieHero } from "@/components/LottieHero";
import { fetchWalrusBlob } from "@/lib/walrus/client";
import { getObject } from "@/lib/tatum/rpc";
import type { StoredProof, VouchManifest } from "@/types/vouch";

type ObjectResponse = { data?: { objectId?: string; owner?: unknown; previousTransaction?: string; content?: { dataType?: string; type?: string; fields?: Record<string, unknown> } } };
function cached(id: string): StoredProof | null { if (typeof window === "undefined") return null; const all = JSON.parse(localStorage.getItem("vouch.proofs") || "[]") as StoredProof[]; return all.find((p) => p.objectId === id) || null; }
function fieldString(fields: Record<string, unknown> | undefined, key: string): string { const value = fields?.[key]; return typeof value === "string" ? value : ""; }

export function ProofViewer({ objectId }: { objectId: string }) {
  const [proof, setProof] = useState<StoredProof | null>(null);
  const [chain, setChain] = useState<ObjectResponse | null>(null);
  const [message, setMessage] = useState("Loading local cache and Sui object through Tatum RPC...");
  const [manifestText, setManifestText] = useState("");
  const proofUrl = useMemo(() => typeof window === "undefined" ? `/vouch/${objectId}` : window.location.href, [objectId]);

  useEffect(() => { const local = cached(objectId); if (local) { setProof(local); setManifestText(JSON.stringify(local.manifest, null, 2)); }
    getObject(objectId).then((res) => { const object = res as ObjectResponse; setChain(object); const fields = object.data?.content?.fields; const blob = fieldString(fields, "manifest_blob_id"); if (blob && !local) fetchWalrusBlob(blob).then((fetched) => { if (fetched.ok) { setManifestText(fetched.text); try { const manifest = JSON.parse(fetched.text) as VouchManifest; setProof({ objectId, txDigest: object.data?.previousTransaction, owner: fieldString(fields, "owner"), manifestBlobId: blob, manifestHash: fieldString(fields, "manifest_hash"), title: fieldString(fields, "title"), tagline: fieldString(fields, "tagline"), category: fieldString(fields, "category"), createdAt: String(fields?.created_at_ms || ""), version: Number(fields?.latest_version || 1), manifest }); } catch { setMessage("Fetched manifest but could not parse JSON."); } } else setMessage(fetched.message); }); setMessage("Sui object loaded through Tatum RPC."); }).catch((e) => setMessage(`Tatum RPC read failed: ${e instanceof Error ? e.message : "Unknown error"}`)); }, [objectId]);

  const fields = chain?.data?.content?.fields;
  const title = proof?.title || fieldString(fields, "title") || "Vouch proof";
  const manifestHash = proof?.manifestHash || fieldString(fields, "manifest_hash");
  const manifestBlobId = proof?.manifestBlobId || fieldString(fields, "manifest_blob_id");
  const owner = proof?.owner || fieldString(fields, "owner");
  const digest = proof?.txDigest || chain?.data?.previousTransaction;
  return <main className="mx-auto max-w-7xl px-6 py-10"><div className="grid gap-8 lg:grid-cols-[1fr_360px]"><section><div className="mb-6 flex flex-wrap items-center gap-3"><VerificationBadge status={chain || proof ? "verified" : "pending"} /><span className="text-sm text-slate-400">{message}</span></div><h1 className="text-4xl font-black">{title}</h1><p className="mt-3 text-xl text-slate-300">{proof?.tagline || fieldString(fields, "tagline")}</p><div className="mt-8 grid gap-4 md:grid-cols-2"><Info label="Owner wallet" value={owner} /><Info label="Sui object ID" value={objectId} /><Info label="Transaction digest" value={digest || "Unavailable"} /><Info label="Walrus manifest blob ID" value={manifestBlobId} /><Info label="Manifest hash" value={manifestHash} /><Info label="Version" value={`v${proof?.version || Number(fields?.latest_version || 1)}`} /></div><div className="mt-8 flex flex-wrap gap-3"><CopyButton text={proofUrl} label="Copy proof link" />{manifestText ? <button className="rounded-xl border border-line bg-white/5 px-3 py-2 text-sm" onClick={() => { const url = URL.createObjectURL(new Blob([manifestText], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = `${objectId}-manifest.json`; a.click(); URL.revokeObjectURL(url); }}>Download manifest</button> : null}<a className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/5 px-3 py-2 text-sm" href={`https://suiscan.xyz/testnet/object/${objectId}`} target="_blank" rel="noreferrer">SuiScan <ExternalLink size={14}/></a><a className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/5 px-3 py-2 text-sm" href={`https://testnet.suivision.xyz/object/${objectId}`} target="_blank" rel="noreferrer">SuiVision <ExternalLink size={14}/></a></div><div className="mt-10"><h2 className="mb-4 text-2xl font-bold">File evidence</h2><EvidenceTable evidence={proof?.manifest.evidence || []} /></div><div className="mt-8 flex gap-4">{proof?.manifest.links.repo ? <Link className="text-brand-blue" href={proof.manifest.links.repo}>Repository</Link> : null}{proof?.manifest.links.demo ? <Link className="text-brand-blue" href={proof.manifest.links.demo}>Demo</Link> : null}</div></section><aside className="space-y-5"><LottieHero src="/animations/verified-check.json" label="Verified proof animation" variant="verified" /><ProofTimeline createdAt={proof?.createdAt} version={proof?.version} /></aside></div></main>;
}
function Info({ label, value }: { label: string; value?: string }) { return <div className="rounded-2xl border border-line bg-panel p-4"><p className="text-xs uppercase tracking-[.18em] text-slate-500">{label}</p><p className="mt-2 break-all font-mono text-sm text-slate-200">{value || "Pending"}</p></div>; }
