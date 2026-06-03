"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { ProofList } from "@/components/ProofList";

export function MyProofs() {
  const account = useCurrentAccount();

  if (!account?.address) {
    return (
      <div className="rounded-3xl border border-line bg-panel p-8 text-slate-400">
        Connect your Sui wallet to see locally cached proofs created by this browser.
      </div>
    );
  }

  return <ProofList owner={account.address} />;
}
