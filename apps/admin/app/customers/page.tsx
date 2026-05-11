import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCustomers } from "@/lib/fusecore";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let customers: Record<string, unknown>[] = [];
  let total = 0;

  try {
    const data = await getCustomers({ limit, offset, search: params.search });
    customers = data.data || data.customers || data || [];
    total = data.total || customers.length;
  } catch {}

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500 text-sm">{total} total customers</p>
          </div>
          <form className="flex gap-2">
            <input name="search" defaultValue={params.search} placeholder="Search customers..."
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
            <button className="bg-[#0052CC] text-white px-4 py-2 rounded-xl text-sm font-medium">Search</button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Phone", "Email", "KYC Status", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No customers found</td></tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {`${String(c.firstName || "")} ${String(c.lastName || "")}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{String(c.phone || "—")}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{String(c.email || "—")}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {String(c.kycStatus || "PENDING")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {c.isActive ? "Active" : "Frozen"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/customers/${c.id}`} className="text-blue-600 text-sm hover:underline">View</Link>
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
