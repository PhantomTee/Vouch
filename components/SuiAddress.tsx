"use client";

import { useEffect, useState } from "react";
import { resolveNameServiceNames } from "@/lib/tatum/rpc";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function SuiAddress({ address }: { address: string }) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    resolveNameServiceNames(address).then(setName);
  }, [address]);

  return (
    <span title={address}>
      {name ?? shorten(address)}
    </span>
  );
}
