"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: "📊", href: "/dashboard", roles: ["MANAGER", "OFFICER", "CUSTOMER_CARE"] },
  { label: "Customers", icon: "👥", href: "/customers", roles: ["MANAGER", "OFFICER", "CUSTOMER_CARE"] },
  { label: "Transactions", icon: "💸", href: "/transactions", roles: ["MANAGER", "OFFICER", "CUSTOMER_CARE"] },
  { label: "Loans", icon: "🏦", href: "/loans", roles: ["MANAGER", "OFFICER"] },
  { label: "AML Alerts", icon: "🚨", href: "/aml", roles: ["MANAGER"] },
  { label: "Reports", icon: "📋", href: "/reports", roles: ["MANAGER"] },
];

export default function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();
  const filtered = navItems.filter((n) => n.roles.includes(role));

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0052CC] rounded-xl flex items-center justify-center text-white font-bold">JB</div>
          <div>
            <p className="text-white font-semibold text-sm">JeezBank</p>
            <p className="text-gray-400 text-xs">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filtered.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active ? "bg-[#0052CC] text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
            {name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-xs font-medium">{name}</p>
            <p className="text-gray-500 text-xs">{role.replace("_", " ")}</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button className="w-full text-gray-400 text-xs hover:text-red-400 transition text-left">Sign out →</button>
        </form>
      </div>
    </aside>
  );
}
