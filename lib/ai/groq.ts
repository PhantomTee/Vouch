import type { ProofContext } from "@/lib/proof/context";

export type JudgeBrief = {
  summary: string;
  strengths: string[];
  missingSignals: string[];
  judgeNotes: string[];
};

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `You are a judge assistant for Vouch proof certificates.
You summarize public proof metadata and verification checks.
Do not assert that the project is good, original, complete, or fraud-free.
Do not infer private evidence contents.
Treat Walrus, Sui, and Tatum verification checks as the source of truth.
If evidence is missing, private, unverifiable, or checks fail, say so clearly.
Keep responses concise and useful for hackathon judges.`;

function fallbackBrief(context: ProofContext): JudgeBrief {
  const manifest = context.manifest;
  const projectName = manifest?.project?.name || "This proof";
  const failed = context.checks.filter((check) => check.status === "fail");
  const warnings = context.checks.filter((check) => check.status === "warning");
  return {
    summary: `${projectName} has a public proof object on ${context.network}. It references a Walrus manifest blob, ${context.walrus.evidence.length} evidence file${context.walrus.evidence.length === 1 ? "" : "s"}, and was read through Tatum Sui RPC.`,
    strengths: [
      context.sui.objectExists ? "Sui proof object exists." : "Sui proof object was not found.",
      context.walrus.manifestHashMatches ? "Walrus manifest hash matches the on-chain hash." : "Walrus manifest hash has not been confirmed.",
      manifest?.links?.repo ? "GitHub repository URL is present." : "GitHub repository URL is missing.",
      manifest?.links?.demo ? "Demo URL is present." : "Demo URL is missing.",
    ],
    missingSignals: [...failed, ...warnings].map((check) => `${check.label}: ${check.detail}`),
    judgeNotes: [
      "Use the pass/fail checks as the source of truth.",
      "AI summarizes public metadata only; it does not verify private evidence contents.",
    ],
  };
}

function compactContext(context: ProofContext) {
  return {
    objectId: context.objectId,
    network: context.network,
    sui: context.sui,
    walrus: {
      manifestBlobId: context.walrus.manifestBlobId,
      manifestFetchOk: context.walrus.manifestFetchOk,
      manifestHashMatches: context.walrus.manifestHashMatches,
      evidence: context.walrus.evidence.map((item) => ({
        name: item.name,
        mimeType: item.mimeType,
        size: item.size,
        walrusBlobId: item.walrusBlobId,
        sealed: Boolean(item.sealed),
      })),
    },
    manifest: context.manifest ? {
      proofType: context.manifest.proofType,
      project: context.manifest.project,
      builder: {
        wallet: context.manifest.builder.wallet,
        displayName: context.manifest.builder.displayName,
        githubLogin: context.manifest.builder.githubLogin,
      },
      links: context.manifest.links,
      hackProof: context.manifest.hackProof,
      createdAt: context.manifest.createdAt,
    } : null,
    checks: context.checks,
  };
}

async function groqChat(messages: { role: "system" | "user"; content: string }[], jsonMode = false) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured.");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 700,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  const payload = await response.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || `Groq request failed with ${response.status}`);
  return payload.choices?.[0]?.message?.content?.trim() || "";
}

function parseBrief(content: string, fallback: JudgeBrief): JudgeBrief {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const jsonText = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const parsed = JSON.parse(jsonText) as Partial<JudgeBrief>;
  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : fallback.summary,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String).slice(0, 4) : fallback.strengths,
    missingSignals: Array.isArray(parsed.missingSignals) ? parsed.missingSignals.map(String).slice(0, 4) : fallback.missingSignals,
    judgeNotes: Array.isArray(parsed.judgeNotes) ? parsed.judgeNotes.map(String).slice(0, 4) : fallback.judgeNotes,
  };
}

export async function createJudgeBrief(context: ProofContext): Promise<JudgeBrief & { source: "groq" | "fallback" }> {
  const fallback = fallbackBrief(context);
  try {
    const content = await groqChat([
      { role: "system", content: `${SYSTEM_PROMPT}\nReturn only JSON with keys summary, strengths, missingSignals, judgeNotes. Each array should have 2-4 short strings.` },
      { role: "user", content: JSON.stringify(compactContext(context)) },
    ], true);
    return { ...parseBrief(content, fallback), source: "groq" };
  } catch {
    return { ...fallback, source: "fallback" };
  }
}

export async function answerJudgeQuestion(context: ProofContext, question: string): Promise<{ answer: string; source: "groq" | "fallback" }> {
  const fallback = fallbackBrief(context);
  try {
    const answer = await groqChat([
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Proof context:\n${JSON.stringify(compactContext(context))}\n\nJudge question: ${question}\n\nAnswer in 4 concise sentences or fewer.`,
      },
    ]);
    return { answer: answer || fallback.summary, source: "groq" };
  } catch {
    return {
      answer: `${fallback.summary} ${fallback.missingSignals.length ? `Signals to review: ${fallback.missingSignals.join("; ")}` : "No major missing signals were detected in the local summary."}`,
      source: "fallback",
    };
  }
}
