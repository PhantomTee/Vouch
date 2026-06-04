"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { VerifyForm } from "@/components/VerifyForm";

const DEMO_PROOF_ID = process.env.NEXT_PUBLIC_DEMO_PROOF_ID || "";

const highlights = [
  { label: "Project", value: "Vouch" },
  { label: "Network", value: "Sui Testnet" },
  { label: "Storage", value: "Walrus" },
  { label: "RPC", value: "Tatum Sui JSON-RPC" },
  { label: "Encryption", value: "Sui Seal" },
  { label: "Object ID", value: DEMO_PROOF_ID || "Set NEXT_PUBLIC_DEMO_PROOF_ID" },
];

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Judge Mode</span>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">VOUCH DEMO PROOF.</h1>
      <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-ink/60">
        This is a live proof of Vouch itself — anchored on Sui, stored on Walrus, verified through Tatum RPC.
        No wallet needed. Click Verify to run the full 8-point check.
      </p>

      {/* Proof highlights */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {highlights.map((h) => (
          <div key={h.label} className="card-neo flex items-center gap-3 p-4">
            <CheckCircle2 size={16} className="shrink-0 text-brand-green" />
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40">{h.label}</p>
              <p className="truncate font-mono text-xs font-bold text-ink">{h.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap gap-3">
        {DEMO_PROOF_ID && (
          <Link href={`/vouch/${DEMO_PROOF_ID}`} className="btn-neo bg-ink px-5 py-2.5 text-xs text-white flex items-center gap-2">
            View proof page <ArrowRight size={12} />
          </Link>
        )}
        <Link href="/create" className="btn-neo bg-white px-5 py-2.5 text-xs text-ink">
          Create your own proof
        </Link>
      </div>

      {/* Inline verification */}
      <div className="mt-10">
        <h2 className="mb-5 font-display text-3xl text-ink">RUN VERIFICATION.</h2>
        <VerifyForm />
      </div>
    </main>
  );
}
