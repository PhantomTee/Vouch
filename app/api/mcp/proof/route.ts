import { NextResponse, type NextRequest } from "next/server";
import { getProofContext } from "@/lib/proof/context";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const objectId = searchParams.get("objectId") || "";
  const network = searchParams.get("network") || "testnet";
  if (!objectId.startsWith("0x")) return NextResponse.json({ error: "Missing Sui object ID." }, { status: 400 });

  try {
    const context = await getProofContext(objectId, network);
    return NextResponse.json(context);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load proof context." },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { objectId?: string; network?: string };
  if (!body.objectId?.startsWith("0x")) return NextResponse.json({ error: "Missing Sui object ID." }, { status: 400 });

  try {
    const context = await getProofContext(body.objectId, body.network || "testnet");
    return NextResponse.json(context);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load proof context." },
      { status: 502 },
    );
  }
}
