import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

const BASE = "https://vouch-proof.vercel.app";

async function fetchProofFields(objectId: string): Promise<Record<string, unknown> | null> {
  const key = process.env.TATUM_API_KEY || "";
  const url = process.env.TATUM_SUI_RPC_URL || "https://sui-testnet.gateway.tatum.io";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...(key ? { "x-api-key": key } : {}) },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "sui_getObject",
        params: [objectId, { showContent: true }],
      }),
    });
    const json = await res.json() as { result?: { data?: { content?: { fields?: Record<string, unknown> } } } };
    return json.result?.data?.content?.fields ?? null;
  } catch { return null; }
}

export async function GET(request: NextRequest, { params }: { params: { objectId: string } }) {
  const fields = await fetchProofFields(params.objectId);
  const title = (fields?.title as string) || "Vouch Proof";
  const tagline = (fields?.tagline as string) || "Verified proof of build on Sui";
  const category = (fields?.category as string) || "";
  const tsMs = fields?.created_at_ms as string | undefined;
  const timestamp = tsMs ? new Date(Number(tsMs)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";
  const objectShort = `${params.objectId.slice(0, 10)}...${params.objectId.slice(-6)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#F0F0F0",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 48px 0", borderBottom: "4px solid #111" }}>
          <span style={{ fontFamily: "serif", fontSize: "32px", fontWeight: 900, letterSpacing: "-1px", color: "#111" }}>VOUCH</span>
          <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "4px", color: "#111", textTransform: "uppercase", background: "#FFD166", border: "2px solid #111", padding: "6px 16px" }}>
            {category || "Verified"}
          </span>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "48px 48px 32px" }}>
          {/* VERIFIED stamp */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "20px", height: "20px", background: "#06D6A0", border: "2px solid #111", borderRadius: "50%" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", color: "#06D6A0", textTransform: "uppercase" }}>Verified on Sui</span>
          </div>

          {/* Title */}
          <div style={{ fontSize: title.length > 30 ? "52px" : "68px", fontWeight: 900, color: "#111", lineHeight: 1.05, letterSpacing: "-2px", fontFamily: "serif", maxWidth: "900px" }}>
            {title}
          </div>

          {/* Tagline */}
          <div style={{ fontSize: "20px", color: "#111", opacity: 0.6, marginTop: "16px", maxWidth: "820px", lineHeight: 1.4 }}>
            {tagline.length > 120 ? tagline.slice(0, 120) + "…" : tagline}
          </div>

          {/* Bottom row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {timestamp && (
                <span style={{ fontSize: "13px", color: "#111", opacity: 0.5, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
                  Anchored {timestamp}
                </span>
              )}
              <span style={{ fontSize: "13px", color: "#111", opacity: 0.4, fontFamily: "monospace" }}>{objectShort}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "#111", opacity: 0.45, letterSpacing: "2px", textTransform: "uppercase" }}>Powered by</span>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111", opacity: 0.6 }}>Sui</span>
                <span style={{ fontSize: "13px", color: "#111", opacity: 0.3 }}>+</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111", opacity: 0.6 }}>Walrus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stripe */}
        <div style={{ height: "8px", background: "#111", width: "100%" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
