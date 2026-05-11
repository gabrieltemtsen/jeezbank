"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackBtn, Wordmark } from "@/components/Brand";

const networks = [
  { id: "MTN", label: "MTN", color: "#ffcc00" },
  { id: "Airtel", label: "Airtel", color: "#ff5c5c" },
  { id: "Glo", label: "Glo", color: "#2cd6a0" },
  { id: "9mobile", label: "9mobile", color: "#8ad460" },
];

export default function AirtimePage() {
  const [form, setForm] = useState({ network: "", phone: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 jmb-page-in">
        <div className="relative w-full max-w-sm">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-60 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center jmb-float"
                 style={{ background: "var(--jmb-grad-primary)" }}>
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#06121a]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mt-5">Airtime sent</h2>
            <p className="text-[var(--jmb-text-dim)] text-sm mt-2">
              <span className="text-white font-semibold">₦{form.amount}</span> airtime for {form.phone}
            </p>
            <div className="mt-4 rounded-xl px-3 py-2 text-[11px]"
                 style={{ background: "rgba(255,181,71,0.08)", border: "1px solid rgba(255,181,71,0.25)", color: "var(--jmb-amber)" }}>
              VAS integration coming soon — this is a simulation.
            </div>
            <button onClick={() => router.push("/home")} className="jmb-btn w-full mt-6">Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 jmb-page-in">
      <div className="mx-auto max-w-md px-5 pt-10">
        <header className="flex items-center justify-between mb-6">
          <BackBtn onClick={() => router.back()} />
          <Wordmark size="sm" />
          <div className="w-10" />
        </header>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Buy airtime</h1>
          <p className="text-sm text-[var(--jmb-text-dim)] mt-1">Top up any Nigerian network in seconds.</p>
        </div>

        <div className="jmb-glass rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
             style={{ borderColor: "rgba(255,181,71,0.25)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
               style={{ background: "rgba(255,181,71,0.12)", color: "var(--jmb-amber)" }}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M12 2 1 21h22L12 2zm0 6 7 12H5l7-12zm-1 4v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
          </div>
          <p className="text-xs text-[var(--jmb-text-dim)]">VAS feature — simulated. Real VTpass integration coming soon.</p>
        </div>

        <form onSubmit={handleSubmit} className="jmb-glass rounded-3xl p-6 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Network</label>
            <div className="grid grid-cols-4 gap-2">
              {networks.map((n) => {
                const active = form.network === n.id;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setForm({ ...form, network: n.id })}
                    className="relative rounded-2xl py-3 text-xs font-semibold transition border"
                    style={{
                      background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                      borderColor: active ? n.color : "var(--jmb-border)",
                      color: active ? "#fff" : "var(--jmb-text-dim)",
                    }}
                  >
                    <span className="block w-2 h-2 rounded-full mx-auto mb-1" style={{ background: n.color }} />
                    {n.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Phone number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08012345678"
              className="jmb-input tracking-wider"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Amount</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[100, 200, 500, 1000].map((a) => {
                const active = form.amount === String(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setForm({ ...form, amount: String(a) })}
                    className="rounded-xl py-2.5 text-xs font-semibold transition border"
                    style={{
                      background: active ? "rgba(0,245,160,0.12)" : "rgba(255,255,255,0.02)",
                      borderColor: active ? "rgba(0,245,160,0.5)" : "var(--jmb-border)",
                      color: active ? "#fff" : "var(--jmb-text-dim)",
                    }}
                  >
                    ₦{a}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--jmb-text-dim)]">₦</span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Custom amount"
                min="50"
                className="jmb-input pl-8 font-semibold"
              />
            </div>
          </div>

          <button type="submit" disabled={loading || !form.network} className="jmb-btn w-full">
            {loading ? "Processing..." : "Buy airtime"}
          </button>
        </form>
      </div>
    </div>
  );
}
