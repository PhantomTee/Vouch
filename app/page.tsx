import Link from "next/link";
import { ArrowRight, Database, Fingerprint, ShieldCheck } from "lucide-react";
import { LottieHero } from "@/components/LottieHero";
import { TatumStatusCard } from "@/components/TatumStatusCard";
import { WalrusStorageCard } from "@/components/WalrusStorageCard";

const features = [
  { icon: Database, title: "Evidence on Walrus", text: "Upload screenshots, READMEs, PDFs, and demo proof as content-addressed builder evidence." },
  { icon: Fingerprint, title: "Hashes anchored on Sui", text: "Each manifest and file gets a SHA-256 fingerprint before the project proof is anchored." },
  { icon: ShieldCheck, title: "Verified through Tatum RPC", text: "Public proof pages read Sui state through a Tatum Sui JSON-RPC gateway wrapper." }
];

export default function Home() {
  return (
    <main className="grid-bg">
      <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-brand-blue/40 bg-brand-blue/10 px-4 py-2 text-sm text-brand-blue">Tatum x Build on Sui with Walrus hackathon MVP</p>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">Proof your build happened.</h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">Vouch stores project evidence on Walrus and anchors proof hashes on Sui through Tatum RPC.</p>
          <p className="mt-5 max-w-2xl text-slate-400">Vouch is a verifiable proof-of-build registry for Sui projects. It stores project evidence on Walrus, anchors proof hashes on Sui, and uses Tatum RPC to make every build easy to verify and share.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/create" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple px-6 py-3 font-semibold text-white shadow-glow">Create Vouch <ArrowRight size={18} /></Link>
            <Link href="/explore" className="rounded-2xl border border-line bg-white/5 px-6 py-3 font-semibold text-slate-100 hover:bg-white/10">Explore Proofs</Link>
          </div>
        </div>
        <div className="space-y-4">
          <LottieHero src="/animations/proof-network.json" label="Proof network animation" />
          <div className="grid gap-4 sm:grid-cols-2"><TatumStatusCard /><WalrusStorageCard /></div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-20 md:grid-cols-3">
        {features.map((feature) => <article key={feature.title} className="gradient-border rounded-3xl p-6"><feature.icon className="mb-5 text-brand-blue" /><h2 className="text-xl font-bold">{feature.title}</h2><p className="mt-3 text-slate-400">{feature.text}</p></article>)}
      </section>
    </main>
  );
}
