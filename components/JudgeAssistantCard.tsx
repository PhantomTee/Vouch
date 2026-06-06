"use client";

import { Bot, Loader2, Send } from "lucide-react";
import { useState } from "react";
import type { VouchNetwork } from "@/types/vouch";

const PROMPTS = [
  "Summarize this proof for a hackathon judge.",
  "What evidence is public and what should I inspect?",
  "Which verification checks are weak or missing?",
];

export function JudgeAssistantCard({ objectId, network }: { objectId: string; network: VouchNetwork }) {
  const [question, setQuestion] = useState(PROMPTS[0]);
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function ask(nextQuestion = question) {
    setBusy(true);
    setError("");
    setAnswer("");
    setQuestion(nextQuestion);
    try {
      const response = await fetch("/api/ai/judge-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ objectId, network, question: nextQuestion }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Assistant unavailable.");
      setAnswer(payload.answer || "");
      setSource(payload.source || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Assistant unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-neo p-5">
      <div className="flex items-center gap-2">
        <Bot size={16} className="text-brand-blue" />
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink">Judge Assistant</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => ask(prompt)}
            className="btn-neo bg-white px-2.5 py-1.5 text-[10px] text-ink"
          >
            {prompt.replace(/\.$/, "")}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border-2 border-ink bg-white px-3 py-2 font-mono text-xs text-ink outline-none focus:border-brand-blue"
        />
        <button
          type="button"
          onClick={() => ask()}
          disabled={busy || !question.trim()}
          className="btn-neo flex shrink-0 items-center gap-1 bg-ink px-3 py-2 text-xs text-white disabled:opacity-50"
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Ask
        </button>
      </div>
      {answer ? (
        <div className="mt-4 rounded-xl border-2 border-ink bg-white px-3 py-3">
          <p className="font-mono text-sm leading-relaxed text-ink/75">{answer}</p>
          {source ? <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink/30">Source: {source === "groq" ? "Groq" : "local fallback"}</p> : null}
        </div>
      ) : null}
      {error ? <p className="mt-3 font-mono text-xs text-coral">{error}</p> : null}
    </div>
  );
}
