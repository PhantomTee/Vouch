import { CreateVouchForm } from "@/components/CreateVouchForm";

export default function CreatePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10">
        <span className="btn-neo inline-block bg-gold px-4 py-2 text-xs text-ink">Create Vouch</span>
        <h1 className="mt-4 font-display text-6xl text-ink md:text-7xl">PUBLISH VERIFIABLE EVIDENCE.</h1>
        <p className="mt-4 max-w-2xl font-mono text-sm text-ink/60">
          Hash evidence locally, upload it to Walrus, upload a manifest, then anchor the manifest hash and blob ID on Sui.
        </p>
      </div>
      <CreateVouchForm />
    </main>
  );
}
