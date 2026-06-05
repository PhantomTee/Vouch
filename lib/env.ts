export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Vouch",
  suiNetwork: process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet",
  tatumRpcUrl: typeof window !== "undefined"
    ? "/api/rpc"
    : (process.env.TATUM_SUI_RPC_URL || "https://sui-testnet.gateway.tatum.io"),
  // Server-only: TATUM_API_KEY is intentionally not NEXT_PUBLIC_; on the client
  // all Tatum requests go through /api/rpc or /api/rpc-mainnet which add the key.
  tatumApiKey: process.env.TATUM_API_KEY || "",
  packageId: process.env.NEXT_PUBLIC_PACKAGE_ID || "",
  registryId: process.env.NEXT_PUBLIC_REGISTRY_ID || "",
  walrusPublisherUrl: process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || "",
  walrusAggregatorUrl: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || "",
  grantsPackageId: process.env.NEXT_PUBLIC_GRANTS_PACKAGE_ID || "",
  // Mainnet
  packageIdMainnet: process.env.NEXT_PUBLIC_PACKAGE_ID_MAINNET || "",
  grantsPackageIdMainnet: process.env.NEXT_PUBLIC_GRANTS_PACKAGE_ID_MAINNET || "",
};
