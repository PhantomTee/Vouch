import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-4 border-ink bg-[#87CEEB]">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          VOUCH
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-xs font-bold uppercase tracking-widest text-ink md:flex">
          <Link href="/create" className="underline-offset-4 hover:underline">Create</Link>
          <Link href="/explore" className="underline-offset-4 hover:underline">Explore</Link>
          <Link href="/me" className="underline-offset-4 hover:underline">My Proofs</Link>
          <a href="https://docs.wal.app/" target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">Walrus</a>
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}
