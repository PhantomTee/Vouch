"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card-neo overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
      >
        <h3 className="font-display text-lg text-ink sm:text-xl">{q.toUpperCase()}</h3>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t-2 border-ink/10 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <p className="font-mono text-sm leading-relaxed text-ink/70">{a}</p>
        </div>
      )}
    </div>
  );
}
