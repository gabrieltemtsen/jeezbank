import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getAccount,
  getTransactions,
  unwrap,
  unwrapList,
  extractError,
} from "@/lib/fusecore";
import { BackBtn, Wordmark } from "@/components/Brand";
import BottomNav from "@/components/BottomNav";
import DataError from "@/components/DataError";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/onboarding");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 50;

  let transactions: Record<string, unknown>[] = [];
  let fetchError: string | null = null;
  let total = 0;

  if (session.accountId) {
    try {
      const acct = unwrap<any>(await getAccount(session.accountId));
      const accountNumber: string | undefined = acct?.accountNumber;
      const raw = await getTransactions({
        accountNumber,
        status: sp.status || undefined,
        page,
        limit,
      });
      const { items, total: t } = unwrapList<Record<string, unknown>>(raw);
      transactions = items;
      total = t;
    } catch (err) {
      fetchError = extractError(err);
      console.error("[app:transactions] fetch failed:", fetchError);
    }
  }

  // Group by day
  const groups: Record<string, Record<string, unknown>[]> = {};
  for (const tx of transactions) {
    const d = tx.createdAt ? new Date(String(tx.createdAt)) : new Date();
    const key = d.toDateString();
    (groups[key] = groups[key] || []).push(tx);
  }
  const groupKeys = Object.keys(groups);

  return (
    <div className="min-h-screen pb-28 jmb-page-in">
      <div className="mx-auto max-w-md px-5 pt-10">
        <header className="flex items-center justify-between mb-6">
          <BackBtn href="/home" />
          <Wordmark size="sm" />
          <div className="w-10" />
        </header>

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Activity</h1>
            <p className="text-sm text-[var(--jmb-text-dim)] mt-1">{total.toLocaleString()} transactions</p>
          </div>
        </div>

        <DataError message={fetchError} />

        {transactions.length === 0 ? (
          <div className="jmb-glass rounded-3xl p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center jmb-glass-hi mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[var(--jmb-text-dim)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l2-5 4 10 2-5h6"/>
              </svg>
            </div>
            <p className="text-white font-medium">
              {fetchError ? "Activity unavailable" : "No activity yet"}
            </p>
            <p className="text-xs text-[var(--jmb-text-mute)] mt-1">
              {fetchError ? "Pull to refresh, or try again shortly." : "Your transactions will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupKeys.map((day) => {
              const txs = groups[day];
              const dayDate = new Date(day);
              const today = new Date();
              const isToday = dayDate.toDateString() === today.toDateString();
              const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
              const isYesterday = dayDate.toDateString() === yesterday.toDateString();
              const label = isToday ? "Today" : isYesterday ? "Yesterday" : dayDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

              return (
                <div key={day}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)] mb-2 px-1">{label}</p>
                  <div className="jmb-glass rounded-2xl divide-y divide-white/5 overflow-hidden">
                    {txs.map((tx, i) => {
                      const isCredit = String(tx.type || "").toUpperCase() === "CREDIT";
                      const status = String(tx.status || "");
                      return (
                        <Link
                          key={String(tx.id || i)}
                          href={`/transactions/${tx.id || ""}`}
                          className="flex items-center justify-between p-4 hover:bg-white/[0.04] transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isCredit ? "bg-[rgba(44,214,160,0.12)] text-[var(--jmb-green)]" : "bg-[rgba(255,92,122,0.12)] text-[var(--jmb-red)]"}`}>
                              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                {isCredit ? <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></> : <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>}
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{String(tx.narration || "Transaction")}</p>
                              <p className="text-[11px] text-[var(--jmb-text-mute)] truncate">
                                {tx.reference ? `Ref ${String(tx.reference).slice(0, 10)}…` : ""}
                                {tx.createdAt ? ` · ${new Date(String(tx.createdAt)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-3">
                            <p className={`text-sm font-semibold ${isCredit ? "text-[var(--jmb-green)]" : "text-white"}`}>
                              {isCredit ? "+" : "-"}₦{((Number(tx.amount) || 0) / 100).toLocaleString()}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-[var(--jmb-text-mute)] mt-0.5">{status}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
