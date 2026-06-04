import { env } from "@/lib/env";

export type WalrusUploadResult = { ok: true; blobId: string; raw: unknown } | { ok: false; message: string; setupHint: string };

type WalrusStoreResponse = { newlyCreated?: { blobObject?: { blobId?: string }; blobId?: string }; alreadyCertified?: { blobId?: string }; blobId?: string; blob_id?: string };

function normalizeBase(url: string) { return url.replace(/\/$/, ""); }
function extractBlobId(data: WalrusStoreResponse): string | undefined { return data.newlyCreated?.blobObject?.blobId || data.newlyCreated?.blobId || data.alreadyCertified?.blobId || data.blobId || data.blob_id; }

export async function uploadToWalrus(body: Blob | string, contentType = "application/octet-stream"): Promise<WalrusUploadResult> {
  if (!env.walrusPublisherUrl) return { ok: false, message: "Walrus publisher URL is not configured.", setupHint: "Set NEXT_PUBLIC_WALRUS_PUBLISHER_URL to a Walrus publisher endpoint. Vouch will not fake successful uploads." };
  const response = await fetch(`${normalizeBase(env.walrusPublisherUrl)}/v1/blobs`, { method: "PUT", headers: { "content-type": contentType }, body });
  const text = await response.text();
  if (!response.ok) return { ok: false, message: `Walrus upload failed with ${response.status}: ${text}`, setupHint: "Check publisher availability, CORS, and Walrus testnet/mainnet config." };
  let data: WalrusStoreResponse;
  try { data = JSON.parse(text) as WalrusStoreResponse; } catch { return { ok: false, message: "Walrus publisher returned non-JSON response.", setupHint: "Use a publisher compatible with the Walrus HTTP store API." }; }
  const blobId = extractBlobId(data);
  if (!blobId) return { ok: false, message: "Walrus response did not include a blob ID.", setupHint: "Inspect the publisher response and update lib/walrus/client.ts if the API shape changed." };
  return { ok: true, blobId, raw: data };
}

export async function fetchWalrusBlob(blobId: string): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  if (!env.walrusAggregatorUrl) return { ok: false, message: "Walrus aggregator URL is not configured. Set NEXT_PUBLIC_WALRUS_AGGREGATOR_URL to fetch manifests." };
  const response = await fetch(`${normalizeBase(env.walrusAggregatorUrl)}/v1/blobs/${encodeURIComponent(blobId)}`);
  const text = await response.text();
  return response.ok ? { ok: true, text } : { ok: false, message: `Walrus fetch failed with ${response.status}: ${text}` };
}

export async function fetchWalrusBlobRaw(blobId: string): Promise<{ ok: true; data: ArrayBuffer } | { ok: false; message: string }> {
  if (!env.walrusAggregatorUrl) return { ok: false, message: "Walrus aggregator URL is not configured." };
  const response = await fetch(`${normalizeBase(env.walrusAggregatorUrl)}/v1/blobs/${encodeURIComponent(blobId)}`);
  if (!response.ok) return { ok: false, message: `Walrus fetch failed with ${response.status}` };
  return { ok: true, data: await response.arrayBuffer() };
}
