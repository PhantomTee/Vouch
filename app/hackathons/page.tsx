import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Shield, Trophy, CheckCircle2 } from "lucide-react";
import { ProofList } from "@/components/ProofList";

export const metadata: Metadata = {
  title: "HackProof — Tamper-proof hackathon submissions on Sui",
  description: "Submit your hackathon project with a cryptographically anchored proof. The blockchain timestamp proves you shipped before the deadline — no disputes possible.",
};

const HOW_IT_WORKS = [
  {
    icon: Shield,
    title: "Hash your evidence",
    body: "Every file is SHA-256 hashed in the browser before upload. The hash is what gets anchored, not just a link.",
  },
  {
    icon: Clock,
    title: "Timestamp locked on Sui",
    body: "Your Sui wallet signs the transaction. The resulting object has an immutable blockchain timestamp — the deadline check is on-chain, not in a spreadsheet.",
  },
  {
    icon: CheckCircle2,
    title: "Evidence stored on Walrus",
    body: "Files go to Walrus decentralised storage. The blob ID and SHA-256 hash are anchored together. No one can swap the file after submission.",
  },
  {
    icon: Trophy,
    title: "Anyone can verify",
    body: "Judges paste the object ID into /verify and see all checks run live — hash match, timestamp, GitHub identity. No trust in the organiser required.",
  },
];

export default function HackProofPage() {
  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      {/* Hero */}
      <div className="text-center">
        <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">HackProof</span>
        <h1 className="mt-6 font-display text-5xl text-ink sm:text-6xl md:text-7xl lg:text-8xl">
          PROVE YOU<br />SHIPPED IT.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-mono text-sm leading-relaxed text-ink/60 sm:text-base">
          Submit your hackathon project with a tamper-proof, blockchain-timestamped proof.
          Git history can be rewritten. Screenshots can be staged. A Sui transaction cannot.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/create" className="btn-neo flex items-center gap-2 bg-ink px-6 py-3 text-sm text-white">
            Submit your project <ArrowRight size={14} />
          </Link>
          <Link href="/verify" className="btn-neo flex items-center gap-2 bg-white px-6 py-3 text-sm text-ink">
            Verify a submission
          </Link>
        </div>
      </div>

      {/* The problem */}
      <div className="mt-20 grid gap-6 sm:grid-cols-2">
        <div className="card-neo border-coral/40 bg-coral/5 p-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-coral">The problem</p>
          <h2 className="mt-3 font-display text-2xl text-ink">Hackathon submissions are not tamper-proof</h2>
          <ul className="mt-4 space-y-2 font-mono text-sm text-ink/70">
            {[
              "Git history can be rewritten after the deadline",
              "Demo links can be redirected to updated code",
              "Screenshots can be staged at any time",
              "Google Docs show last-edited date, not created date",
              "Organisers take timestamps on trust",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-coral">✕</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-neo border-brand-green/40 bg-brand-green/5 p-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-green">The fix</p>
          <h2 className="mt-3 font-display text-2xl text-ink">HackProof anchors everything before the deadline</h2>
          <ul className="mt-4 space-y-2 font-mono text-sm text-ink/70">
            {[
              "SHA-256 hash of every file computed in the browser",
              "Evidence uploaded to Walrus decentralised storage",
              "Manifest hash anchored on Sui in a signed transaction",
              "Blockchain timestamp is immutable and publicly verifiable",
              "GitHub identity linked at submission time via OAuth",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-brand-green">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-20">
        <h2 className="text-center font-display text-3xl text-ink sm:text-4xl">HOW IT WORKS</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="card-neo p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-ink font-mono text-xs font-bold">
                  {i + 1}
                </span>
                <step.icon size={18} className="shrink-0 text-ink/60" />
              </div>
              <p className="mt-4 font-display text-lg text-ink">{step.title}</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-ink/60">{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* For organisers */}
      <div className="mt-20 card-neo p-8 sm:p-10" style={{ background: "var(--color-surface)" }}>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="btn-neo inline-block bg-ink px-3 py-1 text-xs text-white">For organisers</span>
            <h2 className="mt-4 font-display text-3xl text-ink sm:text-4xl">JUDGE WITH CONFIDENCE.</h2>
            <p className="mt-4 font-mono text-sm leading-relaxed text-ink/70">
              Ask builders to submit a Vouch proof instead of (or alongside) the usual form submission.
              You get a permanent, independently verifiable record of what was built, when, by whom.
              No back-and-forth over deadlines.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Paste any proof URL into /verify — 8 checks run in seconds",
                "GitHub identity anchored at submission time — no impersonation",
                "Evidence files re-hashed live from Walrus — no swapped files",
                "Sui object timestamp is immutable — no deadline disputes",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 font-mono text-sm text-ink/70">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand-green" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="card-neo bg-white p-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40">Verification checklist</p>
            <div className="mt-4 space-y-2">
              {[
                "Sui proof object exists",
                "Proof timestamp found",
                "Walrus manifest blob found",
                "Manifest hash matches on-chain record",
                "Evidence file SHA-256 verified",
                "GitHub account linked to proof",
                "Wallet owner matches proof creator",
                "Verification performed through Tatum RPC",
              ].map((check) => (
                <div key={check} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-brand-green" />
                  <span className="font-mono text-xs text-ink">{check}</span>
                </div>
              ))}
            </div>
            <Link href="/verify" className="btn-neo mt-6 flex w-full items-center justify-center gap-2 bg-ink py-3 text-sm text-white">
              Open verifier <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="mt-20">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-ink">RECENT SUBMISSIONS</h2>
          <Link href="/explore" className="btn-neo flex items-center gap-2 bg-white px-4 py-2 text-xs text-ink">
            Browse all <ArrowRight size={12} />
          </Link>
        </div>
        <p className="mt-2 font-mono text-sm text-ink/60">All proofs on Vouch — each one is a tamper-proof build submission.</p>
        <div className="mt-6">
          <ProofList />
        </div>
      </div>
    </main>
  );
}
