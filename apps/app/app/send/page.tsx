"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Transfer Successful!</h2>
        <p className="text-gray-500 text-sm mb-6">₦{parseFloat(form.amount).toLocaleString()} sent successfully</p>
        <button onClick={() => router.push("/home")} className="w-full bg-[#0052CC] text-white py-3 rounded-xl font-semibold">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0052CC] px-6 pt-12 pb-6">
        <button onClick={() => router.back()} className="text-white mb-4 flex items-center gap-2">← Back</button>
        <h1 className="text-white text-2xl font-bold">Send Money</h1>
      </div>

      <div className="px-6 mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
            <select
              value={form.bankCode}
              onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select bank</option>
              {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account number</label>
            <input type="text" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="0123456789" maxLength={10} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00" min="1" className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Narration</label>
            <input type="text" value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })}
              placeholder="Payment for..." className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#0052CC] text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition">
            {loading ? "Sending..." : "Send Money"}
          </button>
        </form>
      </div>
    </div>
  );
}
