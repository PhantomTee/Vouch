import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-4 border-ink bg-[#87CEEB]">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-4 px-4 sm:h-[68px] sm:px-6">
        <Link href="/" className="shrink-0 font-display text-xl tracking-tight text-ink sm:text-2xl">
          VOUCH
        </Link>
        <nav className="hidden items-center gap-6 font-mono text-xs font-bold uppercase tracking-widest text-ink md:flex">
          <Link href="/create" className="underline-offset-4 hover:underline">Create</Link>
          <Link href="/explore" className="underline-offset-4 hover:underline">Explore</Link>
          <Link href="/me" className="underline-offset-4 hover:underline">My Proofs</Link>
          <a href="https://docs.wal.app/" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">Walrus</a>
        </nav>
        <div className="shrink-0 max-w-[160px] sm:max-w-none">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
