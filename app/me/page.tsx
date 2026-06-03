import { MyProofs } from "@/components/MyProofs";

export default function MePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">My Proofs</span>
      <h1 className="mt-4 font-display text-6xl text-ink md:text-7xl">MY PROOFS.</h1>
      <p className="mt-4 max-w-3xl font-mono text-sm text-ink/60">
        Filters locally cached proofs by your connected wallet. Production owner indexing can be added with Sui events or an indexer.
      </p>
      <div className="mt-10">
        <MyProofs />
      </div>
    </main>
  );
}
