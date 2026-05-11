import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getAmlAlerts } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";

export default async function AmlPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  if (session.role !== "MANAGER") redirect("/dashboard");

  let alerts: Record<string, unknown>[] = [];
  try {
    const data = await getAmlAlerts({ limit: 50 });
    alerts = data.data || data || [];
  } catch {}

  const sev = (s: string) =>
    s === "HIGH" ? "jmb-pill-red" :
    s === "MEDIUM" ? "jmb-pill-amber" :
    s === "LOW" ? "jmb-pill-yellow" : "jmb-pill-mute";

  const high = alerts.filter((a) => a.severity === "HIGH").length;
  const medium = alerts.filter((a) => a.severity === "MEDIUM").length;
  const low = alerts.filter((a) => a.severity === "LOW").length;

  return (
    <Shell role={session.role} name={session.name}>
      <PageHeader
        title="AML Alert Queue"
        subtitle={`${alerts.length} active alerts requiring review`}
        actions={<button className="jmb-btn-ghost jmb-btn-sm">Export queue</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SevCard label="High severity" count={high} tone="red" />
        <SevCard label="Medium" count={medium} tone="amber" />
        <SevCard label="Low" count={low} tone="yellow" />
      </div>

      {alerts.length === 0 ? (
        <div className="jmb-glass rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center jmb-glass-hi mb-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[var(--jmb-mint)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7"/>
            </svg>
          </div>
          <p className="text-white font-medium">No active AML alerts</p>
          <p className="text-xs text-[var(--jmb-text-mute)] mt-1">Queue is clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const severity = String(alert.severity || "UNKNOWN");
            return (
              <div key={i} className="jmb-glass rounded-2xl p-5 flex items-center justify-between gap-4 hover:bg-white/[0.06] transition">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ background: "rgba(255,92,122,0.10)", color: "var(--jmb-red)", border: "1px solid rgba(255,92,122,0.25)" }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2 1 21h22L12 2z"/><path d="M12 9v5"/><path d="M12 17h.01"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{String(alert.ruleType || "Unknown rule")}</p>
                    <p className="text-xs text-[var(--jmb-text-dim)] truncate font-mono">Customer · {String(alert.customerId || "—")}</p>
                    <p className="text-[11px] text-[var(--jmb-text-mute)] mt-0.5">
                      {alert.createdAt ? new Date(String(alert.createdAt)).toLocaleString() : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`jmb-pill ${sev(severity)}`}>{severity}</span>
                  <button className="jmb-btn jmb-btn-sm">Review →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

function SevCard({ label, count, tone }: { label: string; count: number; tone: "red" | "amber" | "yellow" }) {
  const color = tone === "red" ? "var(--jmb-red)" : tone === "amber" ? "var(--jmb-amber)" : "var(--jmb-yellow)";
  return (
    <div className="jmb-glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)]">{label}</p>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      </div>
      <p className="text-3xl font-bold text-white mt-2">{count}</p>
      <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full" style={{ width: `${Math.min(100, count * 10)}%`, background: color }} />
      </div>
    </div>
  );
}
