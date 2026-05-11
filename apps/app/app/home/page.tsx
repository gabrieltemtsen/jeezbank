import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAccount, getAccountTransactions } from "@/lib/fusecore";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/onboarding");

  let account = null;
  let transactions = [];

  if (session.accountId) {
    try {
      account = await getAccount(session.accountId);
      const txData = await getAccountTransactions(session.accountId, { limit: 5 });
      transactions = txData.data || txData || [];
    } catch {}
  }

  const balance = account?.balance ?? 0;
  const formattedBalance = (balance / 100).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const quickActions = [
    { label: "Send", icon: "↗", href: "/send", color: "bg-blue-100 text-blue-600" },
    { label: "Add Money", icon: "↙", href: "/fund", color: "bg-green-100 text-green-600" },
    { label: "Airtime", icon: "📱", href: "/airtime", color: "bg-purple-100 text-purple-600" },
    { label: "History", icon: "📋", href: "/transactions", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0052CC] px-6 pt-12 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-200 text-sm">Good day,</p>
            <h2 className="text-white font-semibold text-lg">{session.name || "JeezBank User"}</h2>
          </div>
          <Link href="/profile">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {(session.name || "J")[0].toUpperCase()}
            </div>
          </Link>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
          <p className="text-blue-200 text-sm mb-1">Total Balance</p>
          <h1 className="text-white text-3xl font-bold">{formattedBalance}</h1>
          {account?.accountNumber && (
            <p className="text-blue-200 text-xs mt-2">Acc: {account.accountNumber}</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center text-xl`}>
                    {action.icon}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
          <Link href="/transactions" className="text-blue-600 text-sm">See all</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No transactions yet</div>
          ) : (
            transactions.slice(0, 5).map((tx: Record<string, unknown>, i: number) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm
                    ${tx.type === "CREDIT" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                    {tx.type === "CREDIT" ? "↙" : "↗"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{String(tx.narration || "Transaction")}</p>
                    <p className="text-xs text-gray-400">{tx.createdAt ? new Date(String(tx.createdAt)).toLocaleDateString() : ""}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                  {tx.type === "CREDIT" ? "+" : "-"}₦{((Number(tx.amount) || 0) / 100).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
