"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Wordmark } from "@/components/Brand";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 jmb-page-in">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="jmb-float"><Logo size={56} /></div>
          <div className="mt-4 flex items-center gap-2">
            <Wordmark size="lg" />
            <span className="jmb-chip">Admin</span>
          </div>
          <p className="text-sm text-[var(--jmb-text-dim)] mt-2">JMB staff & operations portal</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6">
            <h2 className="text-lg font-semibold text-white">Sign in</h2>
            <p className="text-sm text-[var(--jmb-text-dim)] mt-1 mb-5">Authorized staff only.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="manager@jeezbank.com"
                  className="jmb-input"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="jmb-input"
                  required
                />
              </div>

              {error && (
                <div className="text-sm rounded-xl px-4 py-3"
                     style={{ background: "rgba(255,92,122,0.08)", border: "1px solid rgba(255,92,122,0.25)", color: "var(--jmb-red)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="jmb-btn w-full">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-5 jmb-glass rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)] mb-2">Demo credentials</p>
              <div className="text-xs text-[var(--jmb-text-dim)] space-y-1 font-mono">
                <p>manager@jeezbank.com · password123</p>
                <p>officer@jeezbank.com · password123</p>
                <p>cc@jeezbank.com · password123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-[var(--jmb-text-mute)] mt-6">
          Protected by JMB · Secured by FuseCore
        </p>
      </div>
    </div>
  );
}
