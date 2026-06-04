import type { StoredProof } from "@/types/vouch";

const CHECKS = [
  { label: "Sui anchor exists", points: 20, key: "anchor" },
  { label: "Walrus manifest verified", points: 20, key: "walrus" },
  { label: "Evidence files hashed", points: 20, key: "evidence" },
  { label: "GitHub repo linked", points: 10, key: "repo" },
  { label: "Demo URL included", points: 10, key: "demo" },
  { label: "README included", points: 10, key: "readme" },
  { label: "Architecture or PDF evidence", points: 5, key: "arch" },
  { label: "Video or demo recording", points: 5, key: "video" },
];

function computeScore(proof: StoredProof, chainVerified: boolean) {
  const ev = proof.manifest?.evidence ?? [];
  const results: Record<string, boolean> = {
    anchor: chainVerified,
    walrus: !!proof.manifestBlobId,
    evidence: ev.length > 0 && ev.every((e) => !!e.sha256),
    repo: !!(proof.manifest?.links?.repo || proof.manifest?.builder?.links?.github),
    demo: !!proof.manifest?.links?.demo,
    readme: ev.some((e) => e.name.toLowerCase().includes("readme")),
    arch: ev.some((e) => e.mimeType === "application/pdf" || e.name.toLowerCase().includes("arch") || e.name.toLowerCase().includes("diagram")),
    video: ev.some((e) => (e.mimeType ?? "").startsWith("video") || e.name.toLowerCase().includes("demo") || e.name.toLowerCase().includes("video")),
  };
  const score = CHECKS.reduce((sum, c) => sum + (results[c.key] ? c.points : 0), 0);
  return { score, results };
}

function scoreColor(score: number) {
  if (score >= 80) return "text-brand-green";
  if (score >= 50) return "text-gold";
  return "text-coral";
}

export function ProofScore({ proof, chainVerified }: { proof: StoredProof; chainVerified: boolean }) {
  const { score, results } = computeScore(proof, chainVerified);

  return (
    <div className="card-neo p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-ink">PROOF SCORE</h3>
        <span className={`font-display text-3xl ${scoreColor(score)}`}>{score}<span className="text-ink/30 text-lg">/100</span></span>
      </div>
      <div className="mt-4 space-y-2">
        {CHECKS.map((c) => (
          <div key={c.key} className="flex items-center justify-between gap-2">
            <span className={`font-mono text-xs ${results[c.key] ? "text-ink/70" : "text-ink/30"}`}>
              {results[c.key] ? "✓" : "·"} {c.label}
            </span>
            <span className={`shrink-0 font-mono text-xs font-bold ${results[c.key] ? "text-ink/60" : "text-ink/20"}`}>
              {results[c.key] ? `+${c.points}` : `+0`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
