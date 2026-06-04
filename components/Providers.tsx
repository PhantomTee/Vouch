"use client";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { SuiClient, SuiHTTPTransport } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import { NETWORK_CONFIGS, setActiveNetwork, type NetworkName } from "@/lib/network";
import { NetworkContext } from "@/lib/networkContext";
import { NetworkAutoDetect } from "@/components/NetworkAutoDetect";

const suiNetworks = {
  testnet: { url: typeof window !== "undefined" ? "/api/rpc" : (process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL || "https://sui-testnet.gateway.tatum.io") },
  mainnet: { url: typeof window !== "undefined" ? "/api/rpc-mainnet" : (process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL_MAINNET || "https://sui-mainnet.gateway.tatum.io") },
};

function createTatumSuiClient(url: string) {
  return new SuiClient({ transport: new SuiHTTPTransport({ url }) });
}

function readStoredNetwork(): NetworkName {
  if (typeof window === "undefined") return "testnet";
  const stored = localStorage.getItem("vouch.network");
  return stored === "mainnet" ? "mainnet" : "testnet";
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [network, setNetworkState] = useState<NetworkName>(readStoredNetwork);

  useEffect(() => {
    setActiveNetwork(network);
    localStorage.setItem("vouch.network", network);
  }, [network]);

  function setNetwork(n: NetworkName) {
    setActiveNetwork(n);
    setNetworkState(n);
    localStorage.setItem("vouch.network", n);
  }

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NetworkContext.Provider value={{ network, config: NETWORK_CONFIGS[network], setNetwork }}>
          <SuiClientProvider
            networks={suiNetworks}
            network={network}
            createClient={(_n, config) => createTatumSuiClient(config.url)}
          >
            <WalletProvider autoConnect>
              <NetworkAutoDetect />
              {children}
            </WalletProvider>
          </SuiClientProvider>
        </NetworkContext.Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
