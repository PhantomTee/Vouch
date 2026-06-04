"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";
import { useNetwork } from "@/lib/networkContext";

export function NetworkAutoDetect() {
  const account = useCurrentAccount();
  const { setNetwork } = useNetwork();

  useEffect(() => {
    if (!account) return;
    const chain = account.chains?.[0] as string | undefined;
    if (chain === "sui:mainnet") setNetwork("mainnet");
    else if (chain === "sui:testnet") setNetwork("testnet");
  }, [account?.chains?.[0]]);  // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
