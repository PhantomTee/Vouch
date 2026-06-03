"use client";
import { useEffect, useState } from "react";

const phrases = [
  "PROOF YOUR BUILD HAPPENED.",
  "VERIFY YOUR WORK ON-CHAIN.",
  "ANCHOR EVIDENCE FOREVER.",
  "BUILD. PROVE. VERIFY.",
  "YOUR WORK, IMMORTALIZED.",
];

export function AnimatedHeading() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <h1
      className="font-display text-[5rem] leading-none tracking-tight text-ink md:text-[6.5rem] lg:text-[7.5rem]"
      style={{
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(-12px)",
      }}
    >
      {phrases[index]}
    </h1>
  );
}
