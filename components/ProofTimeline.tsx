export function ProofTimeline({ createdAt, updatedAt, version }: { createdAt?: string; updatedAt?: string; version?: number }) {
  return (
    <div className="card-neo p-5">
      <h3 className="font-display text-2xl text-ink">TIMELINE</h3>
      <div className="mt-4 space-y-2 font-mono text-sm text-ink/70">
        <p><span className="font-bold text-ink">Created:</span> {createdAt || "Pending chain data"}</p>
        <p><span className="font-bold text-ink">Last update:</span> {updatedAt || createdAt || "Pending chain data"}</p>
        <p><span className="font-bold text-ink">Version:</span> v{version ?? 1}</p>
      </div>
    </div>
  );
}
