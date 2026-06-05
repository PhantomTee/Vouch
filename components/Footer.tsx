import Link from "next/link";

const NAV = [
  { heading: "Product", links: [
    { href: "/create", label: "Create proof" },
    { href: "/explore", label: "Explore" },
    { href: "/verify", label: "Verify" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/grants", label: "Grants" },
  ]},
  { heading: "Use cases", links: [
    { href: "/hackathons", label: "HackProof" },
    { href: "/grant-programs", label: "GrantOS" },
  ]},
];

const CONTRACTS = [
  { label: "Testnet", id: "0xe68c1d20ae6414b9aae84c363686b724e95d71d4d934c2b4b70096b13ce4a99d" },
  { label: "Mainnet", id: "0x62aea664bb9246385964f43ee0ebc87d1024e4ab6c59e47f70402f1550cd0927" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t-4 border-ink bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-display text-4xl text-white">VOUCH</p>
            <p className="mt-4 font-mono text-xs leading-relaxed text-white/50">
              Proof-of-build registry for Sui. Anchor evidence on Walrus, lock the hash on-chain, verify it anywhere.
            </p>
            <a
              href="https://github.com/PhantomTee/Vouch"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-white/40 hover:text-white transition-colors"
            >
              GitHub source →
            </a>
          </div>

          {/* Nav columns */}
          {NAV.map((col) => (
            <div key={col.heading}>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-white/30">{col.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="font-mono text-sm text-white/60 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contracts */}
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white/30">Contracts</p>
            <div className="mt-4 space-y-4">
              {CONTRACTS.map((c) => (
                <div key={c.label}>
                  <p className="font-mono text-xs text-white/30">{c.label}</p>
                  <p className="mt-1 break-all font-mono text-xs text-white/60">{c.id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="font-mono text-xs text-white/30">
            Built with Walrus · Sui · Tatum RPC · Next.js
          </p>
          <p className="font-mono text-xs text-white/30">
            Vouch — every build, verifiable forever
          </p>
        </div>
      </div>
    </footer>
  );
}
