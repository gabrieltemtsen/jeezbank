import React from "react";

export default function DataError({
  title = "Couldn't load this",
  message,
}: {
  title?: string;
  message?: string | null;
}) {
  if (!message) return null;
  return (
    <div
      className="rounded-2xl px-4 py-3 mb-4 flex items-start gap-3"
      style={{
        background: "rgba(255,92,122,0.06)",
        border: "1px solid rgba(255,92,122,0.25)",
        color: "var(--jmb-red)",
      }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: "rgba(255,92,122,0.10)" }}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 17h.01" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs mt-0.5 text-[var(--jmb-red)] break-words">{message}</p>
      </div>
    </div>
  );
}
