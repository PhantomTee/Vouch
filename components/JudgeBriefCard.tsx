"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { VouchNetwork } from "@/types/vouch";

type Brief = {
  summary: string;
  strengths: string[];
  missingSignals: string[];
  judgeNotes: string[];
  source: "groq" | "fallback";
};

export function JudgeBriefCard({ objectId, network }: { objectId: string; network: VouchNetwork }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [status, setStatus] = useState("Generating judge brief...");

  useEffect(() => {
    let active = true;
    setStatus("Generating judge brief...");
    fetch("/api/ai/judge-brief", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objectId, network }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Judge brief failed.");
        if (active) {
          setBrief(payload.brief);
          setStatus("");
        }
      })
      .catch((error) => {
        if (active) setStatus(error instanceof Error ? error.message : "Judge brief unavailable.");
      });
    return () => { active = false; };
  }, [objectId, network]);

  return (
    <div className="card-neo p-5">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-gold" />
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink">AI Judge Brief</p>
      </div>
      <p className="mt-3 font-mono text-xs leading-relaxed text-ink/50">
        Summarizes public proof metadata. Walrus, Sui, and Tatum checks remain the source of truth.
      </p>
      {status ? <p className="mt-4 font-mono text-sm text-ink/60">{status}</p> : null}
      {brief ? (
        <div className="mt-4 space-y-4">
          <p className="font-mono text-sm leading-relaxed text-ink/75">{brief.summary}</p>
          <BriefList title="Strengths" items={brief.strengths} />
          <BriefList title="Review" items={brief.missingSignals.length ? brief.missingSignals : ["No major missing signals detected in the public proof metadata."]} />
          <BriefList title="Judge notes" items={brief.judgeNotes} />
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/30">
            Source: {brief.source === "groq" ? "Groq" : "local fallback"}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="font-mono text-xs leading-relaxed text-ink/70">- {item}</li>
        ))}
      </ul>
    </div>
  );
}
