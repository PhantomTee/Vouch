"use client";

import { ExternalLink, FileText, ImageIcon, Lock } from "lucide-react";
import { SealDecryptButton } from "@/components/SealDecryptButton";
import { getWalrusBlobUrl } from "@/lib/walrus/client";
import type { EvidenceManifestItem } from "@/types/vouch";

function mimeLabel(mimeType: string, type: string) {
  const m = mimeType || type;
  if (m.startsWith("image/")) return "Image";
  if (m === "application/pdf") return "PDF";
  if (m === "text/markdown" || m === "text/plain") return "Text";
  if (m === "application/json") return "JSON";
  if (m.startsWith("video/")) return "Video";
  return m.split("/")[1]?.toUpperCase() || "File";
}

export function EvidenceTable({ evidence }: { evidence: EvidenceManifestItem[] }) {
  if (!evidence.length) {
    return (
      <p className="card-neo p-4 font-mono text-sm text-ink/60">No evidence files listed.</p>
    );
  }

  return (
    <div className="space-y-3">
      {evidence.map((item) => {
        const isPublicImage = !item.sealed && item.mimeType.startsWith("image/") && Boolean(item.walrusBlobId);
        const walrusUrl = getWalrusBlobUrl(item.walrusBlobId);
        return (
        <div key={`${item.name}-${item.sha256}`} className="card-neo overflow-hidden p-4 sm:p-5">
          {/* Top row: file name + type badge + access */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {item.sealed
                ? <Lock size={15} className="shrink-0 text-ink/50" />
                : isPublicImage ? <ImageIcon size={15} className="shrink-0 text-ink/40" />
                : <FileText size={15} className="shrink-0 text-ink/40" />
              }
              <span className="min-w-0 break-all font-mono text-sm font-bold text-ink">
                {item.name}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="btn-neo bg-gold/40 px-2.5 py-1 text-[10px] text-ink">
                {mimeLabel(item.mimeType, item.type)}
              </span>
              <span className="font-mono text-xs text-ink/50">
                {(item.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>

          {isPublicImage && walrusUrl ? (
            <a
              href={walrusUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block overflow-hidden rounded-xl border-2 border-ink bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={walrusUrl}
                alt={item.name}
                className="max-h-[420px] w-full object-contain"
                loading="lazy"
              />
            </a>
          ) : null}

          {/* Details: blob ID + hash */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="min-w-0 rounded-lg bg-ink/5 px-3 py-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">Walrus blob</p>
              {walrusUrl ? (
                <a href={walrusUrl} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-1 truncate font-mono text-xs text-brand-blue">
                  <span className="truncate">{item.walrusBlobId}</span>
                  <ExternalLink size={11} className="shrink-0" />
                </a>
              ) : (
                <p className="mt-0.5 truncate font-mono text-xs text-brand-blue">—</p>
              )}
            </div>
            <div className="min-w-0 rounded-lg bg-ink/5 px-3 py-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">SHA-256</p>
              <p className="mt-0.5 truncate font-mono text-xs text-ink/50">{item.sha256 || "—"}</p>
            </div>
          </div>

          {/* Decrypt button for sealed files */}
          {item.sealed && (
            <div className="mt-3 border-t-2 border-ink/10 pt-3">
              <SealDecryptButton
                walrusBlobId={item.walrusBlobId}
                fileName={item.name}
                mimeType={item.mimeType}
              />
            </div>
          )}
        </div>
      );
      })}
    </div>
  );
}
