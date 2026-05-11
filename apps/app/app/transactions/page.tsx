import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAccountTransactions } from "@/lib/fusecore";
import Link from "next/link";

export default async function TransactionsPage() {
  const session = await getSession();
  if (!session) redirect("/onboarding");

  let transactions: Record<string, unknown>[] = [];
  if (session.accountId) {
    try {
      const data = await getAccountTransactions(session.accountId, { limit: 50 });
      transactions = data.data || data || [];
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0052CC] px-6 pt-12 pb-6">
        <Link href="/home" className="text-white mb-4 flex items-center gap-2">← Back</Link>
        <h1 className="text-white text-2xl font-bold">Transaction History</h1>
      </div>

      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    ${tx.type === "CREDIT" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                    {tx.type === "CREDIT" ? "↙" : "↗"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{String(tx.narration || "Transaction")}</p>
                    <p className="text-xs text-gray-400">{tx.reference ? `Ref: ${String(tx.reference).slice(0, 12)}...` : ""}</p>
                    <p className="text-xs text-gray-400">{tx.createdAt ? new Date(String(tx.createdAt)).toLocaleString() : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold block ${tx.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "CREDIT" ? "+" : "-"}₦{((Number(tx.amount) || 0) / 100).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">{String(tx.status || "")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
