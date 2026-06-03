import { ProofList } from "@/components/ProofList";

export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Explore</span>
      <h1 className="mt-4 font-display text-6xl text-ink md:text-7xl">EXPLORE PROOFS.</h1>
      <p className="mt-4 max-w-3xl font-mono text-sm text-ink/60">
        Recent Vouch proofs appear from the browser cache after creation. The Move contract emits events so a production indexer can query full history through Tatum Sui RPC.
      </p>
      <div className="mt-10">
        <ProofList />
      </div>
    </main>
  );
}
