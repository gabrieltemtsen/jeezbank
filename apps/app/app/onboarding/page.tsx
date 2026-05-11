"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Wordmark } from "@/components/Brand";

export default function OnboardingPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) return setError("Enter a valid phone number");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      sessionStorage.setItem("jb_phone", cleaned);
      router.push("/onboarding/verify");
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
          <div className="jmb-float">
            <Logo size={64} />
          </div>
          <div className="mt-5">
            <Wordmark size="xl" />
          </div>
          <p className="text-[var(--jmb-text-dim)] text-sm mt-2">Banking, reimagined for the next generation.</p>
          <span className="jmb-chip mt-4">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--jmb-mint)" }} />
            JMB · Built on FuseCore
          </span>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6">
            <h2 className="text-lg font-semibold text-white">Get started</h2>
            <p className="text-[var(--jmb-text-dim)] text-sm mt-1 mb-5">Enter your phone number to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Phone number</label>
                <div className="flex rounded-2xl overflow-hidden border border-white/10 focus-within:border-[rgba(0,217,245,0.55)] transition">
                  <span className="inline-flex items-center px-3 bg-white/[0.04] text-[var(--jmb-text-dim)] text-sm border-r border-white/10">
                    🇳🇬 +234
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="80 1234 5678"
                    className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-[var(--jmb-text-mute)] focus:outline-none tracking-wider"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm rounded-xl px-4 py-3"
                     style={{ background: "rgba(255,92,122,0.08)", border: "1px solid rgba(255,92,122,0.25)", color: "var(--jmb-red)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="jmb-btn w-full">
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] text-[var(--jmb-text-mute)] mt-6 leading-relaxed">
          By continuing, you agree to JMB's <span className="text-white/80">Terms</span> & <span className="text-white/80">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
