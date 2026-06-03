import { env } from "@/lib/env";

export function WalrusStorageCard() {
  const ready = Boolean(env.walrusPublisherUrl && env.walrusAggregatorUrl);

  return (
    <div className="card-neo p-6" style={{ backgroundColor: ready ? "#F5C842" : "#FFFFFF" }}>
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 flex-shrink-0 rounded-full border-2 border-ink ${ready ? "bg-brand-green" : "bg-coral"}`} />
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-ink">Walrus Storage</h3>
      </div>
      <p className="mt-4 font-mono text-sm text-ink/70">
        {ready ? "Publisher and aggregator configured" : "Configure Walrus endpoints"}
      </p>
      <p className="mt-2 font-mono text-xs text-ink/40">Uploads fail loudly until real Walrus URLs are set.</p>
    </div>
  );
}
