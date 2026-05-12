"use client";

import { useMemo, useState } from "react";
import ActionToast from "@/components/ActionToast";

export default function LoanRepayPanel({ loanId }: { loanId: string }) {
  const [amountNaira, setAmountNaira] = useState<string>("5000");
  const [channel, setChannel] = useState<string>("BANK_TRANSFER");
  const [narration, setNarration] = useState<string>("Admin demo repayment");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const amountKobo = useMemo(() => {
    const n = Number(amountNaira);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100);
  }, [amountNaira]);

  async function submit() {
    setLoading(true);
    setToast(null);
    try {
      const res = await fetch(`/api/loans/${loanId}/repay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountKobo, channel, narration }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);

      setToast({ kind: "success", text: "Repayment posted. Refreshing…" });
      setTimeout(() => window.location.reload(), 700);
    } catch (e: any) {
      setToast({ kind: "error", text: e?.message || "Failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <ActionToast text={toast?.text ?? null} kind={toast?.kind ?? "success"} />

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Amount (₦)</div>
          <input
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={amountNaira}
            onChange={(e) => setAmountNaira(e.target.value)}
            inputMode="decimal"
            placeholder="5000"
          />
        </label>

        <label className="block">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Channel</div>
          <select
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="BANK_TRANSFER">BANK_TRANSFER</option>
            <option value="CARD">CARD</option>
            <option value="CASH">CASH</option>
            <option value="USSD">USSD</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>
      </div>

      <label className="block">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Narration</div>
        <input
          className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          placeholder="Admin demo repayment"
        />
      </label>

      <button className="jmb-btn w-full" disabled={loading || amountKobo <= 0} onClick={submit}>
        {loading ? "Posting…" : `Post repayment (₦${(amountKobo / 100).toLocaleString()})`}
      </button>

      <p className="text-[11px] text-[var(--jmb-text-mute)]">
        Posts <span className="font-mono">POST /loans/:id/repay</span> via Next.js API route.
      </p>
    </div>
  );
}
