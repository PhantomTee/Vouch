"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Tab = "vouch" | "hackproof" | "grantos";

const TABS: { id: Tab; label: string }[] = [
  { id: "vouch", label: "Vouch" },
  { id: "hackproof", label: "HackProof" },
  { id: "grantos", label: "GrantOS" },
];

const CONTENT: Record<Tab, {
  tag: string;
  heading: string;
  sub: string;
  steps: { actor?: string; title: string; body: string }[];
  cta: { label: string; href: string }[];
}> = {
  vouch: {
    tag: "Core proof registry",
    heading: "ANCHOR YOUR BUILD. VERIFY ANYWHERE.",
    sub: "Create a tamper-proof, blockchain-timestamped record of your project. Every file hashed, every claim anchored.",
    steps: [
      {
        title: "Connect GitHub",
        body: "Sign in with GitHub OAuth before creating a proof. Your authenticated login is embedded in the manifest at submission time, linking your GitHub identity to your Sui wallet.",
      },
      {
        title: "Add your evidence",
        body: "Upload screenshots, READMEs, architecture diagrams, or any build artifacts. Each file is SHA-256 hashed in the browser before upload. Toggle any file to Private — it is encrypted with Sui Seal so only your wallet can decrypt it.",
      },
      {
        title: "Anchor on Sui",
        body: "Your wallet signs a Sui transaction that stores the manifest hash and Walrus blob ID on-chain. The resulting object has an immutable blockchain timestamp. No Vouch backend is involved in the anchoring step.",
      },
      {
        title: "Share and verify",
        body: "Your proof page shows the timestamp, evidence list, and GitHub identity. Anyone can paste the object ID into /verify to independently re-hash the manifest from Walrus and confirm it matches the on-chain record.",
      },
    ],
    cta: [
      { label: "Create a proof", href: "/create" },
      { label: "Verify a proof", href: "/verify" },
    ],
  },
  hackproof: {
    tag: "HackProof",
    heading: "PROVE YOU SHIPPED IT.",
    sub: "Submit your hackathon project with a tamper-proof, blockchain-timestamped proof. Git history can be rewritten. Screenshots can be staged. A Sui transaction cannot.",
    steps: [
      {
        title: "Hash your evidence",
        body: "Every file is SHA-256 hashed in the browser before upload. The hash is anchored on-chain, not just a link to your repo. No one can swap the file after submission without the hash failing to match.",
      },
      {
        title: "Timestamp locked on Sui",
        body: "Your Sui wallet signs the anchoring transaction. The resulting Sui object has an immutable blockchain timestamp. The deadline check is on-chain, not in a spreadsheet someone controls.",
      },
      {
        title: "Evidence stored on Walrus",
        body: "Files go to Walrus decentralised storage. The blob ID and SHA-256 hash are anchored together on Sui. Swapping the file after submission would change the hash and fail verification immediately.",
      },
      {
        title: "Anyone can verify",
        body: "Judges paste the object ID into /verify. Eight checks run live against Tatum RPC and Walrus: existence, timestamp, manifest hash, per-file SHA-256, GitHub identity, and wallet ownership. No trust in Vouch required.",
      },
    ],
    cta: [
      { label: "Submit your project", href: "/create" },
      { label: "Verify a submission", href: "/verify" },
    ],
  },
  grantos: {
    tag: "GrantOS",
    heading: "GRANT PROGRAMS. ON-CHAIN.",
    sub: "Run grant programs with verifiable credentials, escrow-backed milestones, and a public accountability ledger — entirely on Sui.",
    steps: [
      {
        actor: "DAO / Protocol",
        title: "Publish open milestones",
        body: "Create a milestone with a clear description, reward amount in SUI, and the project it is linked to. The milestone is a shared Sui object — publicly visible to all builders on the /grants explorer.",
      },
      {
        actor: "Builder",
        title: "Submit credentials",
        body: "Create a Vouch proof establishing your prior work. Attach it when proposing to take a milestone. Your credentials are immutable and independently verifiable — not a CV you typed.",
      },
      {
        actor: "Funder",
        title: "Lock SUI in escrow",
        body: "Review the builder's proof credentials and fund the milestone. Your SUI is locked in the Move smart contract against the specific milestone. No intermediary holds the funds — the escrow is the contract.",
      },
      {
        actor: "Builder",
        title: "Submit completion proof",
        body: "Complete the work, upload evidence files to Walrus, and anchor the completion manifest hash on Sui. The proof submission is a Sui event — publicly auditable and timestamped.",
      },
      {
        actor: "Funder",
        title: "Release or cancel",
        body: "Review the on-chain completion evidence and release the escrowed SUI to the builder with a single signed transaction. If the builder has not yet submitted, you can cancel and reclaim your SUI at any time.",
      },
    ],
    cta: [
      { label: "Browse open grants", href: "/grants" },
      { label: "Create a milestone", href: "/grants/create" },
    ],
  },
};

export default function HowItWorksPage() {
  const [active, setActive] = useState<Tab>("vouch");
  const c = CONTENT[active];

  return (
    <main className="mx-auto max-w-5xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      {/* Tab switcher */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`btn-neo px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              active === t.id ? "bg-ink text-white" : "bg-white text-ink hover:bg-ink/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-10">
        <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">{c.tag}</span>
        <h1 className="mt-6 font-display text-4xl text-ink sm:text-5xl md:text-6xl">{c.heading}</h1>
        <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-ink/60 sm:text-base">{c.sub}</p>
      </div>

      {/* Steps */}
      <div className="mt-12 space-y-0">
        {c.steps.map((step, i) => (
          <div key={step.title} className="relative flex gap-6">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-4 border-ink bg-white font-display text-lg text-ink">
                {i + 1}
              </div>
              {i < c.steps.length - 1 && (
                <div className="mt-1 w-0.5 flex-1 bg-ink/20" style={{ minHeight: "2rem" }} />
              )}
            </div>

            {/* Text */}
            <div className="pb-10">
              {step.actor && (
                <p className="mb-1 font-mono text-xs font-bold uppercase tracking-widest text-ink/40">{step.actor}</p>
              )}
              <p className="font-display text-xl text-ink sm:text-2xl">{step.title}</p>
              <p className="mt-2 max-w-2xl font-mono text-sm leading-relaxed text-ink/60">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-4 flex flex-wrap gap-3">
        {c.cta.map((btn, i) => (
          <Link
            key={btn.href}
            href={btn.href}
            className={`btn-neo flex items-center gap-2 px-6 py-3 text-sm ${i === 0 ? "bg-ink text-white" : "bg-white text-ink"}`}
          >
            {btn.label} <ArrowRight size={14} />
          </Link>
        ))}
      </div>
    </main>
  );
}
