import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCustomer, getTransactions, unwrapList, extractError } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import DataError from "@/components/DataError";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { id } = await params;
  let customer: Record<string, unknown> | null = null;
  let transactions: any[] = [];
  let fetchError: string | null = null;
  let txError: string | null = null;

  try {
    const data = await getCustomer(id);
    customer = data.data || data;
  } catch (err) {
    fetchError = extractError(err);
    console.error(`[customer:${id}] fetch failed:`, fetchError);
  }

  // Recent transactions (best-effort) — if FuseCore exposes accountNumber on customer.
  try {
    const acctNo = String((customer as any)?.accountNumber || (customer as any)?.primaryAccountNumber || "");
    if (acctNo) {
      const raw = await getTransactions({ limit: 20, page: 1, accountNumber: acctNo });
      const { items } = unwrapList<any>(raw);
      transactions = items;
    }
  } catch (err) {
    txError = extractError(err);
    console.error(`[customer:${id}] tx fetch failed:`, txError);
  }

  if (!customer) {
    return (
      <Shell role={session.role} name={session.name}>
        <div className="mb-5">
          <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-[var(--jmb-text-dim)] hover:text-white transition">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Back to customers
          </Link>
        </div>
        <DataError message={fetchError} />
        {!fetchError && (
          <div className="jmb-glass rounded-2xl p-12 text-center">
            <p className="text-[var(--jmb-text-dim)]">Customer not found</p>
            <Link href="/customers" className="jmb-btn jmb-btn-sm mt-4 inline-flex">Back to customers</Link>
          </div>
        )}
      </Shell>
    );
  }

  const name = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Unnamed";
  const initial = name[0]?.toUpperCase() || "?";
  const kyc = String(customer.kycStatus || "PENDING");
  const kycPill = kyc === "VERIFIED" || kyc === "APPROVED" ? "jmb-pill-green" : kyc === "REJECTED" ? "jmb-pill-red" : "jmb-pill-amber";

  return (
    <Shell role={session.role} name={session.name}>
      <div className="mb-5">
        <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-[var(--jmb-text-dim)] hover:text-white transition">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Back to customers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile */}
        <section className="relative lg:col-span-1">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-40 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[#06121a] text-2xl font-bold"
                   style={{ background: "var(--jmb-grad-primary)" }}>
                {initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{name}</h2>
                <p className="text-sm text-[var(--jmb-text-dim)] truncate">{String(customer.phone || "—")}</p>
                <p className="text-sm text-[var(--jmb-text-dim)] truncate">{String(customer.email || "")}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Row label="Customer ID" value={`${String(customer.id || "").slice(0, 16)}…`} mono />
              <Row label="KYC Status" raw={<span className={`jmb-pill ${kycPill}`}>{kyc}</span>} />
              <Row label="Account Status" raw={<span className={`jmb-pill ${customer.isActive ? "jmb-pill-green" : "jmb-pill-red"}`}>{customer.isActive ? "Active" : "Frozen"}</span>} />
              <Row label="Created" value={customer.createdAt ? new Date(String(customer.createdAt)).toLocaleDateString() : "—"} />
            </div>
          </div>
        </section>

        {/* Actions */}
        {(session.role === "MANAGER" || session.role === "OFFICER") && (
          <section className="jmb-glass rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-2">
              <ActionBtn tone="amber" icon="freeze">
                {customer.isActive ? "Freeze account" : "Unfreeze account"}
              </ActionBtn>
              <ActionBtn tone="cyan" icon="check">Approve KYC</ActionBtn>
              {session.role === "MANAGER" && (
                <ActionBtn tone="red" icon="flag">Flag for AML review</ActionBtn>
              )}
            </div>

            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)] mb-2">Audit</p>
              <div className="space-y-2 text-xs text-[var(--jmb-text-dim)]">
                <p>· All actions are logged & immutable</p>
                <p>· Manager-only actions require justification</p>
              </div>
            </div>
          </section>
        )}

        {/* Recent activity */}
        <section className="jmb-glass rounded-3xl p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Recent transactions</h3>
            <span className="jmb-chip">Live</span>
          </div>

          {txError && <DataError title="Couldn't load recent transactions" message={txError} />}
          {transactions.length === 0 ? (
            <div className="text-sm text-[var(--jmb-text-mute)] py-10 text-center">
              {txError ? "Transactions unavailable right now." : "No transactions found (or accountNumber not available)."}
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 12).map((tx: any, i: number) => {
                const isCredit = String(tx.type || "").toUpperCase() === "CREDIT";
                const status = String(tx.status || "—");
                const statusPill =
                  status === "SUCCESS" || status === "SUCCESSFUL" || status === "COMPLETED" ? "jmb-pill-green" :
                  status === "PENDING" || status === "PROCESSING" ? "jmb-pill-amber" :
                  status === "FAILED" || status === "REVERSED" ? "jmb-pill-red" : "jmb-pill-mute";

                return (
                  <a
                    key={i}
                    href={`/transactions/${tx.id}`}
                    className="block rounded-xl border border-white/5 hover:bg-white/5 transition p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-mono text-[var(--jmb-text-mute)] truncate">{String(tx.reference || tx.id || "").slice(0, 16)}…</span>
                      <span className={`jmb-pill ${statusPill}`}>{status}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={`text-sm font-semibold ${isCredit ? "text-[var(--jmb-mint)]" : "text-[var(--jmb-pink)]"}`}>
                        {isCredit ? "+" : "-"}₦{((Number(tx.amount) || 0) / 100).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-[var(--jmb-text-dim)]">{tx.createdAt ? new Date(String(tx.createdAt)).toLocaleString() : "—"}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--jmb-text-dim)] truncate">{String(tx.narration || "—")}</div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* Raw data */}
        <section className="jmb-glass rounded-3xl p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Raw data</h3>
            <span className="jmb-chip">JSON</span>
          </div>
          <pre className="text-[11px] text-[var(--jmb-text-dim)] overflow-auto max-h-72 rounded-xl p-3 jmb-glass-hi font-mono leading-relaxed">
            {JSON.stringify(customer, null, 2)}
          </pre>
        </section>
      </div>
    </Shell>
  );
}

function Row({ label, value, raw, mono }: { label: string; value?: string; raw?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--jmb-text-mute)]">{label}</span>
      {raw ?? <span className={`text-sm font-medium text-white ${mono ? "font-mono" : ""}`}>{value}</span>}
    </div>
  );
}

function ActionBtn({ tone, icon, children }: { tone: "amber" | "cyan" | "red"; icon: "freeze" | "check" | "flag"; children: React.ReactNode }) {
  const color = tone === "amber" ? "var(--jmb-amber)" : tone === "cyan" ? "var(--jmb-cyan)" : "var(--jmb-red)";
  const iconSvg = (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icon === "freeze" && <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>}
      {icon === "check"  && <path d="M5 12l5 5L20 7"/>}
      {icon === "flag"   && <><path d="M4 21V4"/><path d="M4 4h13l-2 4 2 4H4"/></>}
    </svg>
  );
  return (
    <button
      className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition hover:bg-white/5"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 8%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      <span className="inline-flex items-center gap-3 text-sm font-medium">
        {iconSvg}
        {children}
      </span>
      <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
    </button>
  );
}
