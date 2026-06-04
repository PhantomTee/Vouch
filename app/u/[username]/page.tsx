import { ProofList } from "@/components/ProofList";

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Builder Profile</span>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl md:text-6xl">
        @{params.username.toUpperCase()}
      </h1>
      <p className="mt-3 max-w-3xl font-mono text-sm text-ink/60">
        Verified proofs published by this GitHub account.
      </p>
      <div className="mt-8">
        <ProofList githubLogin={params.username} />
      </div>
    </main>
  );
}
