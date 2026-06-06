import { VerifyForm } from "@/components/VerifyForm";
import { TatumStatusCard } from "@/components/TatumStatusCard";

export const metadata = {
  title: "Verify Proof — Vouch",
  description: "Independently verify a Vouch proof by re-fetching the manifest from Walrus and comparing it to the hash anchored on Sui.",
};

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-5xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Independent Verification</span>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl md:text-6xl">VERIFY A PROOF.</h1>
      <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-ink/60">
        Paste any Vouch proof URL or Sui object ID. This tool re-fetches the manifest from Walrus and re-computes its SHA-256 hash, then compares it to the hash stored on Sui — without trusting Vouch&apos;s servers.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <VerifyForm />
        <aside>
          <TatumStatusCard />
        </aside>
      </div>
    </main>
  );
}
