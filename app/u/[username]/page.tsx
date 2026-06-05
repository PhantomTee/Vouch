import type { Metadata } from "next";
import { BuilderProfile } from "@/components/BuilderProfile";

type Props = { params: { username: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `@${params.username} — BuilderID on Vouch`,
    description: `Verified proof-of-build record for GitHub user @${params.username}. Anchored on Sui, evidence stored on Walrus.`,
    openGraph: {
      title: `@${params.username} — BuilderID`,
      description: `On-chain verified build history for @${params.username}.`,
      siteName: "Vouch",
    },
  };
}

export default function PublicProfilePage({ params }: Props) {
  return <BuilderProfile username={params.username} />;
}
