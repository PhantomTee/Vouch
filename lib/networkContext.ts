"use client";

import { createContext, useContext } from "react";
import { NETWORK_CONFIGS, type NetworkName, type NetworkConfig } from "@/lib/network";
export type { NetworkName } from "@/lib/network";

export type NetworkContextValue = {
  network: NetworkName;
  config: NetworkConfig;
  setNetwork: (n: NetworkName) => void;
};

export const NetworkContext = createContext<NetworkContextValue>({
  network: "testnet",
  config: NETWORK_CONFIGS.testnet,
  setNetwork: () => {},
});

export function useNetwork() { return useContext(NetworkContext); }
