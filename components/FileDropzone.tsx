"use client";
import { UploadCloud } from "lucide-react";

export function FileDropzone({ files, onFiles }: { files: File[]; onFiles: (files: File[]) => void }) {
  const add = (list: FileList | null) => {
    if (!list) return;
    onFiles([...files, ...Array.from(list)].slice(0, 5));
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
          {files.map((file) => (
            <li key={`${file.name}-${file.lastModified}`} className="rounded-xl border-2 border-ink bg-white px-3 py-2 font-mono text-xs text-ink">
              {file.name} <span className="text-ink/50">({(file.size / 1024).toFixed(1)} KB)</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
