"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, Wordmark } from "@/components/Brand";

type Nav = { label: string; href: string; roles: string[]; icon: React.ReactNode };

const I = (path: React.ReactNode) => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const navItems: Nav[] = [
  {
    label: "Dashboard", href: "/dashboard", roles: ["MANAGER", "OFFICER", "CUSTOMER_CARE"],
    icon: I(<><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></>),
  },
  {
    label: "Customers", href: "/customers", roles: ["MANAGER", "OFFICER", "CUSTOMER_CARE"],
    icon: I(<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M19 20c-.4-2.4-1.6-3.7-3.5-4.4"/></>),
  },
  {
    label: "Accounts", href: "/accounts", roles: ["MANAGER", "OFFICER", "CUSTOMER_CARE"],
    icon: I(<><path d="M4 7h16"/><path d="M6 11h12"/><path d="M6 15h12"/><path d="M4 19h16"/></>),
  },
  {
    label: "Transactions", href: "/transactions", roles: ["MANAGER", "OFFICER", "CUSTOMER_CARE"],
    icon: I(<><path d="M4 7h13"/><path d="M14 4l3 3-3 3"/><path d="M20 17H7"/><path d="M10 20l-3-3 3-3"/></>),
  },
  {
    label: "Loans", href: "/loans", roles: ["MANAGER", "OFFICER"],
    icon: I(<><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M10 21v-6h4v6"/></>),
  },
  {
    label: "AML Alerts", href: "/aml", roles: ["MANAGER"],
    icon: I(<><path d="M12 2 1 21h22L12 2z"/><path d="M12 9v5"/><path d="M12 17h.01"/></>),
  },
  {
    label: "Reports", href: "/reports", roles: ["MANAGER"],
    icon: I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>),
  },
  {
    label: "Health", href: "/health", roles: ["MANAGER"],
    icon: I(<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>),
  },
];

export default function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();
  const filtered = navItems.filter((n) => n.roles.includes(role));
  const roleLabel = role.replace("_", " ").toLowerCase();

  return (
    <aside className="w-64 shrink-0 sticky top-0 self-start h-screen flex flex-col">
      {/* glass surface */}
      <div className="m-3 mr-0 flex-1 jmb-glass rounded-3xl flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Logo size={38} />
            <div className="min-w-0">
              <Wordmark size="md" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)] mt-0.5">JMB · Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)]">Workspace</p>
          {filtered.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                  active ? "text-white" : "text-[var(--jmb-text-dim)] hover:text-white hover:bg-white/5"
                }`}
              >
                {active && (
                  <>
                    <span className="absolute inset-0 rounded-xl jmb-glass-hi" />
                    <span className="absolute left-1.5 top-2 bottom-2 w-0.5 rounded-full"
                          style={{ background: "var(--jmb-grad-primary)" }} />
                  </>
                )}
                <span className={`relative ${active ? "text-white" : "text-[var(--jmb-text-dim)] group-hover:text-white"}`}>
                  {item.icon}
                </span>
                <span className="relative font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="jmb-glass-hi rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#06121a] font-bold"
                 style={{ background: "var(--jmb-grad-primary)" }}>
              {name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{name}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)]">{roleLabel}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button title="Sign out"
                      className="w-8 h-8 rounded-lg jmb-glass hover:bg-white/10 transition flex items-center justify-center text-[var(--jmb-text-dim)] hover:text-[var(--jmb-red)]">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <path d="M16 17l5-5-5-5"/>
                  <path d="M21 12H9"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
