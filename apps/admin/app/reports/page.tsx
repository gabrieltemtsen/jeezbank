import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCbnReturns } from "@/lib/fusecore";
import Sidebar from "@/components/Sidebar";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  if (session.role !== "MANAGER") redirect("/dashboard");

  const params = await searchParams;
  const period = params.period || new Date().toISOString().slice(0, 7); // YYYY-MM
  let report: Record<string, unknown> | null = null;

  try {
    const data = await getCbnReturns({ period, format: "json" });
    report = data.data || data;
  } catch {}

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CBN Monthly Returns</h1>
            <p className="text-gray-500 text-sm">Regulatory reporting — Central Bank of Nigeria</p>
          </div>
          <form className="flex gap-2">
            <input type="month" name="period" defaultValue={period}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button className="bg-[#0052CC] text-white px-4 py-2 rounded-xl text-sm font-medium">Generate</button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {!report ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No report data for {period}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Period: {period}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  (report as Record<string, unknown>).readyForSubmission ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {(report as Record<string, unknown>).readyForSubmission ? "✅ Ready for submission" : "⚠️ Not ready — review required"}
                </span>
              </div>
              <pre className="text-xs text-gray-600 overflow-auto max-h-96 bg-gray-50 p-4 rounded-xl">
                {JSON.stringify(report, null, 2)}
              </pre>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
