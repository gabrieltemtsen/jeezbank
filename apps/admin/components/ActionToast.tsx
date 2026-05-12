"use client";

import { useEffect, useState } from "react";

export default function ActionToast({
  text,
  kind,
}: {
  text: string | null;
  kind: "success" | "error";
}) {
  const [open, setOpen] = useState(Boolean(text));

  useEffect(() => {
    setOpen(Boolean(text));
    if (!text) return;
    const t = setTimeout(() => setOpen(false), 3500);
    return () => clearTimeout(t);
  }, [text]);

  if (!text || !open) return null;

  const color = kind === "success" ? "var(--jmb-mint)" : "var(--jmb-red)";

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div
        className="rounded-2xl px-4 py-3 shadow-lg border"
        style={{
          background: "rgba(10,14,20,0.92)",
          borderColor: "rgba(255,255,255,0.10)",
          color,
          minWidth: 280,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
               style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {kind === "success" ? <path d="M5 12l5 5L20 7"/> : <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>}
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{kind === "success" ? "Success" : "Error"}</p>
            <p className="text-xs mt-0.5" style={{ color }}>{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
