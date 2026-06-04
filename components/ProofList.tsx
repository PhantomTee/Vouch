"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const CATEGORIES = ["All", "DeFi", "Gaming", "Infrastructure", "Tooling", "Social", "Public goods", "Other"];
import type { StoredProof } from "@/types/vouch";
import { queryCreatedEvents } from "@/lib/tatum/rpc";
import { env } from "@/lib/env";

type EventsResult = {
  data: Array<{
    id: { txDigest: string; eventSeq: string };
    parsedJson: {
      project_id: string;
      owner: string;
      title: string;
      manifest_blob_id: string;
      manifest_hash: string;
      created_at_ms: string;
    };
  }>;
};

export function ProofList({ owner, githubLogin }: { owner?: string; githubLogin?: string }) {
  const [proofs, setProofs] = useState<StoredProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem("vouch.proofs") || "[]") as StoredProof[];

    if (!env.packageId) {
      let fallback = owner ? cached.filter((p) => p.owner === owner) : cached;
      if (githubLogin) fallback = fallback.filter((p) => p.manifest?.builder?.links?.github?.toLowerCase().includes(githubLogin.toLowerCase()));
      setProofs(fallback);
      setLoading(false);
      return;
    }

    queryCreatedEvents(env.packageId)
      .then((res) => {
        const events = (res as EventsResult).data ?? [];
        const fromChain: StoredProof[] = events.map((e) => ({
          objectId: e.parsedJson.project_id,
          txDigest: e.id.txDigest,
          owner: e.parsedJson.owner,
          manifestBlobId: e.parsedJson.manifest_blob_id,
          manifestHash: e.parsedJson.manifest_hash,
          title: e.parsedJson.title,
          tagline: "",
          category: "",
          createdAt: e.parsedJson.created_at_ms
            ? new Date(Number(e.parsedJson.created_at_ms)).toISOString()
            : "",
          version: 1,
          manifest: {} as StoredProof["manifest"],
        }));

        // Cached entries take precedence (they have full manifest data).
        const byId = new Map<string, StoredProof>();
        for (const p of fromChain) byId.set(p.objectId, p);
        for (const p of cached) byId.set(p.objectId, p);

        const merged = Array.from(byId.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        let filtered = owner ? merged.filter((p) => p.owner === owner) : merged;
        if (githubLogin) filtered = filtered.filter((p) => p.manifest?.builder?.links?.github?.toLowerCase().includes(githubLogin.toLowerCase()));
        setProofs(filtered);
      })
      .catch(() => {
        let fb = owner ? cached.filter((p) => p.owner === owner) : cached;
        if (githubLogin) fb = fb.filter((p) => p.manifest?.builder?.links?.github?.toLowerCase().includes(githubLogin.toLowerCase()));
        setProofs(fb);
      })
      .finally(() => setLoading(false));
  }, [owner, githubLogin]);

  if (loading) {
    return (
      <div className="card-neo p-8 text-center">
        <p className="font-mono text-sm text-ink/60">Loading proofs from Tatum RPC...</p>
      </div>
    );
  }

  if (!proofs.length) {
    return (
      <div className="card-neo p-8 text-center">
        <p className="font-display text-3xl text-ink">NO PROOFS YET.</p>
        <p className="mt-3 font-mono text-sm text-ink/60">
          No proofs here yet. Be the first to anchor your build on Sui.
        </p>
        <Link href="/create" className="btn-neo mt-6 inline-flex bg-ink px-6 py-3 text-sm text-white">
          Create your first Vouch
        </Link>
      </div>
    );
  }

  const q = search.toLowerCase().trim();
  const displayed = proofs
    .filter((p) => activeCategory === "All" || p.category === activeCategory)
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.tagline?.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q));

  return (
    <div>
      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title, tagline or wallet…"
        className="mb-4 w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-brand-blue"
      />

      {/* Category filter — horizontal scroll on mobile avoids shadow bleed */}
      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="flex gap-2 pb-2 w-max sm:w-auto sm:flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn-neo shrink-0 px-3 py-1.5 text-xs ${activeCategory === cat ? "bg-ink text-white" : "bg-white text-ink"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="card-neo p-8 text-center">
          <p className="font-display text-2xl text-ink">NO {activeCategory.toUpperCase()} PROOFS.</p>
          <p className="mt-2 font-mono text-sm text-ink/60">Try a different category.</p>
        </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2">
        {displayed.map((proof) => (
          <Link
            href={`/vouch/${proof.objectId}`}
            key={proof.objectId}
            className="card-neo block min-w-0 overflow-hidden p-6 transition-transform hover:-translate-y-1"
          >
            {(proof.version || proof.category) ? (
              <span className="btn-neo inline-block bg-gold px-3 py-1 text-xs text-ink">
                {proof.version ? `v${proof.version}` : ""}{proof.version && proof.category ? " · " : ""}{proof.category}
              </span>
            ) : null}
            <h2 className="mt-4 line-clamp-2 font-display text-3xl text-ink">{proof.title.toUpperCase()}</h2>
            {proof.tagline ? <p className="mt-2 line-clamp-2 font-mono text-sm text-ink/60">{proof.tagline}</p> : null}
            <p className="mt-4 truncate font-mono text-xs text-ink/40">{proof.objectId}</p>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
