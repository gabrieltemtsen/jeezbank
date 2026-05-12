import { redirect } from "next/navigation";
import Link from "next/link";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import DataError from "@/components/DataError";
import { getAdminSession } from "@/lib/auth";
import { extractError, getAccounts, getAccountByAccountNumber, unwrapList } from "@/lib/fusecore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; accountNumber?: string; status?: string; type?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 20;

  let items: any[] = [];
  let total = 0;
  let error: string | null = null;

  // Fast path: search by account number (exact)
  const acctNo = (sp.accountNumber || "").trim();
  if (acctNo) {
    try {
      const raw = await getAccountByAccountNumber(acctNo);
      const payload: any = raw?.data ?? raw;
      const one = payload?.account ?? payload?.data ?? payload;
      items = one ? [one] : [];
      total = items.length;
    } catch (err) {
      error = extractError(err);
    }
  } else {
    try {
      const raw = await getAccounts({
        page,
        limit,
        status: sp.status || undefined,
        type: sp.type || undefined,
      });
      const { items: list, total: t } = unwrapList<any>(raw);
      items = list;
      total = t;
    } catch (err) {
      error = extractError(err);
    }
  }

  return (
    <Shell role={session.role} name={session.name}>
      <PageHeader
        title="Accounts"
        subtitle={`${total.toLocaleString()} account${total === 1 ? "" : "s"}`}
        actions={
          <form className="flex items-center gap-2">
            <input
              name="accountNumber"
              placeholder="Account number"
              defaultValue={sp.accountNumber}
              className="jmb-input w-48"
            />
            <select name="status" defaultValue={sp.status || ""} className="jmb-input w-40">
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="FROZEN">FROZEN</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <select name="type" defaultValue={sp.type || ""} className="jmb-input w-40">
              <option value="">All types</option>
              <option value="SAVINGS">SAVINGS</option>
              <option value="CURRENT">CURRENT</option>
              <option value="FIXED_DEPOSIT">FIXED_DEPOSIT</option>
            </select>
            <button className="jmb-btn jmb-btn-sm">Filter</button>
          </form>
        }
      />

      {error && <DataError message={error} />}

      <div className="jmb-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="jmb-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th className="text-right">Balance</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--jmb-text-mute)] py-12">
                    No accounts found
                  </td>
                </tr>
              ) : (
                items.map((a, i) => {
                  const acct = String(a.accountNumber || a.number || a.id || "");
                  const custName =
                    String(a.customerName || "").trim() ||
                    `${String(a.customer?.firstName || "")} ${String(a.customer?.lastName || "")}`.trim() ||
                    String(a.customerId ?? "—");
                  const status = String(a.status || a.state || "—");
                  const statusPill =
                    status === "ACTIVE" ? "jmb-pill-green" : status === "FROZEN" ? "jmb-pill-amber" : "jmb-pill-mute";
                  const bal = Number(a.balance ?? a.availableBalance ?? 0);

                  return (
                    <tr key={i}>
                      <td>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate font-mono">{acct}</p>
                          <p className="text-[11px] text-[var(--jmb-text-mute)] truncate">ID: {String(a.id ?? "—")}</p>
                        </div>
                      </td>
                      <td className="text-[var(--jmb-text-dim)] truncate max-w-[220px]">{custName || "—"}</td>
                      <td><span className="jmb-pill jmb-pill-mute">{String(a.type || a.accountType || "—")}</span></td>
                      <td><span className={`jmb-pill ${statusPill}`}>{status}</span></td>
                      <td className="text-right font-semibold text-white">₦{(bal / 100).toLocaleString()}</td>
                      <td className="text-right">
                        <Link href={`/accounts/${a.id}`} className="jmb-btn-ghost jmb-btn-sm">
                          View
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!acctNo && (
        <Pagination basePath="/accounts" page={page} pageSize={limit} total={total} query={{ status: sp.status, type: sp.type }} />
      )}
    </Shell>
  );
}
