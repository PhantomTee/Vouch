import { getActiveNetworkConfig } from "@/lib/network";
import { env } from "@/lib/env";

export type JsonRpcResponse<T> = { jsonrpc: "2.0"; id: number; result?: T; error?: { code: number; message: string; data?: unknown } };

export async function tatumRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (env.tatumApiKey) headers["x-api-key"] = env.tatumApiKey;
  const response = await fetch(getActiveNetworkConfig().tatumRpcUrl, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  const payload = (await response.json()) as JsonRpcResponse<T>;
  if (!response.ok || payload.error || payload.result === undefined) throw new Error(payload.error?.message || `Tatum RPC request failed with ${response.status}`);
  return payload.result;
}

export async function getRpcStatus(): Promise<{ ok: boolean; label: string; detail: string }> {
  try { const result = await tatumRpc<{ protocolVersion?: string; attributes?: Record<string, unknown> }>("sui_getProtocolConfig", []); return { ok: true, label: "Tatum Sui RPC online", detail: `Protocol ${result.protocolVersion || "latest"} via ${env.tatumRpcUrl}` }; } catch (error) { return { ok: false, label: "Tatum Sui RPC unavailable", detail: error instanceof Error ? error.message : "Unknown RPC error" }; }
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
