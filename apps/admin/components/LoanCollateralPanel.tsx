"use client";

import { useState } from "react";
import ActionToast from "@/components/ActionToast";

export default function LoanCollateralPanel({ loanId }: { loanId: string }) {
  const [type, setType] = useState("VEHICLE");
  const [valueNaira, setValueNaira] = useState("100000");
  const [description, setDescription] = useState("Demo collateral");
  const [reference, setReference] = useState("COLL-REF-001");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function submit() {
    setLoading(true);
    setToast(null);
    try {
      const value = Math.round(Number(valueNaira) * 100);
      if (!Number.isFinite(value) || value <= 0) throw new Error("Enter a valid value");

      const res = await fetch(`/api/loans/${loanId}/collateral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value, description, reference }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setToast({ kind: "success", text: "Collateral added. Refreshing…" });
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
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Type</div>
          <select
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="VEHICLE">VEHICLE</option>
            <option value="PROPERTY">PROPERTY</option>
            <option value="SALARY">SALARY</option>
            <option value="GUARANTOR">GUARANTOR</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>

        <label className="block">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Value (₦)</div>
          <input
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={valueNaira}
            onChange={(e) => setValueNaira(e.target.value)}
            inputMode="decimal"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Description</div>
        <input
          className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="block">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Reference</div>
        <input
          className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </label>

      <button className="jmb-btn w-full" disabled={loading} onClick={submit}>
        {loading ? "Adding…" : "Add collateral"}
      </button>
    </div>
  );
}
