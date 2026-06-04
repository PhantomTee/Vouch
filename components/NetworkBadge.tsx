import type { NetworkName } from "@/lib/network";

export function NetworkBadge({ network }: { network: NetworkName }) {
  return (
    <span
      className={`btn-neo px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${
        network === "mainnet" ? "bg-brand-green/20 text-ink" : "bg-ink/10 text-ink/50"
      }`}
    >
      {network}
    </span>
  );
}
