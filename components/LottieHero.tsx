"use client";

import dynamic from "next/dynamic";
import { BadgeCheck, Network, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

const Player = dynamic(() => import("@lottiefiles/react-lottie-player").then((module) => module.Player), { ssr: false });

type Variant = "network" | "upload" | "verified";

const icons = {
  network: Network,
  upload: UploadCloud,
  verified: BadgeCheck
};

export function LottieHero({ src, label, variant = "network" }: { src: string; label: string; variant?: Variant }) {
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(src, { method: "HEAD" })
      .then((response) => setExists(response.ok))
      .catch(() => setExists(false));
  }, [src]);

  const Icon = icons[variant];

  return (
    <div aria-label={label} className="gradient-border relative min-h-[300px] overflow-hidden rounded-[2rem] p-8 shadow-glow">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,140,255,.28),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,.24),transparent_30%)]" />
      {exists ? (
        <Player autoplay loop src={src} className="relative h-80 w-full" />
      ) : (
        <div className="relative flex h-80 flex-col items-center justify-center">
          <div className="absolute h-48 w-48 animate-ping rounded-full bg-brand-blue/10" />
          <Icon className="h-24 w-24 text-brand-blue" />
          <p className="mt-6 text-center text-sm text-slate-400">Optional Lottie file not found yet. Drop JSON at {src}.</p>
        </div>
      )}
    </div>
  );
}
