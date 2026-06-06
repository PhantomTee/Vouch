export type EvidenceManifestItem = { type: string; name: string; mimeType: string; size: number; walrusBlobId: string; sha256: string; sealed?: boolean; sealId?: string };
export type VouchNetwork = "mainnet" | "testnet" | "devnet";
export type HackProofDetails = {
  hackathonName?: string;
  demoVideoUrl?: string;
  suiReference?: string;
  socialPostUrl?: string;
  deadlineLabel?: string;
};
export type VouchManifest = {
  schema: "vouch.project.v1";
  proofType?: "project" | "hackproof";
  project: { name: string; tagline: string; description: string; category: string };
  builder: { wallet: string; displayName: string; githubLogin?: string; githubUrl?: string; links: { github: string; x: string; linkedin: string } };
  evidence: EvidenceManifestItem[];
  links: { repo: string; demo: string; sui: string; video?: string; socialPost?: string };
  hackProof?: HackProofDetails;
  network?: VouchNetwork;
  createdAt: string;
  version: 1;
};
export type StoredProof = { objectId: string; txDigest?: string; owner: string; manifestBlobId: string; manifestHash: string; title: string; tagline: string; category: string; createdAt: string; updatedAt?: string; version: number; manifest: VouchManifest; network?: VouchNetwork };
export type CreateVouchInput = { name: string; tagline: string; category: string; description: string; repoUrl: string; demoUrl?: string; suiUrl?: string; xUrl?: string; linkedinUrl?: string; displayName?: string };
export type CreateHackProofInput = CreateVouchInput & { hackathonName?: string; demoVideoUrl?: string; suiReference?: string; socialPostUrl?: string };
