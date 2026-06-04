"use client";
import { Lock, LockOpen, UploadCloud, X } from "lucide-react";

interface FileDropzoneProps {
  files: File[];
  onFiles: (files: File[]) => void;
  sealedSet: Set<number>;
  onToggleSeal: (index: number) => void;
}

export function FileDropzone({ files, onFiles, sealedSet, onToggleSeal }: FileDropzoneProps) {
  const add = (list: FileList | null) => {
    if (!list) return;
    onFiles([...files, ...Array.from(list)].slice(0, 5));
  };

  const remove = (index: number) => {
    onFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
      className="card-neo p-8 text-center"
      style={{ borderStyle: "dashed", backgroundColor: "#87CEEB33" }}
    >
      <UploadCloud className="mx-auto mb-4 text-ink" size={36} />
      <p className="font-mono text-sm font-bold uppercase tracking-wider text-ink">Drag evidence files here</p>
      <p className="mt-2 font-mono text-xs text-ink/60">
        Screenshots, READMEs, PDFs, text files, images, or demo proof. Max 5 files, 5MB each.
      </p>
      <label className="btn-neo mt-5 inline-flex cursor-pointer bg-ink px-5 py-2 text-xs text-white">
        <input type="file" multiple className="hidden" onChange={(e) => add(e.target.files)} />
        Choose files
      </label>
      {files.length ? (
        <ul className="mt-5 space-y-2 text-left">
          {files.map((file, i) => {
            const sealed = sealedSet.has(i);
            return (
              <li
                key={`${file.name}-${file.lastModified}`}
                className={`flex items-center justify-between rounded-xl border-2 border-ink px-3 py-2 font-mono text-xs text-ink ${sealed ? "bg-gold/30" : "bg-white"}`}
              >
                <span className="flex items-center gap-2 truncate">
                  {sealed ? <Lock size={12} className="shrink-0 text-ink" /> : <LockOpen size={12} className="shrink-0 text-ink/30" />}
                  {file.name} <span className="text-ink/50">({(file.size / 1024).toFixed(1)} KB)</span>
                </span>
                <div className="ml-3 flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleSeal(i)}
                    title={sealed ? "Make public" : "Encrypt with Seal (owner-only)"}
                    className={`rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sealed ? "bg-ink text-white" : "bg-white text-ink"}`}
                  >
                    {sealed ? "Private" : "Public"}
                  </button>
                  <button type="button" onClick={() => remove(i)} aria-label={`Remove ${file.name}`} className="rounded-full p-0.5 text-ink/40 hover:bg-red-100 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {files.length > 0 && (
        <p className="mt-3 font-mono text-xs text-ink/50">
          Toggle <strong>Private</strong> to encrypt a file with Sui Seal — only you can decrypt it.
        </p>
      )}
    </div>
  );
}
