import { NextResponse, type NextRequest } from "next/server";
import { createJudgeBrief } from "@/lib/ai/groq";
import { getProofContext } from "@/lib/proof/context";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { objectId?: string; network?: string };
  if (!body.objectId?.startsWith("0x")) return NextResponse.json({ error: "Missing Sui object ID." }, { status: 400 });

  try {
    const context = await getProofContext(body.objectId, body.network || "testnet");
    const brief = await createJudgeBrief(context);
    return NextResponse.json({ brief, context });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate judge brief." },
      { status: 502 },
    );
  }
}
