import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { getLoans, unwrapList, extractError } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import DataError from "@/components/DataError";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 20;

  let loans: Record<string, unknown>[] = [];
  let total = 0;
  let fetchError: string | null = null;
  try {
    const raw = await getLoans({ limit, page });
    const { items, total: t } = unwrapList<Record<string, unknown>>(raw);
    loans = items;
    total = t;
  } catch (err) {
    fetchError = extractError(err);
    console.error("[loans] fetch failed:", fetchError);
  }

  const statusPill: Record<string, string> = {
    PENDING:   "jmb-pill-amber",
    APPROVED:  "jmb-pill-cyan",
    DISBURSED: "jmb-pill-green",
    REPAID:    "jmb-pill-mute",
    DEFAULTED: "jmb-pill-red",
  };

  const portfolio = loans.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);

  return (
    <Shell role={session.role} name={session.name}>
      <PageHeader
        title="Loans"
        subtitle={`${total.toLocaleString()} loan${total === 1 ? "" : "s"} · portfolio value ₦${(portfolio / 100).toLocaleString()}`}
        actions={<button className="jmb-btn jmb-btn-sm">New facility</button>}
      />

      <DataError message={fetchError} />

      <div className="jmb-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="jmb-table">
            <thead>
              <tr>
                <th>Loan</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--jmb-text-mute)] py-12">
                    {fetchError ? "Couldn't load loans (see error above)" : "No loans found"}
                  </td>
                </tr>
              ) : (
                loans.map((loan, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-[var(--jmb-text-dim)]">{String(loan.id || "").slice(0, 14)}…</td>
                    <td className="text-[var(--jmb-text-dim)] font-mono text-xs">{String(loan.customerId || "—").slice(0, 14)}…</td>
                    <td className="font-semibold text-white">₦{((Number(loan.amount) || 0) / 100).toLocaleString()}</td>
                    <td>
                      <span className={`jmb-pill ${statusPill[String(loan.status)] || "jmb-pill-mute"}`}>
                        {String(loan.status || "—")}
                      </span>
                    </td>
                    <td className="text-xs text-[var(--jmb-text-mute)]">
                      {loan.dueDate ? new Date(String(loan.dueDate)).toLocaleDateString() : "—"}
                    </td>
                    <td className="text-right">
                      <Link href={`/loans/${loan.id}`} className="jmb-btn-ghost jmb-btn-sm">
                        View
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination basePath="/loans" page={page} pageSize={limit} total={total} />
    </Shell>
  );
}
