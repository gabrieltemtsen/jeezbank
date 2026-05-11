import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCustomers, getTransactions, getLoans, getAmlAlerts, getHealth } from "@/lib/fusecore";
import Sidebar from "@/components/Sidebar";

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  let stats = { customers: 0, transactions: 0, loans: 0, amlAlerts: 0, health: "unknown" };

  try {
    const [customers, transactions, loans, alerts, health] = await Promise.allSettled([
      getCustomers({ limit: 1 }),
      getTransactions({ limit: 1 }),
      getLoans({ limit: 1 }),
      getAmlAlerts({ limit: 1 }),
      getHealth(),
    ]);

    stats = {
      customers: customers.status === "fulfilled" ? (customers.value?.total || customers.value?.count || 0) : 0,
      transactions: transactions.status === "fulfilled" ? (transactions.value?.total || 0) : 0,
      loans: loans.status === "fulfilled" ? (loans.value?.total || 0) : 0,
      amlAlerts: alerts.status === "fulfilled" ? (alerts.value?.total || 0) : 0,
      health: health.status === "fulfilled" ? "online" : "offline",
    };
  } catch {}

  const cards = [
    { label: "Total Customers", value: stats.customers.toLocaleString(), icon: "👥", color: "bg-blue-50 text-blue-600" },
    { label: "Transactions", value: stats.transactions.toLocaleString(), icon: "💸", color: "bg-green-50 text-green-600" },
    { label: "Active Loans", value: stats.loans.toLocaleString(), icon: "🏦", color: "bg-purple-50 text-purple-600" },
    { label: "AML Alerts", value: stats.amlAlerts.toLocaleString(), icon: "🚨", color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {session.name} · FuseCore:{" "}
            <span className={stats.health === "online" ? "text-green-600" : "text-red-500"}>{stats.health}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-xl mb-4`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-gray-500 text-sm mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "View Customers", href: "/customers" },
              { label: "Monitor Transactions", href: "/transactions" },
              { label: "Review Loans", href: "/loans" },
              { label: "AML Queue", href: "/aml" },
            ].map((a) => (
              <a key={a.label} href={a.href}
                className="border border-gray-200 rounded-xl p-3 text-sm text-center text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition">
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
