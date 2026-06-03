import { type NextRequest, NextResponse } from "next/server";

const TATUM_URL = process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL || "https://sui-testnet.gateway.tatum.io";
const TATUM_KEY = process.env.NEXT_PUBLIC_TATUM_API_KEY || "";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const headers: Record<string, string> = { "content-type": "application/json" };
  if (TATUM_KEY) headers["x-api-key"] = TATUM_KEY;

  const response = await fetch(TATUM_URL, { method: "POST", headers, body });
  const data = await response.text();

  return new NextResponse(data, {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
