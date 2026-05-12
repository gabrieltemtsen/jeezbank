import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getTransactions } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; accountNumber?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 50;

  let transactions: Record<string, any>[] = [];
  let total = 0;

  try {
    const data = await getTransactions({
      page,
      limit,
      status: sp.status || undefined,
      accountNumber: sp.accountNumber || undefined,
    });
    const payload = data.data ?? data;
    transactions = payload.items ?? payload.data ?? payload.transactions ?? payload ?? [];
    total = payload.total ?? payload.meta?.total ?? transactions.length;
  } catch {}

  const credits = transactions.filter((t) => String(t.type).toUpperCase() === "CREDIT").length;
  const debits = transactions.filter((t) => String(t.type).toUpperCase() === "DEBIT").length;
  const totalVolume = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  return (
    <Shell role={session.role} name={session.name}>
      <PageHeader
        title="Transaction Monitoring"
        subtitle={`${total.toLocaleString()} transactions · live from FuseCore`}
        actions={
          <form className="flex gap-2 items-center">
            <input
              name="accountNumber"
              placeholder="Account number"
              defaultValue={sp.accountNumber}
              className="jmb-input w-44"
            />
            <select name="status" defaultValue={sp.status || ""} className="jmb-input w-44">
              <option value="">All statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SUCCESSFUL">SUCCESSFUL</option>
              <option value="FAILED">FAILED</option>
              <option value="REVERSED">REVERSED</option>
            </select>
            <button className="jmb-btn jmb-btn-sm">Filter</button>
          </form>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Kpi label="Volume (sample)" value={`₦${(totalVolume / 100).toLocaleString()}`} accent="var(--jmb-cyan)" />
        <Kpi label="Credits" value={String(credits)} accent="var(--jmb-mint)" />
        <Kpi label="Debits" value={String(debits)} accent="var(--jmb-pink)" />
      </div>

      <div className="jmb-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="jmb-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Narration</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-[var(--jmb-text-mute)] py-12">No transactions found</td></tr>
              ) : (
                transactions.map((tx, i) => {
                  const isCredit = String(tx.type || "").toUpperCase() === "CREDIT";
                  const status = String(tx.status || "");
                  const statusPill =
                    status === "SUCCESS" || status === "SUCCESSFUL" || status === "COMPLETED" ? "jmb-pill-green" :
                    status === "PENDING" || status === "PROCESSING" ? "jmb-pill-amber" :
                    status === "FAILED" || status === "REVERSED" ? "jmb-pill-red" : "jmb-pill-mute";
                  return (
                    <tr key={i}>
                      <td className="font-mono text-xs text-[var(--jmb-text-dim)]">
                        <a className="hover:underline" href={`/transactions/${tx.id}`}>{String(tx.reference || tx.id || "").slice(0, 16)}…</a>
                      </td>
                      <td>
                        <span className={`jmb-pill ${isCredit ? "jmb-pill-green" : "jmb-pill-red"}`}>
                          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            {isCredit ? <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></> : <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>}
                          </svg>
                          {String(tx.type || "")}
                        </span>
                      </td>
                      <td className="font-semibold text-white">
                        {isCredit ? "+" : "-"}₦{((Number(tx.amount) || 0) / 100).toLocaleString()}
                      </td>
                      <td><span className={`jmb-pill ${statusPill}`}>{status || "—"}</span></td>
                      <td className="text-[var(--jmb-text-dim)] truncate max-w-[260px]">{String(tx.narration || "—")}</td>
                      <td className="text-xs text-[var(--jmb-text-mute)]">{tx.createdAt ? new Date(String(tx.createdAt)).toLocaleString() : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        basePath="/transactions"
        page={page}
        pageSize={limit}
        total={total}
        query={{ status: sp.status, accountNumber: sp.accountNumber }}
      />
    </Shell>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="jmb-glass rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)]">{label}</p>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
      <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-2/5" style={{ background: accent }} />
      </div>
    </div>
  );
}
