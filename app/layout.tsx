import type { Metadata } from "next";
import { Anton, Space_Mono } from "next/font/google";
import "@mysten/dapp-kit/dist/index.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "Vouch | Proof-of-build registry for Sui",
  description: "Vouch stores project evidence on Walrus, anchors proof hashes on Sui, and uses Tatum RPC for verification."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${spaceMono.variable}`}>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
