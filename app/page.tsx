import Link from "next/link";
import { ArrowRight, Database, Fingerprint, ShieldCheck } from "lucide-react";
import { TatumStatusCard } from "@/components/TatumStatusCard";
import { WalrusStorageCard } from "@/components/WalrusStorageCard";
import { CartoonMascot } from "@/components/CartoonMascot";

const tickerItems = [
  "EVIDENCE ON WALRUS",
  "HASHES ON SUI",
  "VERIFIED THROUGH TATUM RPC",
  "PROOF YOUR BUILD HAPPENED",
  "SUI BUILDER REGISTRY",
  "OPEN & VERIFIABLE",
];

const features = [
  {
    icon: Database,
    title: "EVIDENCE ON WALRUS",
    text: "Upload screenshots, READMEs, PDFs, and demo proof as content-addressed builder evidence.",
    bg: "#F5C842",
  },
  {
    icon: Fingerprint,
    title: "HASHES ON SUI",
    text: "Each manifest and file gets a SHA-256 fingerprint before the project proof is anchored on-chain.",
    bg: "#FFFFFF",
  },
  {
    icon: ShieldCheck,
    title: "TATUM RPC VERIFIED",
    text: "Public proof pages read Sui state through a Tatum Sui JSON-RPC gateway — no middleman.",
    bg: "#87CEEB",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-slide-up">
            <span className="btn-neo mb-6 inline-block bg-gold px-4 py-2 text-xs text-ink">
              Tatum × Build on Sui × Walrus Hackathon MVP
            </span>
            <h1 className="font-display text-[5rem] leading-none tracking-tight text-ink md:text-[6.5rem] lg:text-[7.5rem]">
              PROOF YOUR BUILD HAPPENED.
            </h1>
            <p className="mt-6 max-w-lg font-mono text-base text-ink/70">
              Vouch stores project evidence on Walrus and anchors proof hashes on Sui through Tatum RPC. Every build, verifiable forever.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/create" className="btn-neo bg-ink px-8 py-4 text-sm text-white">
                Create Vouch <ArrowRight size={16} />
              </Link>
              <Link href="/explore" className="btn-neo bg-white px-8 py-4 text-sm text-ink">
                Explore Proofs
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CartoonMascot className="w-56 animate-float drop-shadow-2xl lg:w-72" />
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap my-2">
        <div className="ticker-track animate-marquee">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="mx-10 font-mono text-sm font-bold uppercase tracking-widest text-gold">
              ★ {item}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-6xl text-ink md:text-7xl">HOW IT WORKS.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="card-neo p-8 transition-transform hover:-translate-y-1"
              style={{ backgroundColor: f.bg }}
            >
              <f.icon size={40} className="mb-6 text-ink" />
              <h3 className="font-display text-3xl text-ink">{f.title}</h3>
              <p className="mt-4 font-mono text-sm leading-relaxed text-ink/65">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Live status */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="mb-8 font-display text-4xl text-ink">LIVE STATUS.</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <TatumStatusCard />
          <WalrusStorageCard />
        </div>
      </section>
    </main>
  );
}
