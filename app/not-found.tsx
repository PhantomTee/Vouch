import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[72vh] flex-col items-center justify-center px-4 text-center">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Error</span>
      <h1 className="mt-6 font-display text-[120px] leading-none text-ink sm:text-[180px]">404</h1>
      <p className="mt-2 font-display text-2xl text-ink sm:text-3xl">PAGE NOT FOUND.</p>
      <p className="mx-auto mt-4 max-w-sm font-mono text-sm leading-relaxed text-ink/60">
        This proof does not exist, or the link is broken. Double-check the object ID and try again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-neo flex items-center gap-2 bg-ink px-6 py-3 text-sm text-white">
          Go home <ArrowRight size={14} />
        </Link>
        <Link href="/verify" className="btn-neo flex items-center gap-2 bg-white px-6 py-3 text-sm text-ink">
          Verify a proof
        </Link>
        <Link href="/explore" className="btn-neo flex items-center gap-2 bg-white px-6 py-3 text-sm text-ink">
          Explore proofs
        </Link>
      </div>
    </main>
  );
}
