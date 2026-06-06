import { createHash } from "crypto";
import type { EvidenceManifestItem, VouchManifest, VouchNetwork } from "@/types/vouch";

type SuiObjectResponse = {
  data?: {
    objectId?: string;
    owner?: unknown;
    previousTransaction?: string;
    content?: { fields?: Record<string, unknown>; type?: string };
  };
};

export type ProofCheckContext = {
  label: string;
  status: "pass" | "fail" | "warning";
  detail: string;
};

export type ProofContext = {
  objectId: string;
  network: VouchNetwork;
  sui: {
    objectExists: boolean;
    readVia: "Tatum Sui RPC";
    owner: string;
    previousTransaction: string;
    manifestBlobId: string;
    manifestHash: string;
    timestamp: string;
    objectType: string;
  };
  walrus: {
    manifestBlobId: string;
    evidence: EvidenceManifestItem[];
    manifestFetchOk: boolean;
    manifestHashMatches: boolean;
  };
  manifest: VouchManifest | null;
  checks: ProofCheckContext[];
};

function networkFromInput(value: unknown): VouchNetwork {
  return value === "mainnet" || value === "devnet" ? value : "testnet";
}

function endpointFor(network: VouchNetwork) {
  if (network === "mainnet") {
    return {
      rpcUrl: process.env.TATUM_SUI_RPC_URL_MAINNET || "https://sui-mainnet.gateway.tatum.io",
      apiKey: process.env.TATUM_API_KEY_MAINNET || "",
      aggregators: [
        process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL_MAINNET,
        "https://aggregator.walrus-mainnet.walrus.space",
      ].filter(Boolean) as string[],
    };
  }

  return {
    rpcUrl: process.env.TATUM_SUI_RPC_URL || "https://sui-testnet.gateway.tatum.io",
    apiKey: process.env.TATUM_API_KEY || "",
    aggregators: [
      process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL,
      "https://aggregator.walrus-testnet.walrus.space",
    ].filter(Boolean) as string[],
  };
}

function fieldString(fields: Record<string, unknown> | undefined, key: string): string {
  const value = fields?.[key];
  return typeof value === "string" ? value : "";
}

function normalizeBase(url: string) {
  return url.replace(/\/$/, "");
}

async function tatumRpc<T>(network: VouchNetwork, method: string, params: unknown[]): Promise<T> {
  const { rpcUrl, apiKey } = endpointFor(network);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const payload = await response.json() as { result?: T; error?: { message?: string } };
  if (!response.ok || payload.error || payload.result === undefined) {
    throw new Error(payload.error?.message || `Tatum RPC request failed with ${response.status}`);
  }
  return payload.result;
}

async function fetchManifest(network: VouchNetwork, blobId: string) {
  let lastMessage = "";
  for (const base of Array.from(new Set(endpointFor(network).aggregators.map(normalizeBase)))) {
    const response = await fetch(`${base}/v1/blobs/${encodeURIComponent(blobId)}`);
    const text = await response.text();
    if (response.ok) return { ok: true as const, text };
    lastMessage = `Walrus fetch failed with ${response.status}: ${text}`;
  }
  return { ok: false as const, message: lastMessage || "Walrus fetch failed." };
}

function sha256(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

export async function getProofContext(objectId: string, networkInput?: unknown): Promise<ProofContext> {
  const network = networkFromInput(networkInput);
  const object = await tatumRpc<SuiObjectResponse>(network, "sui_getObject", [
    objectId,
    { showContent: true, showOwner: true, showPreviousTransaction: true },
  ]);
  const fields = object.data?.content?.fields;
  const manifestBlobId = fieldString(fields, "manifest_blob_id");
  const manifestHash = fieldString(fields, "manifest_hash");
  const owner = fieldString(fields, "owner");
  const createdAtMs = fieldString(fields, "created_at_ms");

  let manifest: VouchManifest | null = null;
  let manifestFetchOk = false;
  let manifestHashMatches = false;
  const evidence: EvidenceManifestItem[] = [];

  if (manifestBlobId) {
    const fetched = await fetchManifest(network, manifestBlobId);
    if (fetched.ok) {
      manifestFetchOk = true;
      manifestHashMatches = sha256(fetched.text) === manifestHash;
      try {
        manifest = JSON.parse(fetched.text) as VouchManifest;
        evidence.push(...(manifest.evidence || []));
      } catch {
        manifest = null;
      }
    }
  }

  const manifestWallet = manifest?.builder?.wallet || "";
  const timestamp = createdAtMs ? new Date(Number(createdAtMs)).toISOString() : "";
  const checks: ProofCheckContext[] = [
    { label: "Sui proof object exists", status: object.data ? "pass" : "fail", detail: objectId },
    { label: "Proof was read using Tatum RPC", status: "pass", detail: "Verified through Tatum Sui RPC" },
    { label: "Manifest hash matches", status: manifestHashMatches ? "pass" : "fail", detail: manifestHash || "Missing manifest hash" },
    { label: "Walrus evidence is present", status: evidence.length ? "pass" : "warning", detail: `${evidence.length} evidence file${evidence.length === 1 ? "" : "s"}` },
    { label: "GitHub repo URL exists in metadata", status: manifest?.links?.repo ? "pass" : "fail", detail: manifest?.links?.repo || "Missing" },
    { label: "Demo URL exists in metadata", status: manifest?.links?.demo ? "pass" : "fail", detail: manifest?.links?.demo || "Missing" },
    {
      label: "Wallet address matches proof creator",
      status: owner && manifestWallet && owner.toLowerCase() === manifestWallet.toLowerCase() ? "pass" : "warning",
      detail: manifestWallet ? "Manifest wallet compared with on-chain owner" : "Manifest wallet unavailable",
    },
    { label: "Network and timestamp visible", status: network && timestamp ? "pass" : "warning", detail: `${network} ${timestamp}` },
  ];

  return {
    objectId,
    network,
    sui: {
      objectExists: Boolean(object.data),
      readVia: "Tatum Sui RPC",
      owner,
      previousTransaction: object.data?.previousTransaction || "",
      manifestBlobId,
      manifestHash,
      timestamp,
      objectType: object.data?.content?.type || "",
    },
    walrus: { manifestBlobId, evidence, manifestFetchOk, manifestHashMatches },
    manifest,
    checks,
  };
}
