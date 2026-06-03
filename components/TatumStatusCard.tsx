"use client";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { getRpcStatus } from "@/lib/tatum/rpc";
export function TatumStatusCard() { const [status, setStatus] = useState<{ ok: boolean; label: string; detail: string } | null>(null); useEffect(() => { getRpcStatus().then(setStatus); }, []); return <div className="rounded-3xl border border-line bg-panel p-5"><div className="flex items-center gap-2"><Activity className={status?.ok ? "text-brand-green" : "text-brand-amber"} /><h3 className="font-bold">Tatum RPC</h3></div><p className="mt-3 text-sm text-slate-300">{status?.label || "Checking Tatum Sui RPC..."}</p><p className="mt-2 break-all text-xs text-slate-500">{status?.detail || "Lightweight sui_getProtocolConfig call"}</p></div>; }
