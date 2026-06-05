import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, Coins, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "GrantOS — On-chain grant programs for DAOs and protocols",
  description: "Run grant programs with full on-chain accountability. Applicants submit Vouch proofs as credentials, milestones are funded in escrow, and evidence is anchored on Sui.",
};

const FEATURES = [
  {
    icon: FileCheck,
    title: "Credential-gated applications",
    body: "Builders attach Vouch proofs as prior-work credentials. Every claim is backed by an immutable, independently verifiable record on Sui.",
  },
  {
    icon: Lock,
    title: "Escrow-backed milestones",
    body: "Grant SUI is locked in a Move smart contract against specific milestones. Funds release only when the builder submits verified completion evidence.",
  },
  {
    icon: Coins,
    title: "No intermediary",
    body: "The escrow is the Move contract. There is no Vouch backend holding funds. Funders can cancel and reclaim if the builder does not deliver.",
  },
  {
    icon: CheckCircle2,
    title: "Public accountability ledger",
    body: "Every funded milestone, proof submission, and fund release is a Sui event. The full grant lifecycle is publicly auditable on-chain.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", actor: "DAO / Protocol", action: "Publishes open milestones for funded work — each with a clear description, reward amount, and linked project requirement." },
  { step: "02", actor: "Builder", action: "Creates a Vouch proof establishing their prior work. Attaches it when proposing to take a milestone." },
  { step: "03", actor: "Funder", action: "Reviews the builder's proof credentials and locks SUI into the milestone escrow on-chain." },
  { step: "04", actor: "Builder", action: "Completes the work, uploads evidence to Walrus, and anchors the completion proof hash on Sui." },
  { step: "05", actor: "Funder", action: "Reviews the on-chain completion evidence and releases the escrowed SUI to the builder." },
];

export default function GrantOSPage() {
  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      {/* Hero */}
      <div className="text-center">
        <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">GrantOS</span>
        <h1 className="mt-6 font-display text-5xl text-ink sm:text-6xl md:text-7xl">
          GRANT PROGRAMS.<br />ON-CHAIN.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-mono text-sm leading-relaxed text-ink/60 sm:text-base">
          Run grant programs with verifiable credentials, escrow-backed milestones, and a public
          accountability ledger — entirely on Sui. No spreadsheets, no trust-me-bro, no intermediaries.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/grants/create" className="btn-neo flex items-center gap-2 bg-ink px-6 py-3 text-sm text-white">
            Create a milestone <ArrowRight size={14} />
          </Link>
          <Link href="/grants" className="btn-neo flex items-center gap-2 bg-white px-6 py-3 text-sm text-ink">
            Browse open grants <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card-neo p-5">
            <f.icon size={20} className="text-ink/60" />
            <p className="mt-4 font-display text-lg text-ink">{f.title}</p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-ink/60">{f.body}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-20">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">HOW IT WORKS</h2>
        <div className="mt-8 space-y-4">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="card-neo flex items-start gap-5 p-5">
              <span className="shrink-0 font-display text-3xl text-ink/20">{step.step}</span>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40">{step.actor}</p>
                <p className="mt-1 font-mono text-sm leading-relaxed text-ink/80">{step.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* For DAOs */}
      <div className="mt-20 card-neo p-8 sm:p-10" style={{ background: "var(--color-surface)" }}>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="btn-neo inline-block bg-ink px-3 py-1 text-xs text-white">For DAOs and protocols</span>
            <h2 className="mt-4 font-display text-3xl text-ink sm:text-4xl">GRANT WITH CONFIDENCE.</h2>
            <p className="mt-4 font-mono text-sm leading-relaxed text-ink/70">
              Every grant interaction leaves a permanent on-chain trail. Applicant credentials, escrow locks,
              completion evidence, and fund releases are all Sui events — auditable by your community at any time.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Require Vouch proofs as application credentials",
                "Lock SUI directly in the milestone smart contract",
                "Review completion evidence anchored on Walrus",
                "Release or cancel with a single signed transaction",
                "Full grant history queryable via suix_queryEvents",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 font-mono text-sm text-ink/70">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand-green" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-neo bg-white p-5">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40">Grant lifecycle states</p>
              <div className="mt-3 space-y-2">
                {[
                  { status: "OPEN", desc: "Milestone published, awaiting funder", color: "text-ink/60" },
                  { status: "FUNDED", desc: "SUI locked in escrow on-chain", color: "text-brand-blue" },
                  { status: "SUBMITTED", desc: "Builder anchored completion proof on Sui", color: "text-gold" },
                  { status: "RELEASED", desc: "Funder approved, SUI transferred to builder", color: "text-brand-green" },
                  { status: "CANCELLED", desc: "Funder cancelled, SUI returned", color: "text-coral" },
                ].map((s) => (
                  <div key={s.status} className="flex items-center gap-3">
                    <span className={`shrink-0 font-mono text-xs font-bold ${s.color}`}>{s.status}</span>
                    <span className="font-mono text-xs text-ink/60">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-neo bg-white p-5">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40">Smart contract guarantees</p>
              <div className="mt-3 space-y-2 font-mono text-xs text-ink/70">
                <p>Funds can only be released to the builder address stored at funding time.</p>
                <p>Cancellation is only available to the funder, and only before proof submission.</p>
                <p>Builder cannot submit proof before funding. No state skipping is possible.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div className="mt-20 grid gap-4 sm:grid-cols-3">
        <Link href="/create" className="card-neo flex flex-col p-5 hover:shadow-neo transition-shadow">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40">Step 1</span>
          <p className="mt-2 font-display text-xl text-ink">Create your BuilderID</p>
          <p className="mt-2 font-mono text-xs text-ink/60">Anchor your prior work as a verifiable proof.</p>
          <span className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-ink">Go to create <ArrowRight size={11} /></span>
        </Link>
        <Link href="/grants" className="card-neo flex flex-col p-5 hover:shadow-neo transition-shadow">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40">Step 2</span>
          <p className="mt-2 font-display text-xl text-ink">Browse open grants</p>
          <p className="mt-2 font-mono text-xs text-ink/60">Find funded milestones that match your skills.</p>
          <span className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-ink">Browse grants <ArrowRight size={11} /></span>
        </Link>
        <Link href="/grants/create" className="card-neo flex flex-col p-5 hover:shadow-neo transition-shadow">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40">Funders</span>
          <p className="mt-2 font-display text-xl text-ink">Create a milestone</p>
          <p className="mt-2 font-mono text-xs text-ink/60">Post a funded milestone and lock SUI on-chain.</p>
          <span className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-ink">Create milestone <ArrowRight size={11} /></span>
        </Link>
      </div>
    </main>
  );
}
