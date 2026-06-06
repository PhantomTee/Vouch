import { NextResponse, type NextRequest } from "next/server";
import { answerJudgeQuestion } from "@/lib/ai/groq";
import { getProofContext } from "@/lib/proof/context";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { objectId?: string; network?: string; question?: string };
  if (!body.objectId?.startsWith("0x")) return NextResponse.json({ error: "Missing Sui object ID." }, { status: 400 });
  if (!body.question?.trim()) return NextResponse.json({ error: "Missing judge question." }, { status: 400 });

  try {
    const context = await getProofContext(body.objectId, body.network || "testnet");
    const answer = await answerJudgeQuestion(context, body.question.trim().slice(0, 500));
    return NextResponse.json(answer);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not answer judge question." },
      { status: 502 },
    );
  }
}
