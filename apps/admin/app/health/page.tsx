import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

interface ServiceStatus {
  label: string;
  key: string;
  description: string;
}

const SERVICES: ServiceStatus[] = [
  { key: "database", label: "Database (MySQL)", description: "Primary tenant data store" },
  { key: "redis", label: "Redis", description: "Cache + BullMQ queue broker" },
  { key: "queues", label: "Job Queues", description: "Transactions, Loans, AML, Notifications, Outbox" },
];

async function fetchHealth() {
  const BASE = process.env.FUSECORE_BASE_URL || "http://localhost:3000/api/v1";
  const KEY = process.env.FUSECORE_API_KEY || "";
  const ROOT = BASE.replace("/api/v1", "");

  async function probe(path: string) {
    try {
      const res = await fetch(`${ROOT}${path}`, {
        headers: { "X-API-Key": KEY },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  const [ready, live] = await Promise.all([
    probe("/api/v1/health/ready"),
    probe("/api/v1/health/live"),
  ]);

  return { ready, live };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    up: { label: "Operational", dot: "#2cd6a0", bg: "rgba(44,214,160,0.1)", text: "#2cd6a0" },
    ok: { label: "Healthy", dot: "#2cd6a0", bg: "rgba(44,214,160,0.1)", text: "#2cd6a0" },
    healthy: { label: "Healthy", dot: "#2cd6a0", bg: "rgba(44,214,160,0.1)", text: "#2cd6a0" },
    down: { label: "Down", dot: "#ff5c7a", bg: "rgba(255,92,122,0.1)", text: "#ff5c7a" },
    error: { label: "Error", dot: "#ff5c7a", bg: "rgba(255,92,122,0.1)", text: "#ff5c7a" },
    degraded: { label: "Degraded", dot: "#ffb547", bg: "rgba(255,181,71,0.1)", text: "#ffb547" },
    unknown: { label: "Unknown", dot: "#6b7390", bg: "rgba(107,115,144,0.1)", text: "#6b7390" },
  };

  const s = map[status?.toLowerCase()] ?? map.unknown;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

export default async function HealthPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { ready, live } = await fetchHealth();

  // Terminus ready shape: { status, info, error, details: { database, redis, queues } }
  const overall = ready?.status === "ok" ? "healthy" : ready ? "degraded" : "down";
  const uptime = live?.uptime ? Math.floor(live.uptime) : null;
  const uptimeStr = uptime
    ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`
    : "—";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-500 text-sm mt-1">
              FuseCore infrastructure status — live check on every page load
            </p>
          </div>
          <StatusBadge status={overall} />
        </div>

        {/* Overall + uptime */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Overall Status",
              value: <StatusBadge status={overall} />,
              sub: "FuseCore core banking API",
            },
            {
              label: "Uptime",
              value: <span className="text-2xl font-bold text-gray-900">{uptimeStr}</span>,
              sub: "Since last restart",
            },
            {
              label: "Last Checked",
              value: (
                <span className="text-lg font-semibold text-gray-900">
                  {live?.timestamp ? new Date(live.timestamp).toLocaleTimeString() : "—"}
                </span>
              ),
              sub: live?.timestamp ? new Date(live.timestamp).toLocaleDateString() : "Unavailable",
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{label}</p>
              <div className="mb-1">{value}</div>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Service breakdown */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Service Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Based on FuseCore <code className="bg-gray-100 px-1 rounded">GET /health/ready</code> — @nestjs/terminus health check
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {SERVICES.map(({ key, label, description }) => {
              const status = ready?.details?.[key]?.status ?? (ready ? "unknown" : "down");
              return (
                <div key={key} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
              );
            })}

            {/* Liveness */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">API Process</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  <code className="bg-gray-100 px-1 rounded">GET /health/live</code> — process liveness
                </p>
              </div>
              <StatusBadge status={live?.status ?? "down"} />
            </div>
          </div>
        </div>

        {/* Raw response */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Raw FuseCore Response</h2>
            <p className="text-xs text-gray-400 mt-0.5">Exact JSON from FuseCore health endpoints</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                /health/ready
              </p>
              <pre className="text-xs bg-gray-50 rounded-xl p-4 overflow-auto max-h-64 text-gray-700">
                {ready ? JSON.stringify(ready, null, 2) : "Unavailable"}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                /health/live
              </p>
              <pre className="text-xs bg-gray-50 rounded-xl p-4 overflow-auto max-h-64 text-gray-700">
                {live ? JSON.stringify(live, null, 2) : "Unavailable"}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
