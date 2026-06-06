import { getActiveNetworkConfig } from "@/lib/network";
import { env } from "@/lib/env";

export type JsonRpcResponse<T> = { jsonrpc: "2.0"; id: number; result?: T; error?: { code: number; message: string; data?: unknown } };

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function tatumRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (env.tatumApiKey) headers["x-api-key"] = env.tatumApiKey;
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  let lastError = "";

  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(getActiveNetworkConfig().tatumRpcUrl, { method: "POST", headers, body });
    const text = await response.text();
    let payload: JsonRpcResponse<T> | null = null;
    try { payload = JSON.parse(text) as JsonRpcResponse<T>; } catch { /* gateway may return plain text on rate limits */ }

    if (response.ok && payload && !payload.error && payload.result !== undefined) return payload.result;

    lastError = payload?.error?.message || text || `Tatum RPC request failed with ${response.status}`;
    if (!RETRYABLE_STATUS.has(response.status) || attempt === 3) break;

    const retryAfter = Number(response.headers.get("retry-after"));
    const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 350 * Math.pow(2, attempt);
    await sleep(backoffMs);
  }

  throw new Error(lastError);
}

export type TatumInfraStatus = {
  ok: boolean;
  label: string;
  detail: string;
  network: string;
  endpointName: string;
  latencyMs?: number;
  lastRead?: string;
};

export async function getRpcStatus(objectId?: string): Promise<TatumInfraStatus> {
  const config = getActiveNetworkConfig();
  const start = Date.now();
  try {
    const result = objectId
      ? await getObject(objectId) as { data?: { objectId?: string; previousTransaction?: string } }
      : await tatumRpc<{ protocolVersion?: string; attributes?: Record<string, unknown> }>("sui_getProtocolConfig", []);
    const latencyMs = Date.now() - start;
    let lastRead: string;
    if (objectId) {
      const objectResult = result as { data?: { objectId?: string; previousTransaction?: string } };
      lastRead = `Object ${objectId.slice(0, 10)}...${objectResult.data?.previousTransaction ? ` tx ${objectResult.data.previousTransaction.slice(0, 10)}...` : ""}`;
    } else {
      const protocolResult = result as { protocolVersion?: string };
      lastRead = `Protocol ${protocolResult.protocolVersion || "latest"}`;
    }
    return {
      ok: true,
      label: "Verified through Tatum Sui RPC",
      detail: `${lastRead} in ${latencyMs}ms`,
      network: config.name,
      endpointName: config.name === "mainnet" ? "Tatum Sui Mainnet gateway" : "Tatum Sui Testnet gateway",
      latencyMs,
      lastRead,
    };
  } catch (error) {
    return {
      ok: false,
      label: "Tatum Sui RPC unavailable",
      detail: error instanceof Error ? error.message : "Unknown RPC error",
      network: config.name,
      endpointName: config.name === "mainnet" ? "Tatum Sui Mainnet gateway" : "Tatum Sui Testnet gateway",
    };
  }
}

export async function getObject(objectId: string) { return tatumRpc("sui_getObject", [objectId, { showContent: true, showOwner: true, showPreviousTransaction: true, showDisplay: true }]); }
export async function queryCreatedEvents(packageId: string, limit = 20) { return tatumRpc("suix_queryEvents", [{ MoveEventType: `${packageId}::vouch::ProjectCreated` }, null, limit, true]); }
export async function queryMilestoneEvents(grantsPackageId: string, limit = 50) {
  return tatumRpc("suix_queryEvents", [{ MoveEventType: `${grantsPackageId}::grants::MilestoneCreated` }, null, limit, true]);
}

export async function queryFundedMilestoneEvents(grantsPackageId: string, limit = 50) {
  return tatumRpc("suix_queryEvents", [{ MoveEventType: `${grantsPackageId}::grants::MilestoneFunded` }, null, limit, true]);
}

export async function getObjectsBatch(ids: string[]) {
  return Promise.all(ids.map((id) => getObject(id)));
}

export async function resolveNameServiceNames(address: string): Promise<string | null> {
  try {
    const res = await tatumRpc<{ data: string[] }>("suix_resolveNameServiceNames", [address, null, 1]);
    return res.data?.[0] ?? null;
  } catch { return null; }
}
