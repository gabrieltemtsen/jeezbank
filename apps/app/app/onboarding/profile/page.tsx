"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
            {[
              { key: "firstName", label: "First name", placeholder: "John" },
              { key: "lastName", label: "Last name", placeholder: "Doe" },
              { key: "bvn", label: "BVN (optional)", placeholder: "22*********" },
              { key: "nin", label: "NIN (optional)", placeholder: "1234****56" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {error && <p className="text-red-500 text-sm">{error}</p>}

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
