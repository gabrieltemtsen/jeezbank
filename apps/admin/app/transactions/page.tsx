import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getTransactions } from "@/lib/fusecore";
import Sidebar from "@/components/Sidebar";

export default async function TransactionsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  let transactions: Record<string, unknown>[] = [];
  try {
    const data = await getTransactions({ limit: 50 });
    transactions = data.data || data || [];
  } catch {}

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Transaction Monitoring</h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Reference", "Type", "Amount", "Status", "Narration", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No transactions found</td></tr>
              ) : (
                transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{String(tx.reference || "").slice(0, 16)}...</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === "CREDIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {String(tx.type || "")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₦{((Number(tx.amount) || 0) / 100).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{String(tx.status || "")}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{String(tx.narration || "—")}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {tx.createdAt ? new Date(String(tx.createdAt)).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
