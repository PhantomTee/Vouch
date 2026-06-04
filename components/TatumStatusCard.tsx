"use client";
import { useEffect, useState } from "react";
import { getRpcStatus } from "@/lib/tatum/rpc";

export function TatumStatusCard() {
  const [status, setStatus] = useState<{ ok: boolean; label: string; detail: string } | null>(null);

  useEffect(() => { getRpcStatus().then(setStatus); }, []);

  return (
    <div className="card-neo p-6">
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 flex-shrink-0 rounded-full border-2 border-ink ${status?.ok ? "bg-brand-green" : "bg-gold"}`} />
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-ink">Tatum RPC</h3>
      </div>
      <p className="mt-4 font-mono text-sm text-ink/70">{status?.label ?? "Checking connection..."}</p>
      {status?.ok && <p className="mt-2 break-all font-mono text-xs text-ink/40">{status.detail}</p>}
    </div>
  );
}
