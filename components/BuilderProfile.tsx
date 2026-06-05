"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, ExternalLink, CheckCircle2 } from "lucide-react";
import { ProofList } from "@/components/ProofList";

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  blog: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
};

async function fetchGitHubProfile(username: string): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<GitHubUser>;
  } catch { return null; }
}

export function BuilderProfile({ username }: { username: string }) {
  const [gh, setGh] = useState<GitHubUser | null>(null);

  useEffect(() => {
    fetchGitHubProfile(username).then(setGh);
  }, [username]);

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      {/* Header card */}
      <div className="card-neo p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="shrink-0">
            {gh?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gh.avatar_url}
                alt={username}
                className="h-24 w-24 rounded-2xl border-4 border-ink shadow-neo-sm sm:h-28 sm:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-ink bg-gold/30 font-display text-4xl text-ink sm:h-28 sm:w-28">
                {username[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="btn-neo inline-block bg-brand-green/20 px-3 py-1 text-xs text-ink">BuilderID</span>
              <div className="flex items-center gap-1.5 rounded-xl border-2 border-brand-green bg-brand-green/10 px-3 py-1">
                <CheckCircle2 size={13} className="text-brand-green" />
                <span className="font-mono text-xs font-bold text-brand-green">GitHub verified</span>
              </div>
            </div>

            <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              {gh?.name ? gh.name.toUpperCase() : `@${username.toUpperCase()}`}
            </h1>
            <p className="mt-1 font-mono text-sm text-ink/60">@{username}</p>

            {gh?.bio && (
              <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-ink/70">{gh.bio}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              {gh?.location && (
                <span className="font-mono text-xs text-ink/50">{gh.location}</span>
              )}
              {gh?.blog && (
                <a
                  href={gh.blog.startsWith("http") ? gh.blog : `https://${gh.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-mono text-xs text-ink/50 hover:text-ink"
                >
                  <ExternalLink size={11} /> {gh.blog}
                </a>
              )}
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink hover:underline"
              >
                <Github size={13} /> GitHub profile
              </a>
            </div>

            {gh && (
              <div className="mt-5 flex flex-wrap gap-4">
                <div className="rounded-xl border-2 border-ink/20 px-4 py-2 text-center">
                  <p className="font-display text-2xl text-ink">{gh.public_repos}</p>
                  <p className="font-mono text-xs text-ink/50">Public repos</p>
                </div>
                <div className="rounded-xl border-2 border-ink/20 px-4 py-2 text-center">
                  <p className="font-display text-2xl text-ink">{gh.followers}</p>
                  <p className="font-mono text-xs text-ink/50">Followers</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What is BuilderID blurb */}
      <div className="mt-6 card-neo border-l-4 border-brand-blue bg-brand-blue/5 p-4">
        <p className="font-mono text-xs text-ink/70 leading-relaxed">
          <strong className="text-ink">BuilderID</strong> is a cryptographically anchored build record. Every proof below was signed by this
          GitHub account, hashed, uploaded to Walrus decentralised storage, and time-stamped on Sui.
          The evidence cannot be altered after anchoring. Vouch is a notary, not a judge.{" "}
          <Link href="/verify" className="underline underline-offset-2">Verify any proof yourself.</Link>
        </p>
      </div>

      {/* Proofs */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">VERIFIED PROOFS</h2>
          <Link href="/create" className="btn-neo bg-ink px-4 py-2 text-xs text-white">
            Add proof
          </Link>
        </div>
        <ProofList githubLogin={username} />
      </div>
    </main>
  );
}
