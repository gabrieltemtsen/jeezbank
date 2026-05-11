import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getLoan } from "@/lib/fusecore";
import Sidebar from "@/components/Sidebar";

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { id } = await params;
  let loan: Record<string, unknown> | null = null;
  try {
    const data = await getLoan(id);
    loan = data.data || data;
  } catch {}

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <a href="/loans" className="text-blue-600 text-sm mb-6 block">← Back to Loans</a>
        {!loan ? <p className="text-gray-500">Loan not found</p> : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Loan Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Loan ID", String(loan.id || "")],
                  ["Customer ID", String(loan.customerId || "")],
                  ["Amount", `₦${((Number(loan.amount) || 0) / 100).toLocaleString()}`],
                  ["Status", String(loan.status || "")],
                  ["Interest Rate", `${loan.interestRate || 0}%`],
                  ["Due Date", loan.dueDate ? new Date(String(loan.dueDate)).toLocaleDateString() : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="py-2 border-b border-gray-50">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {session.role === "MANAGER" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
                <div className="space-y-2">
                  {loan.status === "PENDING" && (
                    <button className="w-full bg-green-50 text-green-700 border border-green-200 py-2 rounded-xl text-sm font-medium">✅ Approve Loan</button>
                  )}
                  {loan.status === "APPROVED" && (
                    <button className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-xl text-sm font-medium">💸 Disburse Loan</button>
                  )}
                  {loan.status === "PENDING" && (
                    <button className="w-full bg-red-50 text-red-700 border border-red-200 py-2 rounded-xl text-sm font-medium">❌ Reject Loan</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
