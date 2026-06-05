import type { CreateVouchInput, EvidenceManifestItem, VouchManifest } from "@/types/vouch";

export type GitHubIdentity = { githubLogin: string; githubUrl?: string };

export function createManifest(
  input: CreateVouchInput,
  wallet: string,
  evidence: EvidenceManifestItem[],
  github?: GitHubIdentity,
): VouchManifest {
  return {
    schema: "vouch.project.v1",
    project: {
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      category: input.category,
    },
    builder: {
      wallet,
      displayName: input.displayName || "",
      githubLogin: github?.githubLogin || undefined,
      githubUrl: github?.githubUrl || undefined,
      links: {
        github: input.repoUrl,
        x: input.xUrl || "",
        linkedin: input.linkedinUrl || "",
      },
    },
    evidence,
    links: {
      repo: input.repoUrl,
      demo: input.demoUrl || "",
      sui: input.suiUrl || "",
    },
    createdAt: new Date().toISOString(),
    version: 1,
  };
}
