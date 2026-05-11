"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", bvn: "", nin: "" });
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

  const fields = [
    { key: "firstName", label: "First name", placeholder: "John", type: "text", required: true },
    { key: "lastName", label: "Last name", placeholder: "Doe", type: "text", required: true },
    { key: "email", label: "Email address", placeholder: "john@example.com", type: "email", required: true },
    { key: "bvn", label: "BVN (optional)", placeholder: "22*********", type: "text", required: false },
    { key: "nin", label: "NIN (optional)", placeholder: "1234****56", type: "text", required: false },
  ];

  return (
    <div className="min-h-screen bg-[#0052CC] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">JeezBank</h1>
          <p className="text-blue-200">Complete your profile</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tell us about you</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, placeholder, type, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  required={required}
                  className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052CC] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Creating account..." : "Create my account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
