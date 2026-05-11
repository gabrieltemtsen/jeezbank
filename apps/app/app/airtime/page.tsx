"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const networks = ["MTN", "Airtel", "Glo", "9mobile"];

export default function AirtimePage() {
  const [form, setForm] = useState({ network: "", phone: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // VAS not yet on FuseCore — simulated
    await new Promise((r) => setTimeout(r, 1500));
    setSuccess(true);
    setLoading(false);
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Airtime Sent!</h2>
        <p className="text-gray-500 text-sm mb-2">₦{form.amount} airtime for {form.phone}</p>
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mb-6">Note: VAS integration coming soon — this is a simulation</p>
        <button onClick={() => router.push("/home")} className="w-full bg-[#0052CC] text-white py-3 rounded-xl font-semibold">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0052CC] px-6 pt-12 pb-6">
        <button onClick={() => router.back()} className="text-white mb-4">← Back</button>
        <h1 className="text-white text-2xl font-bold">Buy Airtime</h1>
      </div>

      <div className="px-6 mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <p className="text-amber-700 text-xs">⚠️ VAS feature — simulated. Real VTpass integration coming soon.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
            <div className="grid grid-cols-4 gap-2">
              {networks.map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, network: n })}
                  className={`py-2 rounded-xl text-sm font-medium border transition ${form.network === n ? "bg-[#0052CC] text-white border-transparent" : "border-gray-200 text-gray-600"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08012345678" className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[100, 200, 500, 1000].map((a) => (
                <button key={a} type="button" onClick={() => setForm({ ...form, amount: String(a) })}
                  className={`py-2 rounded-xl text-sm border transition ${form.amount === String(a) ? "bg-[#0052CC] text-white border-transparent" : "border-gray-200 text-gray-600"}`}>
                  ₦{a}
                </button>
              ))}
            </div>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Custom amount" min="50" className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={loading || !form.network}
            className="w-full bg-[#0052CC] text-white py-3 rounded-xl font-semibold disabled:opacity-50">
            {loading ? "Processing..." : "Buy Airtime"}
          </button>
        </form>
      </div>
    </div>
  );
}
