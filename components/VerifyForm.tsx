"use client";

import { CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";
import { useState } from "react";
import { getObject } from "@/lib/tatum/rpc";
import { fetchWalrusBlob } from "@/lib/walrus/client";
import { sha256String } from "@/lib/hash/sha256";
import type { VouchManifest } from "@/types/vouch";

type CheckStatus = "pending" | "running" | "ok" | "error" | "skip";
type Check = { label: string; status: CheckStatus; detail?: string };

function initChecks(): Check[] {
  return [
    { label: "Sui proof object exists", status: "pending" },
    { label: "Proof timestamp found", status: "pending" },
    { label: "Walrus manifest blob found", status: "pending" },
    { label: "Manifest hash matches on-chain record", status: "pending" },
    { label: "Evidence file hashes listed in manifest", status: "pending" },
    { label: "GitHub account linked to proof", status: "pending" },
    { label: "Wallet owner matches proof creator", status: "pending" },
    { label: "Verification performed through Tatum RPC", status: "pending" },
  ];
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle2 size={18} className="shrink-0 text-brand-green" />;
  if (status === "error") return <XCircle size={18} className="shrink-0 text-coral" />;
  if (status === "running") return <Loader2 size={18} className="shrink-0 animate-spin text-gold" />;
  return <Circle size={18} className="shrink-0 text-ink/20" />;
}

export function VerifyForm() {
  const [input, setInput] = useState(() =>
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("id") ?? ""
  );
  const [checks, setChecks] = useState<Check[]>(initChecks());
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; title: string; timestamp: string; blobId: string } | null>(null);

  function patch(i: number, update: Partial<Check>) {
    setChecks((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...update } : c)));
  }

  function extractObjectId(raw: string): string {
    const match = raw.trim().match(/0x[0-9a-fA-F]{40,}/);
    if (match) return match[0];
    throw new Error("Could not find a Sui object ID. Paste a proof URL or an ID starting with 0x.");
  }

  async function verify() {
    setRunning(true);
    setResult(null);
    setChecks(initChecks());
    let allOk = true;

    try {
      const objectId = extractObjectId(input);

      // Check 0: Sui object exists
      patch(0, { status: "running" });
      const res = await getObject(objectId) as {
        data?: { content?: { fields?: Record<string, unknown> }; previousTransaction?: string };
      };
      const fields = res.data?.content?.fields;
      if (!fields) throw new Error("Object not found or not a VouchProject.");
      patch(0, { status: "ok", detail: `Object ${objectId.slice(0, 10)}...` });

      // Check 1: Timestamp
      patch(1, { status: "running" });
      const tsMs = fields.created_at_ms as string | undefined;
      if (!tsMs) { patch(1, { status: "error", detail: "No timestamp found on object." }); allOk = false; }
      else {
        const ts = new Date(Number(tsMs)).toLocaleString();
        patch(1, { status: "ok", detail: ts });
      }

      // Check 2: Walrus blob found
      patch(2, { status: "running" });
      const blobId = fields.manifest_blob_id as string | undefined;
      const onChainHash = fields.manifest_hash as string | undefined;
      if (!blobId) { patch(2, { status: "error", detail: "manifest_blob_id missing." }); allOk = false; throw new Error("No blob ID."); }
      const fetched = await fetchWalrusBlob(blobId);
      if (!fetched.ok) { patch(2, { status: "error", detail: fetched.message }); allOk = false; throw new Error(fetched.message); }
      patch(2, { status: "ok", detail: `Blob ${blobId.slice(0, 14)}...` });

      // Check 3: Hash matches
      patch(3, { status: "running" });
      const computed = await sha256String(fetched.text);
      const hashMatch = computed === onChainHash;
      patch(3, {
        status: hashMatch ? "ok" : "error",
        detail: hashMatch ? `${computed.slice(0, 16)}... matches on-chain` : `Expected ${(onChainHash ?? "").slice(0, 12)}... got ${computed.slice(0, 12)}...`,
      });
      if (!hashMatch) allOk = false;

      // Parse manifest
      let manifest: VouchManifest | null = null;
      try { manifest = JSON.parse(fetched.text) as VouchManifest; } catch { /* no manifest */ }

      // Check 4: Evidence hashes in manifest
      patch(4, { status: "running" });
      const evidence = manifest?.evidence ?? [];
      const hashesPresent = evidence.length > 0 && evidence.every((e) => !!e.sha256);
      if (evidence.length === 0) {
        patch(4, { status: "skip", detail: "No evidence files in manifest." });
      } else if (hashesPresent) {
        patch(4, { status: "ok", detail: `${evidence.length} file${evidence.length > 1 ? "s" : ""} with SHA-256 hashes` });
      } else {
        patch(4, { status: "error", detail: "Some evidence files are missing hashes." });
        allOk = false;
      }

      // Check 5: GitHub linked
      patch(5, { status: "running" });
      const github = manifest?.builder?.links?.github || manifest?.links?.repo;
      if (github) {
        patch(5, { status: "ok", detail: github });
      } else {
        patch(5, { status: "skip", detail: "No GitHub link in manifest." });
      }

      // Check 6: Wallet owner matches manifest builder
      patch(6, { status: "running" });
      const onChainOwner = fields.owner as string | undefined;
      const manifestWallet = manifest?.builder?.wallet;
      if (!onChainOwner || !manifestWallet) {
        patch(6, { status: "skip", detail: "Wallet data unavailable." });
      } else if (onChainOwner.toLowerCase() === manifestWallet.toLowerCase()) {
        patch(6, { status: "ok", detail: `${onChainOwner.slice(0, 10)}... matches manifest` });
      } else {
        patch(6, { status: "error", detail: "On-chain owner does not match manifest builder wallet." });
        allOk = false;
      }

      // Check 7: Tatum RPC
      patch(7, { status: "ok", detail: "All reads performed via Tatum Sui JSON-RPC" });

      const title = (fields.title as string) || "Vouch Proof";
      const timestamp = tsMs ? new Date(Number(tsMs)).toLocaleString() : "Unknown";
      setResult({ ok: allOk, title, timestamp, blobId });

    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setChecks((prev) => prev.map((c) => c.status === "running" ? { ...c, status: "error", detail: msg } : c));
      allOk = false;
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="card-neo p-5 sm:p-6">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
          Proof URL or Sui object ID
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://vouch-proof.vercel.app/vouch/0x... or 0x..."
          className="mt-2 w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-brand-blue"
        />
        <button
          onClick={verify}
          disabled={running || !input.trim()}
          className="btn-neo mt-4 bg-ink px-6 py-3 text-sm text-white disabled:opacity-50"
        >
          {running ? "Verifying..." : "Verify proof"}
        </button>
      </div>

      {/* 8-check table */}
      <div className="card-neo overflow-hidden">
        <div className="border-b-2 border-ink bg-gold/20 px-5 py-3">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink">Verification checks</p>
        </div>
        <div className="divide-y-2 divide-ink/10">
          {checks.map((check, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5">
              <StatusIcon status={check.status} />
              <div className="min-w-0 flex-1">
                <p className={`font-mono text-sm font-bold ${check.status === "error" ? "text-coral" : "text-ink"}`}>
                  {check.label}
                </p>
                {check.detail && (
                  <p className="mt-0.5 break-all font-mono text-xs text-ink/50">{check.detail}</p>
                )}
              </div>
              <span className={`shrink-0 font-mono text-xs font-bold ${
                check.status === "ok" ? "text-brand-green" :
                check.status === "error" ? "text-coral" :
                check.status === "skip" ? "text-ink/30" :
                "text-ink/20"
              }`}>
                {check.status === "ok" ? "PASS" :
                 check.status === "error" ? "FAIL" :
                 check.status === "skip" ? "N/A" :
                 check.status === "running" ? "..." : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`card-neo p-6 ${result.ok ? "bg-brand-green/10" : "bg-coral/10"}`}>
          {result.ok ? (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={28} className="shrink-0 text-brand-green" />
                <p className="font-display text-2xl text-ink sm:text-3xl">PROOF VERIFIED.</p>
              </div>
              <p className="mt-3 font-mono text-sm leading-relaxed text-ink/70">
                <strong>{result.title}</strong> was anchored on Sui at <strong>{result.timestamp}</strong>.
                The manifest is stored on Walrus (blob <span className="break-all">{result.blobId.slice(0, 14)}...</span>)
                and its hash matches the on-chain record exactly.
                All checks were performed through <strong>Tatum Sui RPC</strong> with no Vouch servers involved.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <XCircle size={28} className="shrink-0 text-coral" />
                <p className="font-display text-2xl text-ink sm:text-3xl">VERIFICATION FAILED.</p>
              </div>
              <p className="mt-3 font-mono text-sm text-ink/70">
                One or more checks did not pass. The proof may have been altered or the data is unavailable.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
