import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getLoans } from "@/lib/fusecore";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default async function LoansPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  let loans: Record<string, unknown>[] = [];
  try {
    const data = await getLoans({ limit: 50 });
    loans = data.data || data || [];
  } catch {}

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    DISBURSED: "bg-green-100 text-green-700",
    REPAID: "bg-gray-100 text-gray-700",
    DEFAULTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Loans</h1>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Loan ID", "Customer", "Amount", "Status", "Due Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No loans found</td></tr>
              ) : (
                loans.map((loan, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{String(loan.id || "").slice(0, 12)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{String(loan.customerId || "—")}</td>
                    <td className="px-4 py-3 text-sm font-medium">₦{((Number(loan.amount) || 0) / 100).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[String(loan.status)] || "bg-gray-100 text-gray-700"}`}>
                        {String(loan.status || "")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {loan.dueDate ? new Date(String(loan.dueDate)).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/loans/${loan.id}`} className="text-blue-600 text-sm hover:underline">View</Link>
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
