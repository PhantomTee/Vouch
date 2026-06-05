export type NetworkName = "testnet" | "mainnet";

export type NetworkConfig = {
  name: NetworkName;
  tatumRpcUrl: string;
  walrusPublisherUrl: string;
  walrusAggregatorUrl: string;
  packageId: string;
  grantsPackageId: string;
  suiscanBase: string;
};

const isBrowser = typeof window !== "undefined";

export const NETWORK_CONFIGS: Record<NetworkName, NetworkConfig> = {
  testnet: {
    name: "testnet",
    tatumRpcUrl: isBrowser
      ? "/api/rpc"
      : (process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL || "https://sui-testnet.gateway.tatum.io"),
    walrusPublisherUrl: process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || "https://publisher.walrus-testnet.walrus.space",
    walrusAggregatorUrl: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || "https://aggregator.walrus-testnet.walrus.space",
    packageId: process.env.NEXT_PUBLIC_PACKAGE_ID || "",
    grantsPackageId: process.env.NEXT_PUBLIC_GRANTS_PACKAGE_ID || "",
    suiscanBase: "https://suiscan.xyz/testnet",
  },
  mainnet: {
    name: "mainnet",
    tatumRpcUrl: isBrowser
      ? "/api/rpc-mainnet"
      : (process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL_MAINNET || "https://sui-mainnet.gateway.tatum.io"),
    walrusPublisherUrl: process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL_MAINNET || "https://walrus-mainnet-publisher-1.staketab.org",
    walrusAggregatorUrl: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL_MAINNET || "https://aggregator.walrus-mainnet.walrus.space",
    packageId: process.env.NEXT_PUBLIC_PACKAGE_ID_MAINNET || "",
    grantsPackageId: process.env.NEXT_PUBLIC_GRANTS_PACKAGE_ID_MAINNET || "",
    suiscanBase: "https://suiscan.xyz/mainnet",
  },
};

// Module-level store so non-React lib functions (tatumRpc, uploadToWalrus, tx builders)
// always read the currently selected network without threading a param through every call.
// Initialise immediately from localStorage so the first upload/RPC call uses the right config
// before any React effect has had a chance to run.
let _active: NetworkName = (() => {
  if (typeof window === "undefined") return "testnet";
  try { return localStorage.getItem("vouch.network") === "mainnet" ? "mainnet" : "testnet"; }
  catch { return "testnet"; }
})();
export function setActiveNetwork(n: NetworkName) { _active = n; }
export function getActiveNetworkConfig(): NetworkConfig { return NETWORK_CONFIGS[_active]; }
