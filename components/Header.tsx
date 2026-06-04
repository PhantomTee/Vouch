"use client";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { WalletButton } from "@/components/WalletButton";
import { useNetwork } from "@/lib/network";

const navLinks: { href: string; label: string; external?: boolean }[] = [
  { href: "/create", label: "Create" },
  { href: "/explore", label: "Explore" },
  { href: "/grants", label: "Grants" },
  { href: "/me", label: "My Proofs" },
  { href: "/how-to-use", label: "How to Use" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { network, setNetwork } = useNetwork();

  return (
    <header className="sticky top-0 z-40 border-b-4 border-ink bg-[#87CEEB]">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-4 px-4 sm:h-[68px] sm:px-6">
        <Link href="/" className="shrink-0 font-display text-xl tracking-tight text-ink sm:text-2xl">
          VOUCH
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 font-mono text-xs font-bold uppercase tracking-widest text-ink md:flex">
          {navLinks.map((l) =>
            l.external ? (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">{l.label}</a>
            ) : (
              <Link key={l.href} href={l.href} className="underline-offset-4 hover:underline">{l.label}</Link>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setNetwork(network === "testnet" ? "mainnet" : "testnet")}
            className={`hidden items-center rounded-xl border-2 border-ink px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest md:flex ${
              network === "mainnet" ? "bg-brand-green/20 text-ink" : "bg-white text-ink/50"
            }`}
          >
            {network}
          </button>
          {/* GitHub identity */}
          {session?.user ? (
            <button
              onClick={() => signOut()}
              className="hidden items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 py-1.5 font-mono text-xs font-bold text-ink hover:bg-gold/30 md:flex"
              title="Sign out of GitHub"
            >
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="h-5 w-5 rounded-full border border-ink" />
              )}
              {session.user.login}
            </button>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="hidden items-center gap-1.5 rounded-xl border-2 border-ink bg-ink px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-ink/80 md:flex"
            >
              Sign in with GitHub
            </button>
          )}
          <WalletButton />
          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center rounded-xl border-2 border-ink bg-white p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Full-screen mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#87CEEB] md:hidden">
          {/* Overlay header row */}
          <div className="flex h-[60px] items-center justify-between border-b-4 border-ink px-4 sm:h-[68px] sm:px-6">
            <Link href="/" className="font-display text-xl tracking-tight text-ink sm:text-2xl" onClick={() => setOpen(false)}>
              VOUCH
            </Link>
            <button
              className="flex items-center justify-center rounded-xl border-2 border-ink bg-white p-2"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col px-4 pt-4">
            {navLinks.map((l) =>
              l.external ? (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="block border-b-2 border-ink/10 py-5 font-display text-3xl text-ink"
                >{l.label}</a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b-2 border-ink/10 py-5 font-display text-3xl text-ink"
                >{l.label}</Link>
              )
            )}

            {/* Network toggle */}
            <button
              onClick={() => { setNetwork(network === "testnet" ? "mainnet" : "testnet"); setOpen(false); }}
              className={`mt-4 w-full rounded-2xl border-2 border-ink px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest ${
                network === "mainnet" ? "bg-brand-green/20 text-ink" : "bg-white text-ink/50"
              }`}
            >
              {network === "testnet" ? "Switch to Mainnet" : "Switch to Testnet"}
            </button>

            {/* GitHub identity */}
            <div className="mt-auto pb-8 pt-6">
              {session?.user ? (
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-2xl border-2 border-ink bg-white px-4 py-3 font-mono text-sm font-bold text-ink"
                >
                  {session.user.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="" className="h-8 w-8 rounded-full border border-ink" />
                  )}
                  <span>@{session.user.login}</span>
                  <span className="ml-auto text-ink/50">Sign out</span>
                </button>
              ) : (
                <button
                  onClick={() => { signIn("github"); setOpen(false); }}
                  className="w-full rounded-2xl border-2 border-ink bg-ink px-4 py-4 font-mono text-sm font-bold text-white"
                >
                  Sign in with GitHub
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
