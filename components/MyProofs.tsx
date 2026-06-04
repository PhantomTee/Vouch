"use client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ProofList } from "@/components/ProofList";

export function MyProofs() {
  const account = useCurrentAccount();
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Identity cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* GitHub card */}
        <div className={`card-neo p-5 ${session?.user ? "bg-brand-green/10" : "bg-white"}`}>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">GitHub Identity</p>
          {session?.user ? (
            <div className="mt-3 flex items-center gap-3">
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="h-12 w-12 rounded-full border-2 border-ink" />
              )}
              <div className="min-w-0">
                <p className="font-display text-xl text-ink">{session.user.name}</p>
                <a href={session.user.githubUrl} target="_blank" rel="noreferrer" className="font-mono text-xs text-brand-blue hover:underline">
                  @{session.user.login}
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-mono text-sm text-ink/60">Not signed in</p>
              <button onClick={() => signIn("github")} className="btn-neo mt-3 bg-ink px-4 py-2 text-xs text-white">
                Sign in with GitHub
              </button>
            </div>
          )}
          {session?.user && (
            <div className="mt-3 flex gap-2">
              <Link href={`/u/${session.user.login}`} className="btn-neo bg-white px-3 py-1.5 text-xs text-ink">
                Public profile
              </Link>
              <button onClick={() => signOut()} className="btn-neo bg-white px-3 py-1.5 text-xs text-ink">
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Wallet card */}
        <div className={`card-neo p-5 ${account?.address ? "bg-gold/20" : "bg-white"}`}>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">Sui Wallet</p>
          {account?.address ? (
            <div className="mt-3">
              <p className="font-display text-xl text-ink">Connected</p>
              <p className="mt-1 break-all font-mono text-xs text-ink/60">{account.address}</p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-mono text-sm text-ink/60">No wallet connected</p>
              <p className="mt-1 font-mono text-xs text-ink/40">Connect via the button in the header.</p>
            </div>
          )}
        </div>
      </div>

      {/* Proofs */}
      {!account?.address ? (
        <div className="card-neo p-8 text-center">
          <p className="font-display text-3xl text-ink">CONNECT YOUR WALLET.</p>
          <p className="mt-3 font-mono text-sm text-ink/60">Connect your Sui wallet to see your proofs.</p>
        </div>
      ) : (
        <ProofList owner={account.address} />
      )}
    </div>
  );
}
