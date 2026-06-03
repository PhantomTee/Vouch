"use client";
import { useState } from "react";
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) { const [copied, setCopied] = useState(false); return <button type="button" onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1400); }} className="rounded-xl border border-line bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{copied ? "Copied" : label}</button>; }
