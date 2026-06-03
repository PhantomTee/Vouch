import Link from "next/link";
import { ArrowRight, Database, Fingerprint, ShieldCheck } from "lucide-react";
import { TatumStatusCard } from "@/components/TatumStatusCard";
import { WalrusStorageCard } from "@/components/WalrusStorageCard";
import { CartoonMascot } from "@/components/CartoonMascot";
import { AnimatedHeading } from "@/components/AnimatedHeading";

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
    <main className="w-full overflow-x-hidden">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Mascot — top on mobile, right on desktop */}
          <div className="flex justify-center lg:order-2 lg:justify-end">
            <CartoonMascot className="w-40 animate-float drop-shadow-xl sm:w-52 lg:w-72" />
          </div>

          {/* Text — below mascot on mobile, left on desktop */}
          <div className="animate-slide-up lg:order-1">
            <AnimatedHeading />
            <p className="mt-5 max-w-lg font-mono text-sm leading-relaxed text-ink/70 sm:text-base">
              Vouch stores project evidence on Walrus and anchors proof hashes on Sui through Tatum RPC. Every build, verifiable forever.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <Link href="/create" className="btn-neo bg-ink px-6 py-3 text-xs text-white sm:px-8 sm:py-4 sm:text-sm">
                Create Vouch <ArrowRight size={14} />
              </Link>
              <Link href="/explore" className="btn-neo bg-white px-6 py-3 text-xs text-ink sm:px-8 sm:py-4 sm:text-sm">
                Explore Proofs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap my-2">
        <div className="ticker-track animate-marquee">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="mx-8 font-mono text-xs font-bold uppercase tracking-widest text-gold sm:mx-10 sm:text-sm">
              ★ {item}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-display text-4xl text-ink sm:text-5xl md:text-6xl">HOW IT WORKS.</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="card-neo p-6 transition-transform hover:-translate-y-1 sm:p-8"
              style={{ backgroundColor: f.bg }}
            >
              <f.icon size={36} className="mb-5 text-ink" />
              <h3 className="font-display text-2xl text-ink sm:text-3xl">{f.title}</h3>
              <p className="mt-3 font-mono text-sm leading-relaxed text-ink/65">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Live status */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <h2 className="mb-6 font-display text-3xl text-ink sm:mb-8 sm:text-4xl">LIVE STATUS.</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TatumStatusCard />
          <WalrusStorageCard />
        </div>
      </section>
    </main>
  );
}
