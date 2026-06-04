const steps = [
  "Preparing manifest",
  "Hashing files",
  "Uploading evidence to Walrus",
  "Uploading manifest to Walrus",
  "Anchoring proof on Sui",
  "Done",
];

export function StepProgress({ currentStep, error, steps: overrideSteps }: { currentStep: number; error?: string; steps?: string[] }) {
  const displaySteps = overrideSteps ?? steps;
  return (
    <ol className="space-y-2">
      {displaySteps.map((step, index) => {
        const active = index === currentStep;
        const done = index < currentStep;
        return (
          <li
            key={step}
            className={`flex items-center gap-3 rounded-xl border-2 border-ink p-3 font-mono text-xs ${
              done ? "bg-brand-green/20" : active ? "bg-gold/40" : "bg-white/60"
            }`}
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-xs font-bold text-ink">
              {done ? "✓" : index + 1}
            </span>
            <span className="font-bold uppercase tracking-wider text-ink">{step}</span>
            {active && error ? <span className="ml-auto font-bold text-coral">Error</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
