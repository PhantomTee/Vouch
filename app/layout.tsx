import type { Metadata } from "next";
import { Anton, Space_Mono } from "next/font/google";
import "@mysten/dapp-kit/dist/index.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { NetworkTheme } from "@/components/NetworkTheme";
import { Toaster } from "sonner";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "Vouch | Proof-of-build registry for Sui",
  description: "Anchor your project evidence on Walrus and Sui. Every build, verifiable forever.",
  openGraph: {
    title: "Vouch — Proof-of-build registry for Sui",
    description: "Anchor your project evidence on Walrus and Sui. Every build, verifiable forever.",
    url: "https://vouch-proof.vercel.app",
    siteName: "Vouch",
    type: "website",
    images: [{ url: "https://vouch-proof.vercel.app/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch — Proof-of-build registry for Sui",
    description: "Anchor your project evidence on Walrus and Sui. Every build, verifiable forever.",
    images: ["https://vouch-proof.vercel.app/og-default.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${spaceMono.variable}`}>
      <head>
        {/* Apply network theme class before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var n=localStorage.getItem('vouch.network');if(n==='mainnet')document.documentElement.classList.add('theme-mainnet');}catch(e){}})()` }} />
      </head>
      <body>
        <Providers>
          <NetworkTheme />
          <Header />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: "!border-2 !border-ink !shadow-neo !rounded-xl !font-mono !text-sm !bg-white !text-ink",
                title: "!font-bold",
                description: "!text-ink/60",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
