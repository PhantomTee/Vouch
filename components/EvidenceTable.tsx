import type { EvidenceManifestItem } from "@/types/vouch";

export function EvidenceTable({ evidence }: { evidence: EvidenceManifestItem[] }) {
  if (!evidence.length) {
    return (
      <p className="card-neo p-4 font-mono text-sm text-ink/60">No evidence files listed.</p>
    );
  }

  return (
    <div className="card-neo overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left font-mono text-sm">
          <thead className="border-b-2 border-ink bg-gold/30">
            <tr>
              {["File", "Type", "Size", "Walrus blob", "SHA-256"].map((h) => (
                <th key={h} className="p-4 text-xs font-bold uppercase tracking-wider text-ink">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evidence.map((item) => (
              <tr key={`${item.name}-${item.sha256}`} className="border-t-2 border-ink/10">
                <td className="p-4 font-bold text-ink">{item.name}</td>
                <td className="p-4 text-ink/60">{item.mimeType || item.type}</td>
                <td className="p-4 text-ink/60">{(item.size / 1024).toFixed(1)} KB</td>
                <td className="max-w-[180px] truncate p-4 text-brand-blue">{item.walrusBlobId}</td>
                <td className="max-w-[220px] truncate p-4 text-xs text-ink/50">{item.sha256}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
