import { getActiveNetworkConfig } from "@/lib/network";

export type WalrusUploadResult = { ok: true; blobId: string; raw: unknown } | { ok: false; message: string; setupHint: string };

type WalrusStoreResponse = { newlyCreated?: { blobObject?: { blobId?: string }; blobId?: string }; alreadyCertified?: { blobId?: string }; blobId?: string; blob_id?: string };

const FALLBACK_AGGREGATORS = {
  testnet: "https://aggregator.walrus-testnet.walrus.space",
  mainnet: "https://aggregator.walrus-mainnet.walrus.space",
};

function normalizeBase(url: string) { return url.replace(/\/$/, ""); }
function extractBlobId(data: WalrusStoreResponse): string | undefined { return data.newlyCreated?.blobObject?.blobId || data.newlyCreated?.blobId || data.alreadyCertified?.blobId || data.blobId || data.blob_id; }

function getWalrusBlobUrls(blobId: string): string[] {
  const { name, walrusAggregatorUrl } = getActiveNetworkConfig();
  if (!walrusAggregatorUrl || !blobId) return [];
  const bases = [walrusAggregatorUrl, FALLBACK_AGGREGATORS[name]];
  return Array.from(new Set(bases.filter(Boolean).map(normalizeBase)))
    .map((base) => `${base}/v1/blobs/${encodeURIComponent(blobId)}`);
}

export function getWalrusBlobUrl(blobId: string): string {
  return getWalrusBlobUrls(blobId)[0] || "";
}

export async function uploadToWalrus(body: Blob | string, contentType = "application/octet-stream"): Promise<WalrusUploadResult> {
  const { walrusPublisherUrl } = getActiveNetworkConfig();
  if (!walrusPublisherUrl) return { ok: false, message: "Walrus publisher URL is not configured.", setupHint: "Set NEXT_PUBLIC_WALRUS_PUBLISHER_URL to a Walrus publisher endpoint. Vouch will not fake successful uploads." };
  const response = await fetch(`${normalizeBase(walrusPublisherUrl)}/v1/blobs`, { method: "PUT", headers: { "content-type": contentType }, body });
  const text = await response.text();
  if (!response.ok) {
    const isServerError = response.status >= 500;
    const hint = isServerError
      ? "The Walrus mainnet publisher returned a server error. Try switching to Testnet in the network toggle, or retry in a few minutes — publisher nodes are operated by third parties and may have intermittent downtime."
      : "Check publisher availability, CORS, and Walrus testnet/mainnet config.";
    return { ok: false, message: `Walrus upload failed with ${response.status}: ${text}`, setupHint: hint };
  }
  let data: WalrusStoreResponse;
  try { data = JSON.parse(text) as WalrusStoreResponse; } catch { return { ok: false, message: "Walrus publisher returned non-JSON response.", setupHint: "Use a publisher compatible with the Walrus HTTP store API." }; }
  const blobId = extractBlobId(data);
  if (!blobId) return { ok: false, message: "Walrus response did not include a blob ID.", setupHint: "Inspect the publisher response and update lib/walrus/client.ts if the API shape changed." };
  return { ok: true, blobId, raw: data };
}

export async function fetchWalrusBlob(blobId: string): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  const { walrusAggregatorUrl } = getActiveNetworkConfig();
  if (!walrusAggregatorUrl) return { ok: false, message: "Walrus aggregator URL is not configured. Set NEXT_PUBLIC_WALRUS_AGGREGATOR_URL to fetch manifests." };
  let lastMessage = "";
  for (const url of getWalrusBlobUrls(blobId)) {
    const response = await fetch(url);
    const text = await response.text();
    if (response.ok) return { ok: true, text };
    lastMessage = `Walrus fetch failed with ${response.status}: ${text}`;
  }
  return { ok: false, message: lastMessage || "Walrus fetch failed." };
}

export async function fetchWalrusBlobRaw(blobId: string): Promise<{ ok: true; data: ArrayBuffer } | { ok: false; message: string }> {
  const { walrusAggregatorUrl } = getActiveNetworkConfig();
  if (!walrusAggregatorUrl) return { ok: false, message: "Walrus aggregator URL is not configured." };
  let lastMessage = "";
  for (const url of getWalrusBlobUrls(blobId)) {
    const response = await fetch(url);
    if (response.ok) return { ok: true, data: await response.arrayBuffer() };
    lastMessage = `Walrus fetch failed with ${response.status}`;
  }
  return { ok: false, message: lastMessage || "Walrus fetch failed." };
}
