"use client";
import { useEffect, useState } from "react";
import { getRpcStatus, type TatumInfraStatus } from "@/lib/tatum/rpc";

export function TatumStatusCard({ objectId }: { objectId?: string }) {
  const [status, setStatus] = useState<TatumInfraStatus | null>(null);

  useEffect(() => { getRpcStatus(objectId).then(setStatus); }, [objectId]);

  return (
    <div className="card-neo p-6">
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 flex-shrink-0 rounded-full border-2 border-ink ${status?.ok ? "bg-brand-green" : "bg-gold"}`} />
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-ink">Tatum Infra Status</h3>
      </div>
      <p className="mt-4 font-mono text-sm font-bold text-ink">{status?.label ?? "Checking Tatum Sui RPC..."}</p>
      <div className="mt-4 space-y-2 font-mono text-xs text-ink/70">
        <Row label="Active network" value={status?.network || "Checking"} />
        <Row label="RPC endpoint" value={status?.endpointName || "Tatum Sui gateway"} />
        <Row label="Latest check" value={status ? (status.ok ? "PASS" : "FAIL") : "Pending"} />
        <Row label="Last object/event read" value={status?.lastRead || "Protocol status check"} />
        <Row label="Latency" value={status?.latencyMs ? `${status.latencyMs}ms` : "Pending"} />
      </div>
      {status && !status.ok ? <p className="mt-3 break-all font-mono text-xs text-coral">{status.detail}</p> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-ink/40">{label}</span>
      <span className="break-all text-right font-bold text-ink">{value}</span>
    </div>
  );
}
