import { ProofList } from "@/components/ProofList";

export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Explore</span>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl md:text-6xl">EXPLORE PROOFS.</h1>
      <p className="mt-3 max-w-3xl font-mono text-sm text-ink/60">
        Recent Vouch proofs appear from the browser cache after creation. The Move contract emits events so a production indexer can query full history through Tatum Sui RPC.
      </p>
      <div className="mt-8">
        <ProofList />
      </div>
    </main>
  );
}
