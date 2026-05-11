"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const p = sessionStorage.getItem("jb_phone");
    if (!p) router.replace("/onboarding");
    else setPhone(p);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) return setError("Enter the 6-digit code");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      if (data.isNewUser) router.push("/onboarding/profile");
      else router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0052CC] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">JeezBank</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <button onClick={() => router.back()} className="text-gray-400 text-sm mb-4">← Back</button>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Verify your number</h2>
          <p className="text-gray-500 text-sm mb-6">
            Enter the 6-digit code sent to <span className="font-medium text-gray-700">+234{phone?.slice(-10)}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              placeholder="000000"
              className="w-full border border-gray-300 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <p className="text-xs text-gray-400 text-center">
              💡 Dev mode: use any 6-digit code (e.g. 123456)
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052CC] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
