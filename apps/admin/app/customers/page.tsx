import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCustomers, unwrapList, extractError } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import DataError from "@/components/DataError";
import Link from "next/link";

// Never cache — always fetch fresh from FuseCore on every request.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;

  let customers: Record<string, unknown>[] = [];
  let total = 0;
  let fetchError: string | null = null;

  try {
    const raw = await getCustomers({ page, limit, search: params.search });
    const { items, total: t } = unwrapList<Record<string, unknown>>(raw);
    customers = items;
    total = t;
  } catch (err) {
    fetchError = extractError(err);
    console.error("[customers] fetch failed:", fetchError);
  }

  return (
    <Shell role={session.role} name={session.name}>
      <PageHeader
        title="Customers"
        subtitle={<span>{total.toLocaleString()} total customers</span>}
        actions={
          <form className="flex gap-2">
            <div className="relative">
              <svg viewBox="0 0 24 24" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--jmb-text-mute)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
              <input name="search" defaultValue={params.search} placeholder="Search customers..."
                     className="jmb-input pl-9 w-72" />
            </div>
            <button className="jmb-btn jmb-btn-sm">Search</button>
          </form>
        }
      />

      <DataError message={fetchError} />

      <div className="jmb-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="jmb-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>KYC</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--jmb-text-mute)] py-12">
                    {fetchError ? "Couldn't load customers (see error above)" : "No customers found"}
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => {
                  const name = `${String(c.firstName || "")} ${String(c.lastName || "")}`.trim() || "Unnamed";
                  const initial = name[0]?.toUpperCase() || "?";
                  const kyc = String(c.kycStatus || "PENDING");
                  const kycPill = kyc === "VERIFIED" || kyc === "APPROVED" ? "jmb-pill-green" : kyc === "REJECTED" ? "jmb-pill-red" : "jmb-pill-amber";
                  return (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#06121a] font-bold text-sm shrink-0"
                               style={{ background: "var(--jmb-grad-primary)" }}>
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{name}</p>
                            <p className="text-[11px] text-[var(--jmb-text-mute)] truncate font-mono">{String(c.id || "").slice(0, 14)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-[var(--jmb-text-dim)]">{String(c.phone || "—")}</td>
                      <td className="text-[var(--jmb-text-dim)]">{String(c.email || "—")}</td>
                      <td><span className={`jmb-pill ${kycPill}`}>{kyc}</span></td>
                      <td>
                        <span className={`jmb-pill ${c.isActive ? "jmb-pill-green" : "jmb-pill-red"}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                          {c.isActive ? "Active" : "Frozen"}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link href={`/customers/${c.id}`} className="jmb-btn-ghost jmb-btn-sm">
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

      <Pagination
        basePath="/customers"
        page={page}
        pageSize={limit}
        total={total}
        query={{ search: params.search }}
      />
    </Shell>
  );
}
