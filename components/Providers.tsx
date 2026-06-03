"use client";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { SuiClient, SuiHTTPTransport } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { env } from "@/lib/env";

const { networkConfig } = createNetworkConfig({
  testnet: { url: env.tatumRpcUrl },
  mainnet: { url: env.tatumRpcUrl }
});

function createTatumSuiClient(url: string) {
  // When url is /api/rpc (browser), no extra headers needed — proxy adds the API key server-side
  return new SuiClient({ transport: new SuiHTTPTransport({ url }) });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const network = env.suiNetwork === "mainnet" ? "mainnet" : "testnet";

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={network}
        createClient={(_network, config) => createTatumSuiClient(config.url)}
      >
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
