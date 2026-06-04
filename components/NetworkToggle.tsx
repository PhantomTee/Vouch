"use client";

import { toast } from "sonner";
import { useNetwork, type NetworkName } from "@/lib/networkContext";

export function NetworkToggle() {
  const { network, setNetwork } = useNetwork();
  const isMainnet = network === "mainnet";

  function toggle() {
    const next: NetworkName = isMainnet ? "testnet" : "mainnet";
    setNetwork(next);
    toast(`Switched to ${next}`, {
      description: `Switch your wallet to ${next} too to sign transactions.`,
      duration: 6000,
    });
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isMainnet ? "testnet" : "mainnet"}`}
      className="group flex items-center gap-0 rounded-xl border-2 border-ink overflow-hidden shadow-neo-sm shrink-0"
    >
      <span
        className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
          !isMainnet ? "bg-ink text-white" : "bg-white text-ink/40 group-hover:text-ink/60"
        }`}
      >
        Testnet
      </span>
      <span className="w-px self-stretch bg-ink" />
      <span
        className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
          isMainnet ? "bg-[#87CEEB] text-ink" : "bg-white text-ink/40 group-hover:text-ink/60"
        }`}
      >
        Mainnet
      </span>
    </button>
  );
}
