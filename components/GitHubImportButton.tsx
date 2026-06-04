"use client";

import { Github, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
};

export type ImportedRepoData = {
  name: string;
  tagline: string;
  category: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  readmeFile: File | null;
};

function detectCategory(topics: string[], language: string | null): string {
  const all = (topics || []).map((t) => t.toLowerCase()).join(" ");
  if (/defi|dex|amm|lending|swap|finance/.test(all)) return "DeFi";
  if (/game|gaming|gamefi/.test(all)) return "Gaming";
  if (/infra|infrastructure|bridge|oracle|rpc/.test(all)) return "Infrastructure";
  if (/tool|tooling|sdk|cli|library/.test(all)) return "Tooling";
  if (/social|dao|governance/.test(all)) return "Social";
  if (/public.good/.test(all)) return "Public goods";
  if (language === "Move" || language === "Rust") return "Infrastructure";
  return "Other";
}

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 1000);
}

export function GitHubImportButton({ onImport }: { onImport: (data: ImportedRepoData) => void }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!session?.user?.login) return null;

  async function loadRepos() {
    if (!session?.user?.login) return;
    setLoadingRepos(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.github.com/users/${session.user.login}/repos?sort=updated&per_page=50&type=owner`,
      );
      if (!res.ok) throw new Error("GitHub API error — try again shortly.");
      setRepos((await res.json()) as GitHubRepo[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load repos.");
    } finally {
      setLoadingRepos(false);
    }
  }

  async function importRepo(repo: GitHubRepo) {
    setImporting(repo.full_name);
    setError("");
    try {
      let readmeFile: File | null = null;
      let description = "";
      try {
        const readmeRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/readme`,
          { headers: { Accept: "application/vnd.github.raw" } },
        );
        if (readmeRes.ok) {
          const text = await readmeRes.text();
          description = stripMarkdown(text);
          readmeFile = new File([text], "README.md", { type: "text/markdown" });
        }
      } catch { /* README optional */ }

      onImport({
        name: repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        tagline: (repo.description || "").slice(0, 140),
        category: detectCategory(repo.topics || [], repo.language),
        description,
        repoUrl: repo.html_url,
        demoUrl: repo.homepage || "",
        readmeFile,
      });
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(null);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); loadRepos(); }}
        className="btn-neo flex items-center gap-2 bg-white px-4 py-2.5 text-xs text-ink"
      >
        <Github size={14} /> Import from GitHub repo
      </button>
    );
  }

  return (
    <div className="card-neo p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
          Select a repository
        </p>
        <button type="button" onClick={() => setOpen(false)} className="text-ink/40 hover:text-ink">
          <X size={16} />
        </button>
      </div>

      {loadingRepos ? (
        <div className="flex items-center gap-2 py-4 font-mono text-sm text-ink/60">
          <Loader2 size={14} className="animate-spin" /> Loading your repos…
        </div>
      ) : error ? (
        <p className="font-mono text-xs text-coral">{error}</p>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {repos.length === 0 && (
            <p className="py-2 font-mono text-xs text-ink/60">No public repos found.</p>
          )}
          {repos.map((repo) => (
            <button
              key={repo.id}
              type="button"
              disabled={!!importing}
              onClick={() => importRepo(repo)}
              className="w-full rounded-xl border-2 border-ink/10 bg-white px-3 py-2.5 text-left transition-colors hover:border-ink hover:bg-gold/10 disabled:opacity-60"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs font-bold text-ink">{repo.name}</p>
                {repo.language && (
                  <span className="shrink-0 font-mono text-[10px] text-ink/40">{repo.language}</span>
                )}
              </div>
              {repo.description && (
                <p className="mt-0.5 truncate font-mono text-xs text-ink/50">{repo.description}</p>
              )}
              {importing === repo.full_name && (
                <div className="mt-1 flex items-center gap-1 font-mono text-xs text-ink/50">
                  <Loader2 size={10} className="animate-spin" /> Importing…
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
