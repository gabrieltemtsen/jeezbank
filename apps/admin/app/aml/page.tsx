import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getAmlAlerts } from "@/lib/fusecore";
import Sidebar from "@/components/Sidebar";

export default async function AmlPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  if (session.role !== "MANAGER") redirect("/dashboard");

  let alerts: Record<string, unknown>[] = [];
  try {
    const data = await getAmlAlerts({ limit: 50 });
    alerts = data.data || data || [];
  } catch {}

  const severityColor: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    LOW: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AML Alert Queue</h1>
        <p className="text-gray-500 text-sm mb-8">{alerts.length} active alerts requiring review</p>

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
              <p className="text-4xl mb-3">✅</p>
              <p>No active AML alerts</p>
            </div>
          ) : (
            alerts.map((alert, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">🚨</div>
                  <div>
                    <p className="font-semibold text-gray-800">{String(alert.ruleType || "Unknown Rule")}</p>
                    <p className="text-sm text-gray-500">Customer: {String(alert.customerId || "—")}</p>
                    <p className="text-xs text-gray-400">{alert.createdAt ? new Date(String(alert.createdAt)).toLocaleString() : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColor[String(alert.severity)] || "bg-gray-100 text-gray-700"}`}>
                    {String(alert.severity || "UNKNOWN")}
                  </span>
                  <button className="bg-[#0052CC] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                    Review
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
