import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaqItem } from "@/components/FaqItem";

const steps = [
  {
    number: "01",
    title: "Sign in with GitHub",
    bg: "#F5C842",
    content: [
      "Click Sign in with GitHub in the top navigation bar.",
      "Authorize Vouch to read your public profile — we only access your username, name, and avatar. We never read your code or private repos.",
      "This step is required to create a proof. It cryptographically links your GitHub identity to your Sui wallet, so nobody can claim your GitHub account in a proof they didn't author.",
    ],
    tip: "Your GitHub username is embedded in the proof manifest and verified on-chain. Impersonation is impossible.",
  },
  {
    number: "02",
    title: "Connect your Sui wallet",
    bg: "#FFFFFF",
    content: [
      "Click Connect Wallet in the header and select your wallet (Slush, Sui Wallet, or any Sui-compatible wallet).",
      "Your wallet address becomes the on-chain owner of the VouchProject object. Only this address can update or deactivate the proof.",
    ],
    tip: "You can connect wallet and GitHub in any order, but both are required before submitting.",
  },
  {
    number: "03",
    title: "Import or fill your project details",
    bg: "#87CEEB",
    content: [
      "On the Create page, click Import from GitHub repo to auto-fill your project name, tagline, description, category, and repo URL from any of your public GitHub repositories.",
      "The README is automatically added as your first evidence file.",
      "Review and edit any field. Fill in the Demo URL if your project is live, and add your Sui contract URL if you deployed on-chain.",
      "Select a category that best matches your project: DeFi, Gaming, Infrastructure, Tooling, Social, Public goods, or Other.",
    ],
    tip: "The category auto-detects from your repo's GitHub topics — adjust it if needed.",
  },
  {
    number: "04",
    title: "Upload evidence files",
    bg: "#F5C842",
    content: [
      "Drag and drop or click Choose files to add evidence. You can add up to 5 files, 5MB each.",
      "Good evidence includes: screenshots of your running app, architecture diagrams, a demo recording thumbnail, PDF write-up, or test results.",
      "Each file is SHA-256 hashed in your browser before upload — the hash is what gets anchored on-chain, not the file itself.",
      "Toggle any file to Private to encrypt it with Sui Seal before it goes to Walrus. Only your wallet can decrypt private files — even Vouch cannot read them.",
    ],
    tip: "Private files are encrypted client-side before leaving your browser. The Seal key servers only release decryption keys after verifying on-chain ownership.",
  },
  {
    number: "05",
    title: "Anchor your proof on Sui",
    bg: "#FFFFFF",
    content: [
      "Click CREATE VERIFIABLE VOUCH. The app will: hash all files locally → upload evidence to Walrus → create and upload a JSON manifest → anchor the manifest hash on Sui.",
      "Your wallet will prompt you to sign one transaction. This creates a VouchProject object on Sui testnet owned by your wallet address.",
      "The entire flow takes 15–30 seconds depending on network speed.",
    ],
    tip: "The Sui transaction timestamp is immutable. It is objective, on-chain proof of when your project existed.",
  },
  {
    number: "06",
    title: "Share your proof",
    bg: "#87CEEB",
    content: [
      "Your proof page is public and permanent. Share the URL with hackathon judges, employers, or on social media.",
      "The page loads directly from Sui via Tatum RPC — no Vouch servers involved. Anyone can independently verify your proof.",
      "Click Copy proof link to copy the URL. The proof also appears on your profile at /me and on your public builder page at /u/[your-github-username].",
      "When sharing on Twitter or Discord, the link unfurls with your project title and tagline as a preview card.",
    ],
    tip: "Your proof is verifiable forever — even if Vouch goes offline, the data lives on Walrus and Sui.",
  },
];

const faqs = [
  {
    q: "Can I update my proof after submitting?",
    a: "Yes. On your proof page, the Update this proof button (visible only to the owner wallet) lets you upload new evidence files. The new files are appended to the existing set and a new manifest is re-anchored on Sui, incrementing the version number.",
  },
  {
    q: "Are private files truly private?",
    a: "Yes. Private files are encrypted in your browser using Sui Seal before being uploaded to Walrus. The Seal threshold key network only releases decryption keys after verifying, via a Sui dry-run transaction, that the requester's wallet is the proof owner. Not even Vouch can decrypt them.",
  },
  {
    q: "Does the GitHub repo need to be public?",
    a: "The GitHub import feature only works with public repos. You can still manually enter any URL in the repo field — the GitHub sign-in only verifies you own the GitHub account, not that the repo is public.",
  },
  {
    q: "What is Walrus?",
    a: "Walrus is a decentralised storage protocol built on Sui. It stores large files (evidence, manifests) using erasure coding across multiple storage nodes. Files are content-addressed — the blob ID and SHA-256 hash in your proof are guarantees of file integrity independent of any server.",
  },
  {
    q: "What is the difference between the manifest hash and the file hashes?",
    a: "Each evidence file is individually SHA-256 hashed. Those hashes are collected into a JSON manifest along with your project metadata. The manifest itself is then hashed, and that manifest hash is what gets anchored on Sui. This creates a chain of integrity: tamper with any file → the file hash changes → the manifest hash changes → the on-chain record no longer matches.",
  },
];

export default function HowToUsePage() {
  return (
    <main className="mx-auto max-w-4xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Guide</span>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl md:text-6xl">HOW TO USE VOUCH.</h1>
      <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-ink/60">
        Vouch creates tamper-proof, on-chain evidence of your project builds. Follow these six steps to publish a verifiable proof in under two minutes.
      </p>

      <div className="mt-6">
        <Link href="/create" className="btn-neo inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm text-white">
          Create your first Vouch <ArrowRight size={14} />
        </Link>
      </div>

      {/* Steps */}
      <div className="mt-14 space-y-6">
        {steps.map((step) => (
          <article key={step.number} className="card-neo overflow-hidden" style={{ backgroundColor: step.bg }}>
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="shrink-0 font-display text-5xl leading-none text-ink/20 sm:text-6xl">{step.number}</span>
                <div className="min-w-0">
                  <h2 className="font-display text-2xl text-ink sm:text-3xl">{step.title.toUpperCase()}</h2>
                  <ul className="mt-4 space-y-2">
                    {step.content.map((line, i) => (
                      <li key={i} className="flex gap-2 font-mono text-sm leading-relaxed text-ink/75">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  {step.tip && (
                    <p className="mt-4 rounded-xl border-2 border-ink/20 bg-white/60 px-4 py-2.5 font-mono text-xs text-ink/60">
                      <span className="font-bold text-ink">Tip:</span> {step.tip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="font-display text-4xl text-ink sm:text-5xl">FAQ.</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="card-neo mt-14 bg-ink p-8 text-center sm:p-10">
        <h2 className="font-display text-3xl text-white sm:text-4xl">READY TO PROVE YOUR BUILD?</h2>
        <p className="mt-3 font-mono text-sm text-white/60">Sign in with GitHub, connect your wallet, and anchor your proof in under two minutes.</p>
        <Link href="/create" className="btn-neo mt-6 inline-flex items-center gap-2 bg-gold px-8 py-4 text-sm text-ink">
          Create Vouch <ArrowRight size={14} />
        </Link>
      </section>
    </main>
  );
}
