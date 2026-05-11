import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/onboarding");

  const tierLabels = ["Unverified", "Basic KYC", "Full KYC"];
  const tierColors = ["text-red-500", "text-amber-500", "text-green-500"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0052CC] px-6 pt-12 pb-16">
        <Link href="/home" className="text-white mb-4 flex items-center gap-2">← Back</Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
            {(session.name || "J")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{session.name || "JeezBank User"}</h1>
            <p className="text-blue-200 text-sm">{session.phone}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Account Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">KYC Level</span>
              <span className={`text-sm font-semibold ${tierColors[session.kycTier] || "text-gray-600"}`}>
                {tierLabels[session.kycTier] || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Customer ID</span>
              <span className="text-sm text-gray-700">{session.customerId?.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Account ID</span>
              <span className="text-sm text-gray-700">{session.accountId?.slice(0, 12)}...</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {[
            { label: "Security", icon: "🔒" },
            { label: "Notifications", icon: "🔔" },
            { label: "Help & Support", icon: "💬" },
            { label: "About JeezBank", icon: "ℹ️" },
          ].map(({ label, icon }) => (
            <button key={label} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span>{icon}</span>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          ))}
        </div>

        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="w-full bg-red-50 text-red-600 py-3 rounded-2xl font-semibold border border-red-100">
            Log Out
          </button>
        </form>
      </div>
    </div>
  );
}
