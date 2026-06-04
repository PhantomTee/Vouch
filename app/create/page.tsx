import { CreateVouchForm } from "@/components/CreateVouchForm";

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Create Vouch</span>
        <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl md:text-6xl">PUBLISH VERIFIABLE EVIDENCE.</h1>
        <p className="mt-3 max-w-2xl font-mono text-sm text-ink/60">
          Upload your evidence, verify your GitHub identity, and anchor your proof permanently on Sui.
        </p>
      </div>
      <CreateVouchForm />
    </main>
  );
}
