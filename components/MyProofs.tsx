"use client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ProofList } from "@/components/ProofList";

export function MyProofs() {
  const account = useCurrentAccount();

  if (!account?.address) {
    return (
      <div className="card-neo p-8 text-center">
        <p className="font-display text-3xl text-ink">CONNECT YOUR WALLET.</p>
        <p className="mt-3 font-mono text-sm text-ink/60">
          Connect your Sui wallet to see locally cached proofs created by this browser.
        </p>
      </div>
    );
  }

  return <ProofList owner={account.address} />;
}
