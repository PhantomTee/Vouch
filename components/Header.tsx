import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

export function Header() {
  return <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6"><Link href="/" className="text-xl font-black tracking-tight">Vouch</Link><nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex"><Link href="/create">Create</Link><Link href="/explore">Explore</Link><Link href="/me">My Proofs</Link><a href="https://docs.wal.app/" target="_blank" rel="noreferrer">Walrus</a></nav><WalletButton /></div></header>;
}
