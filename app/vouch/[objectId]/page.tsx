import type { Metadata } from "next";
import { ProofViewer } from "@/components/ProofViewer";
import { getObject } from "@/lib/tatum/rpc";

type Props = { params: { objectId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const base = "https://vouch-proof.vercel.app";
  try {
    const res = await getObject(params.objectId) as {
      data?: { content?: { fields?: Record<string, unknown> } };
    };
    const fields = res.data?.content?.fields;
    const title = (fields?.title as string) || "Vouch Proof";
    const tagline = (fields?.tagline as string) || "";
    const category = (fields?.category as string) || "";
    const desc = tagline || `Verified proof of build${category ? ` · ${category}` : ""} on Sui.`;
    const url = `${base}/vouch/${params.objectId}`;

    const ogImage = `${base}/api/og/${params.objectId}`;
    return {
      title: `${title} — Vouch`,
      description: desc,
      openGraph: {
        title: `${title} — Verified on Sui`,
        description: desc,
        url,
        siteName: "Vouch",
        type: "website",
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} — Verified on Sui`,
        description: desc,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: "Vouch — Verified proof of build",
      description: "Permanently anchored on Sui, stored on Walrus.",
      openGraph: { title: "Vouch", description: "Permanently anchored on Sui.", siteName: "Vouch" },
    };
  }
}

export default function VouchPage({ params }: Props) {
  return <ProofViewer objectId={params.objectId} />;
}
