"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackBtn, Wordmark } from "@/components/Brand";

export default function SendPage() {
  const [form, setForm] = useState({ accountNumber: "", bankCode: "", amount: "", narration: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const banks = [
    { code: "044", name: "Access Bank" },
    { code: "023", name: "Citibank" },
    { code: "063", name: "Diamond Bank" },
    { code: "050", name: "EcoBank" },
    { code: "011", name: "First Bank" },
    { code: "214", name: "FCMB" },
    { code: "058", name: "GTBank" },
    { code: "030", name: "Heritage Bank" },
    { code: "301", name: "Jaiz Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "014", name: "MainStreet Bank" },
    { code: "076", name: "Polaris Bank" },
    { code: "221", name: "Stanbic IBTC" },
    { code: "068", name: "Standard Chartered" },
    { code: "232", name: "Sterling Bank" },
    { code: "033", name: "UBA" },
    { code: "032", name: "Union Bank" },
    { code: "035", name: "Wema Bank" },
    { code: "057", name: "Zenith Bank" },
    { code: "999992", name: "OPay" },
    { code: "000026", name: "Kuda Bank" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amountKobo = Math.round(parseFloat(form.amount) * 100);
    if (isNaN(amountKobo) || amountKobo < 100) return setError("Minimum transfer is ₦1");
    setLoading(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amountKobo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 jmb-page-in">
        <div className="relative w-full max-w-sm">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-60 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center jmb-float"
                 style={{ background: "var(--jmb-grad-primary)" }}>
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#06121a]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mt-5">Transfer successful</h2>
            <p className="text-[var(--jmb-text-dim)] text-sm mt-2">
              <span className="text-white font-semibold">₦{parseFloat(form.amount).toLocaleString()}</span> sent successfully
            </p>
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Send money</h1>
          <p className="text-sm text-[var(--jmb-text-dim)] mt-1">Move funds to any Nigerian bank, instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="jmb-glass rounded-3xl p-6 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Recipient bank</label>
            <select
              value={form.bankCode}
              onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
              className="jmb-input appearance-none pr-10"
              required
            >
              <option value="" className="bg-[var(--jmb-bg-1)]">Select bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code} className="bg-[var(--jmb-bg-1)]">{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Account number</label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="0123456789"
              maxLength={10}
              className="jmb-input tracking-widest"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--jmb-text-dim)]">₦</span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                min="1"
                className="jmb-input pl-8 text-lg font-semibold"
                required
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[1000, 2500, 5000, 10000].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setForm({ ...form, amount: String(q) })}
                  className="jmb-chip hover:bg-white/10 hover:text-white transition"
                >
                  +₦{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Narration</label>
            <input
              type="text"
              value={form.narration}
              onChange={(e) => setForm({ ...form, narration: e.target.value })}
              placeholder="What's it for?"
              className="jmb-input"
            />
          </div>

          {error && (
            <div className="text-sm rounded-xl px-4 py-3"
                 style={{ background: "rgba(255,92,122,0.08)", border: "1px solid rgba(255,92,122,0.25)", color: "var(--jmb-red)" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="jmb-btn w-full">
            {loading ? "Sending..." : "Send Money"}
          </button>
        </form>
      </div>
    </div>
  );
}
