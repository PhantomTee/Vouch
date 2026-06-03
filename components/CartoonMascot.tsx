export function CartoonMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 210" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body: document / certificate */}
      <rect x="18" y="10" width="124" height="162" rx="14" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="5" />

      {/* Folded corner */}
      <path d="M108 10 L142 44 L108 44 Z" fill="#87CEEB" stroke="#0A0A0A" strokeWidth="4" strokeLinejoin="round" />

      {/* Document lines */}
      <line x1="36" y1="118" x2="124" y2="118" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />
      <line x1="36" y1="134" x2="104" y2="134" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />
      <line x1="36" y1="150" x2="114" y2="150" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" />

      {/* Green checkmark */}
      <circle cx="80" cy="84" r="22" fill="#39D98A" stroke="#0A0A0A" strokeWidth="4" />
      <path d="M68 84 L76 93 L93 73" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Left eye */}
      <circle cx="52" cy="58" r="16" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="4" />
      <circle cx="56" cy="55" r="8" fill="#0A0A0A" />
      <circle cx="59" cy="52" r="2.5" fill="#FFFFFF" />

      {/* Right eye */}
      <circle cx="108" cy="58" r="16" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="4" />
      <circle cx="112" cy="55" r="8" fill="#0A0A0A" />
      <circle cx="115" cy="52" r="2.5" fill="#FFFFFF" />

      {/* Left hand (peeping fingers) */}
      <ellipse cx="34" cy="197" rx="11" ry="8" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="4" />
      <ellipse cx="56" cy="200" rx="11" ry="8" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="4" />

      {/* Right hand (peeping fingers) */}
      <ellipse cx="104" cy="200" rx="11" ry="8" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="4" />
      <ellipse cx="126" cy="197" rx="11" ry="8" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="4" />
    </svg>
  );
}
