"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { StoredProof } from "@/types/vouch";

export function ProofList({ owner }: { owner?: string }) {
  const [proofs, setProofs] = useState<StoredProof[]>([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("vouch.proofs") || "[]") as StoredProof[];
    setProofs(owner ? all.filter((p) => p.owner === owner) : all);
  }, [owner]);

  if (!proofs.length) {
    return (
      <div className="card-neo p-8 text-center">
        <p className="font-display text-3xl text-ink">NO PROOFS YET.</p>
        <p className="mt-3 font-mono text-sm text-ink/60">
          Create a Vouch first. Full event indexing can be added later with Sui{" "}
          <code className="rounded bg-ink/10 px-1">suix_queryEvents</code> over{" "}
          <code className="rounded bg-ink/10 px-1">ProjectCreated</code> events.
        </p>
        <Link href="/create" className="btn-neo mt-6 inline-flex bg-ink px-6 py-3 text-sm text-white">
          Create your first Vouch
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {proofs.map((proof) => (
        <Link
          href={`/vouch/${proof.objectId}`}
          key={proof.objectId}
          className="card-neo block p-6 transition-transform hover:-translate-y-1"
        >
          <span className="btn-neo inline-block bg-gold px-3 py-1 text-xs text-ink">
            v{proof.version} · {proof.category}
          </span>
          <h2 className="mt-4 font-display text-3xl text-ink">{proof.title.toUpperCase()}</h2>
          <p className="mt-2 font-mono text-sm text-ink/60">{proof.tagline}</p>
          <p className="mt-4 truncate font-mono text-xs text-ink/40">{proof.objectId}</p>
        </Link>
      ))}
    </div>
  );
}
