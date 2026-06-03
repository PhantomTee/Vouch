export function VerificationBadge({ status }: { status: "verified" | "pending" | "error" }) {
  const styles = {
    verified: "bg-brand-green/20 text-ink border-brand-green",
    pending:  "bg-gold/30 text-ink border-gold",
    error:    "bg-coral/20 text-ink border-coral",
  };
  const labels = { verified: "✓ Verified", pending: "Needs verification", error: "Verification failed" };

  return (
    <span className={`inline-flex rounded-full border-2 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
