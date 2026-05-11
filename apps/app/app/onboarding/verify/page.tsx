"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo, Wordmark, BackBtn } from "@/components/Brand";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 jmb-page-in">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size={56} />
          <div className="mt-4"><Wordmark size="lg" /></div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6">
            <div className="flex items-center justify-between mb-4">
              <BackBtn onClick={() => router.back()} />
              <span className="jmb-chip">Step 2 of 3</span>
            </div>

            <h2 className="text-lg font-semibold text-white">Verify your number</h2>
            <p className="text-[var(--jmb-text-dim)] text-sm mt-1 mb-5">
              Enter the 6-digit code we sent to <span className="text-white font-medium">+234{phone?.slice(-10)}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                className="jmb-input text-center text-2xl font-bold tracking-[0.55em] py-5"
                required
              />

              {error && (
                <div className="text-sm rounded-xl px-4 py-3"
                     style={{ background: "rgba(255,92,122,0.08)", border: "1px solid rgba(255,92,122,0.25)", color: "var(--jmb-red)" }}>
                  {error}
                </div>
              )}

              <p className="text-[11px] text-[var(--jmb-text-mute)] text-center">
                Dev mode: any 6-digit code works (e.g. 123456)
              </p>

              <button type="submit" disabled={loading} className="jmb-btn w-full">
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
