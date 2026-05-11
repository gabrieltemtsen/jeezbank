import React from "react";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,217,245,0.55)]"
      style={{
        width: size,
        height: size,
        background: "var(--jmb-grad-primary)",
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="#06121a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* J monogram */}
        <path d="M15 4v9.5a4.5 4.5 0 0 1-9 0" />
        <path d="M9 4h10" />
      </svg>
    </div>
  );
}

export function Wordmark({ size = "lg" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const cls =
    size === "xl" ? "text-4xl" :
    size === "lg" ? "text-2xl" :
    size === "md" ? "text-xl" : "text-base";
  return (
    <span className={`${cls} font-bold tracking-tight`}>
      <span className="jmb-grad-text">Jeez</span>
      <span className="text-white/90">Bank</span>
    </span>
  );
}

export function BackBtn({ onClick, href }: { onClick?: () => void; href?: string }) {
  const inner = (
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl jmb-glass text-[var(--jmb-text)] hover:bg-white/10 transition">
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </span>
  );
  if (href) return <a href={href} aria-label="Back">{inner}</a>;
  return <button onClick={onClick} aria-label="Back">{inner}</button>;
}
