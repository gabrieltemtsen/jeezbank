"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Wordmark, BackBtn } from "@/components/Brand";

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bvn: "",
    nin: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName) return setError("First and last name are required");
    if (!form.email) return setError("Email is required");
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

  const requiredFields = [
    { key: "firstName", label: "First name", placeholder: "John", type: "text" },
    { key: "lastName", label: "Last name", placeholder: "Doe", type: "text" },
    { key: "email", label: "Email address", placeholder: "john@example.com", type: "email" },
  ];

  const optionalFields = [
    { key: "bvn", label: "BVN", placeholder: "22*********" },
    { key: "nin", label: "NIN", placeholder: "12345678901" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 jmb-page-in">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size={56} />
          <div className="mt-4"><Wordmark size="lg" /></div>
        </div>

        {/* Card */}
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse"
            style={{ background: "var(--jmb-grad-card)" }}
          />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6">
            {/* Step badge + back */}
            <div className="flex items-center justify-between mb-4">
              <BackBtn onClick={() => router.back()} />
              <span className="jmb-chip">Step 3 of 3</span>
            </div>

            <h2 className="text-lg font-semibold text-white">Complete your profile</h2>
            <p className="text-[var(--jmb-text-dim)] text-sm mt-1 mb-5">
              We need a few details to open your JMB account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Required fields */}
              {requiredFields.map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-1.5">
                    {label} <span style={{ color: "var(--jmb-red)" }}>*</span>
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    required
                    className="jmb-input"
                  />
                </div>
              ))}

              {/* Optional KYC divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px" style={{ background: "var(--jmb-border)" }} />
                <span className="text-[11px] text-[var(--jmb-text-mute)] uppercase tracking-widest">
                  KYC — optional
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--jmb-border)" }} />
              </div>

              {/* Optional fields side by side */}
              <div className="grid grid-cols-2 gap-3">
                {optionalFields.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] mb-1.5">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="jmb-input text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div
                  className="text-sm rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(255,92,122,0.08)",
                    border: "1px solid rgba(255,92,122,0.25)",
                    color: "var(--jmb-red)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="jmb-btn w-full mt-1"
              >
                {loading ? "Creating your account…" : "Create Account →"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] text-[var(--jmb-text-mute)] mt-6 leading-relaxed">
          Your data is encrypted and protected by JMB.
        </p>
      </div>
    </div>
  );
}
