export function ProofSkeleton() {
  return (
    <div className="card-neo animate-pulse p-6">
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-ink/10" />
        <div className="h-6 w-12 rounded-full bg-ink/10" />
      </div>
      <div className="mt-4 h-8 w-3/4 rounded-lg bg-ink/10" />
      <div className="mt-2 h-4 w-full rounded bg-ink/10" />
      <div className="mt-1 h-4 w-2/3 rounded bg-ink/10" />
      <div className="mt-4 h-3 w-1/2 rounded bg-ink/10" />
    </div>
  );
}

export function MilestoneSkeleton() {
  return (
    <div className="card-neo animate-pulse p-5">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 rounded-full bg-ink/10" />
        <div className="h-5 w-16 rounded-full bg-ink/10" />
      </div>
      <div className="mt-4 h-6 w-2/3 rounded-lg bg-ink/10" />
      <div className="mt-2 h-4 w-full rounded bg-ink/10" />
      <div className="mt-4 h-10 w-full rounded-xl bg-ink/10" />
    </div>
  );
}
