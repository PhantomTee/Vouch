"use client";

import { useEffect } from "react";
import { useNetwork } from "@/lib/networkContext";

export function NetworkTheme() {
  const { network } = useNetwork();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-mainnet", network === "mainnet");
    root.classList.toggle("theme-testnet", network === "testnet");
  }, [network]);
  return null;
}
