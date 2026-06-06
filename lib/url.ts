import { env } from "@/lib/env";

export function absoluteAppUrl(path: string, origin?: string): string {
  const base = env.siteUrl || origin || "https://vouch-proof.vercel.app";
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}
