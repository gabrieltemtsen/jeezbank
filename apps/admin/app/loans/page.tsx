import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getLoans } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default async function LoansPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  let loans: Record<string, unknown>[] = [];
  try {
    const data = await getLoans({ limit: 50 });
    loans = data.data || data || [];
  } catch {}

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
        subtitle={`${loans.length} loans · portfolio value ₦${(portfolio / 100).toLocaleString()}`}
        actions={<button className="jmb-btn jmb-btn-sm">New facility</button>}
      />

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
                <tr><td colSpan={6} className="text-center text-[var(--jmb-text-mute)] py-12">No loans found</td></tr>
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
    </Shell>
  );
}
