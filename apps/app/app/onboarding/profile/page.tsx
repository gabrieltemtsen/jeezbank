"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Wordmark } from "@/components/Brand";

export default function ProfilePage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", bvn: "", nin: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName) return setError("Name is required");
    setLoading(true);
    try {
      const phone = sessionStorage.getItem("jb_phone") || "";
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create profile");
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "firstName", label: "First name", placeholder: "John" },
    { key: "lastName", label: "Last name", placeholder: "Doe" },
    { key: "bvn", label: "BVN (optional)", placeholder: "22•••••••••" },
    { key: "nin", label: "NIN (optional)", placeholder: "1234••••56" },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 jmb-page-in">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size={56} />
          <div className="mt-4"><Wordmark size="lg" /></div>
          <p className="text-[var(--jmb-text-dim)] text-sm mt-2">Just a few details to set up your wallet.</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Tell us about you</h2>
              <span className="jmb-chip">Step 3 of 3</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-2">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="jmb-input"
                  />
                </div>
              ))}

              {error && (
                <div className="text-sm rounded-xl px-4 py-3"
                     style={{ background: "rgba(255,92,122,0.08)", border: "1px solid rgba(255,92,122,0.25)", color: "var(--jmb-red)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="jmb-btn w-full">
                {loading ? "Creating account..." : "Create my JMB account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
