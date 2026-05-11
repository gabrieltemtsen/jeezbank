import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCustomer } from "@/lib/fusecore";
import Sidebar from "@/components/Sidebar";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { id } = await params;
  let customer: Record<string, unknown> | null = null;

  try {
    const data = await getCustomer(id);
    customer = data.data || data;
  } catch {}

  if (!customer) return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8"><p className="text-gray-500">Customer not found</p></main>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <a href="/customers" className="text-blue-600 text-sm">← Back to Customers</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mb-4">
              {String(customer.firstName || "?")[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{`${customer.firstName} ${customer.lastName}`}</h2>
            <p className="text-gray-500 text-sm">{String(customer.phone || "")}</p>
            <p className="text-gray-500 text-sm">{String(customer.email || "")}</p>

            <div className="mt-4 space-y-2">
              {[
                { label: "Customer ID", value: String(customer.id || "").slice(0, 16) + "..." },
                { label: "KYC Status", value: String(customer.kycStatus || "PENDING") },
                { label: "Status", value: customer.isActive ? "Active" : "Frozen" },
                { label: "Created", value: customer.createdAt ? new Date(String(customer.createdAt)).toLocaleDateString() : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1 border-b border-gray-50 text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions — Manager & Officer only */}
          {(session.role === "MANAGER" || session.role === "OFFICER") && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-amber-50 text-amber-700 border border-amber-200 py-2 rounded-xl text-sm font-medium hover:bg-amber-100">
                  {customer.isActive ? "🔒 Freeze Account" : "🔓 Unfreeze Account"}
                </button>
                <button className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-xl text-sm font-medium hover:bg-blue-100">
                  ✅ Approve KYC
                </button>
                {session.role === "MANAGER" && (
                  <button className="w-full bg-red-50 text-red-700 border border-red-200 py-2 rounded-xl text-sm font-medium hover:bg-red-100">
                    🚨 Flag for AML Review
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Raw data */}
          <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">Raw Data</h3>
            <pre className="text-xs text-gray-600 overflow-auto max-h-48 bg-gray-50 p-3 rounded-xl">
              {JSON.stringify(customer, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
