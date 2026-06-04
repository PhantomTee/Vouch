"use client";

import { ConnectModal, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useState } from "react";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);

  if (account) {
    return (
      <button
        onClick={() => disconnect()}
        title={`${account.address}\n\nClick to disconnect`}
        className="btn-neo bg-white px-3 py-2 font-mono text-xs font-bold text-ink hover:bg-coral/10"
      >
        {shorten(account.address)}
      </button>
    );
  }

  return (
    <ConnectModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          onClick={() => setOpen(true)}
          className="btn-neo bg-ink px-3 py-2 font-mono text-xs font-bold text-white"
        >
          <span className="sm:hidden">Connect</span>
          <span className="hidden sm:inline">Connect Wallet</span>
        </button>
      }
    />
  );
}
