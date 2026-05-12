"use client";

import { useState } from "react";
import ActionToast from "@/components/ActionToast";

export default function LoanActionPanel({
  loanId,
  status,
}: {
  loanId: string;
  status: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function call(path: string, body: any) {
    setLoading(path);
    setToast(null);
    try {
      const res = await fetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setToast({ kind: "success", text: "Action completed. Refreshing…" });
      // simplest for demo: reload
      setTimeout(() => window.location.reload(), 650);
    } catch (e: any) {
      setToast({ kind: "error", text: e?.message || "Failed" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <ActionToast text={toast?.text ?? null} kind={toast?.kind ?? "success"} />

      <div className="space-y-2">
        {status === "PENDING" && (
          <button
            className="jmb-btn w-full"
            disabled={!!loading}
            onClick={() => call(`/api/loans/${loanId}/approve`, {})}
          >
            {loading ? "Working…" : "Approve loan"}
          </button>
        )}

        {status === "PENDING" && (
          <button
            className="jmb-btn w-full"
            style={{ background: "color-mix(in srgb, var(--jmb-red) 20%, rgba(255,255,255,0.04))", borderColor: "rgba(255,92,122,0.35)" }}
            disabled={!!loading}
            onClick={() => {
              const reason = prompt("Reason for rejection?") || "Rejected";
              return call(`/api/loans/${loanId}/reject`, { reason });
            }}
          >
            {loading ? "Working…" : "Reject loan"}
          </button>
        )}

        {status === "APPROVED" && (
          <button
            className="jmb-btn w-full"
            style={{ background: "color-mix(in srgb, var(--jmb-cyan) 18%, rgba(255,255,255,0.04))", borderColor: "rgba(54,240,255,0.35)" }}
            disabled={!!loading}
            onClick={() => call(`/api/loans/${loanId}/disburse`, {})}
          >
            {loading ? "Working…" : "Disburse loan"}
          </button>
        )}
      </div>

      <p className="text-[11px] text-[var(--jmb-text-mute)] mt-4">All actions are logged for audit.</p>
    </>
  );
}
