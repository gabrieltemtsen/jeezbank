import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCbnReturns, extractError } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import DataError from "@/components/DataError";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  if (session.role !== "MANAGER") redirect("/dashboard");

  const params = await searchParams;
  const period = params.period || new Date().toISOString().slice(0, 7);
  let report: Record<string, unknown> | null = null;
  let fetchError: string | null = null;

  try {
    const data = await getCbnReturns({ period, format: "json" });
    report = data.data || data;
  } catch (err) {
    fetchError = extractError(err);
    console.error("[reports] fetch failed:", fetchError);
  }

  const ready = !!(report && (report as Record<string, unknown>).readyForSubmission);

  return (
    <Shell role={session.role} name={session.name}>
      <PageHeader
        title="CBN Monthly Returns"
        subtitle="Regulatory reporting · Central Bank of Nigeria"
        actions={
          <form className="flex gap-2 items-center">
            <input type="month" name="period" defaultValue={period} className="jmb-input w-44" />
            <button className="jmb-btn jmb-btn-sm">Generate</button>
          </form>
        }
      />

      <DataError message={fetchError} />

      <div className="jmb-glass rounded-2xl p-6">
        {!report ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center jmb-glass-hi mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[var(--jmb-text-dim)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>
              </svg>
            </div>
            <p className="text-white font-medium">No report data</p>
            <p className="text-xs text-[var(--jmb-text-mute)] mt-1">No CBN return data for {period}.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Period</p>
                <p className="text-lg font-bold text-white mt-1">{period}</p>
              </div>
              <span className={`jmb-pill ${ready ? "jmb-pill-green" : "jmb-pill-amber"}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                {ready ? "Ready for submission" : "Review required"}
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--jmb-text-mute)]">Payload</p>
              <span className="jmb-chip">JSON</span>
            </div>
            <pre className="text-[11px] text-[var(--jmb-text-dim)] overflow-auto max-h-[28rem] jmb-glass-hi rounded-xl p-4 font-mono leading-relaxed">
              {JSON.stringify(report, null, 2)}
            </pre>

            <div className="mt-5 flex gap-2 justify-end">
              <button className="jmb-btn-ghost jmb-btn-sm">Download JSON</button>
              <button className="jmb-btn jmb-btn-sm" disabled={!ready}>Submit to CBN</button>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
