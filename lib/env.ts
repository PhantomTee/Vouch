export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Vouch",
  suiNetwork: process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet",
  // In the browser, route through /api/rpc to avoid Tatum CORS rejecting SDK headers
  tatumRpcUrl: typeof window !== "undefined"
    ? "/api/rpc"
    : (process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL || "https://sui-testnet.gateway.tatum.io"),
  tatumApiKey: process.env.NEXT_PUBLIC_TATUM_API_KEY || "",
  packageId: process.env.NEXT_PUBLIC_PACKAGE_ID || "",
  registryId: process.env.NEXT_PUBLIC_REGISTRY_ID || "",
  walrusPublisherUrl: process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || "",
  walrusAggregatorUrl: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || "",
  grantsPackageId: process.env.NEXT_PUBLIC_GRANTS_PACKAGE_ID || "",
};
