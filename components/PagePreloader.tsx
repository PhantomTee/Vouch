"use client";

import { useEffect, useState } from "react";

export function PagePreloader() {
  const [phase, setPhase] = useState<"hidden" | "drawing" | "leaving">("hidden");

  useEffect(() => {
    if (sessionStorage.getItem("vouch.preloaded")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sessionStorage.setItem("vouch.preloaded", "1");
    setPhase("drawing");
    const t = setTimeout(() => setPhase("leaving"), 900);
    return () => clearTimeout(t);
  }, []);

  if (phase === "hidden") return null;

  return (
    <>
      <style>{`
        @keyframes vouch-trace {
          to { stroke-dashoffset: 0; }
        }
        @keyframes vouch-fill {
          to { fill: white; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0A0A0A]"
        style={{
          transform: phase === "leaving" ? "translateY(-100%)" : "translateY(0)",
          transition: phase === "leaving" ? "transform 0.42s cubic-bezier(0.76,0,0.24,1)" : "none",
        }}
      >
        <svg
          viewBox="0 0 660 130"
          width="660"
          height="130"
          style={{ maxWidth: "78vw" }}
          aria-hidden
        >
          <text
            x="330"
            y="110"
            textAnchor="middle"
            fontFamily="var(--font-anton), 'Anton', 'Arial Black', sans-serif"
            fontSize="120"
            fontWeight="900"
            fill="transparent"
            stroke="white"
            strokeWidth="1"
            letterSpacing="-2"
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: 3000,
              animation:
                "vouch-trace 0.5s ease-out forwards, vouch-fill 0.2s ease-in 0.55s forwards",
            }}
          >
            VOUCH
          </text>
        </svg>
      </div>
    </>
  );
}
