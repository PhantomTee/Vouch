"use client";
import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copyText() {
    setFailed(false);

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!ok) {
          throw new Error("Copy command failed");
        }
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setFailed(true);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copyText}
        className="btn-neo bg-white px-3 py-2 text-xs text-ink"
      >
        {copied ? "Copied ✓" : failed ? "Copy failed" : label}
      </button>
      {failed ? (
        <input
          aria-label="Copyable text"
          readOnly
          value={text}
          onFocus={(event) => event.currentTarget.select()}
          className="w-64 rounded-xl border-2 border-ink bg-white px-3 py-2 font-mono text-xs text-ink"
        />
      ) : null}
    </span>
  );
}
