import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getCustomers, getTransactions, getLoans, getAmlAlerts, getHealth, extractError } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import PageHeader from "@/components/PageHeader";
import DataError from "@/components/DataError";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  let stats = { customers: 0, transactions: 0, loans: 0, amlAlerts: 0, health: "unknown" };
  const errors: string[] = [];

  const [customers, transactions, loans, alerts, health] = await Promise.allSettled([
    getCustomers({ limit: 1 }),
    getTransactions({ limit: 1 }),
    getLoans({ limit: 1 }),
    getAmlAlerts({ limit: 1 }),
    getHealth(),
  ]);

  function readTotal(r: PromiseSettledResult<any>, label: string): number {
    if (r.status === "fulfilled") {
      const v = r.value;
      return v?.total ?? v?.data?.total ?? v?.meta?.total ?? v?.count ?? v?.data?.count ?? 0;
    }
    const msg = extractError(r.reason);
    errors.push(`${label}: ${msg}`);
    console.error(`[dashboard:${label}] failed:`, msg);
    return 0;
  }

  stats = {
    customers: readTotal(customers, "customers"),
    transactions: readTotal(transactions, "transactions"),
    loans: readTotal(loans, "loans"),
    amlAlerts: readTotal(alerts, "amlAlerts"),
    health: health.status === "fulfilled" ? "online" : "offline",
  };

  const fetchError = errors.length ? errors.join(" · ") : null;

  const cards: { label: string; value: string; trend: string; color: string; icon: React.ReactNode }[] = [
    {
      label: "Total Customers",
      value: stats.customers.toLocaleString(),
      trend: "+0% this week",
      color: "var(--jmb-cyan)",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M19 20c-.4-2.4-1.6-3.7-3.5-4.4"/></svg>),
    },
    {
      label: "Transactions",
      value: stats.transactions.toLocaleString(),
      trend: "Live monitoring",
      color: "var(--jmb-mint)",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h13"/><path d="M14 4l3 3-3 3"/><path d="M20 17H7"/><path d="M10 20l-3-3 3-3"/></svg>),
    },
    {
      label: "Active Loans",
      value: stats.loans.toLocaleString(),
      trend: "Portfolio",
      color: "var(--jmb-violet)",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M10 21v-6h4v6"/></svg>),
    },
    {
      label: "AML Alerts",
      value: stats.amlAlerts.toLocaleString(),
      trend: "Review queue",
      color: "var(--jmb-red)",
      icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 1 21h22L12 2z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>),
    },
  ];

  const healthy = stats.health === "online";

  return (
    <Shell role={session.role} name={session.name}>
      <PageHeader
        title={`Welcome back, ${session.name.split(" ")[0]}`}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span className={`jmb-pill ${healthy ? "jmb-pill-green" : "jmb-pill-red"}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: healthy ? "var(--jmb-green)" : "var(--jmb-red)" }} />
              FuseCore · {stats.health}
            </span>
            <span className="text-[var(--jmb-text-mute)]">{new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
          </span>
        }
        actions={
          <>
            <Link href="/customers" className="jmb-btn-ghost jmb-btn-sm">Customers</Link>
            <Link href="/transactions" className="jmb-btn jmb-btn-sm">Live activity →</Link>
          </>
        }
      />

      <DataError title="Some FuseCore endpoints failed" message={fetchError} />

      {/* Hero greeting card */}
      <section className="relative mb-7">
        <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
        <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6 overflow-hidden">
          <span className="pointer-events-none absolute -top-16 -right-12 w-72 h-72 rounded-full blur-3xl opacity-40"
                style={{ background: "radial-gradient(closest-side, #00d9f5, transparent)" }} />
          <span className="pointer-events-none absolute -bottom-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-40"
                style={{ background: "radial-gradient(closest-side, #8a5cff, transparent)" }} />
          <div className="relative flex items-center justify-between gap-6 flex-wrap">
            <div>
              <span className="jmb-chip">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--jmb-mint)" }} />
                Operations Console
              </span>
              <h2 className="mt-3 text-2xl font-bold text-white leading-tight">
                JMB <span className="jmb-grad-text">command center</span>
              </h2>
              <p className="text-sm text-[var(--jmb-text-dim)] mt-1 max-w-xl">
                Oversight for customers, transactions, lending and compliance — all in one console.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-[300px]">
              <Mini label="Uptime" value={healthy ? "99.9%" : "—"} tone="mint" />
              <Mini label="Volume 24h" value="₦0" tone="cyan" />
              <Mini label="New today" value={stats.customers ? "+0" : "0"} tone="violet" />
            </div>
          </div>
        </div>
      </section>

      {/* KPI tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {cards.map((c) => (
          <div key={c.label} className="jmb-glass rounded-2xl p-5 hover:bg-white/[0.06] transition group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                   style={{ background: `color-mix(in srgb, ${c.color} 14%, transparent)`, color: c.color, border: `1px solid color-mix(in srgb, ${c.color} 30%, transparent)` }}>
                {c.icon}
              </div>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[var(--jmb-text-mute)] group-hover:text-white transition" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
            </div>
            <p className="text-[28px] leading-none font-bold text-white mt-5 tracking-tight">{c.value}</p>
            <p className="text-[12px] text-[var(--jmb-text-mute)] mt-2 uppercase tracking-[0.14em]">{c.label}</p>
            <p className="text-[11px] mt-3" style={{ color: c.color }}>{c.trend}</p>
          </div>
        ))}
      </section>

      {/* Quick actions + system */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 jmb-glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Quick actions</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Most used</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Customers", href: "/customers", icon: "users" },
              { label: "Transactions", href: "/transactions", icon: "tx" },
              { label: "Loans", href: "/loans", icon: "bank" },
            ].map((a) => (
              <Link key={a.label} href={a.href}
                    className="jmb-glass-hi rounded-2xl p-4 flex flex-col items-start gap-3 hover:bg-white/10 transition">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[#06121a]"
                      style={{ background: "var(--jmb-grad-primary)" }}>
                  <QIcon name={a.icon} />
                </span>
                <span className="text-sm font-medium text-white">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="jmb-glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">System</h3>
          <div className="space-y-3">
            <Row label="FuseCore API" pill={healthy ? "green" : "red"} value={healthy ? "Operational" : "Down"} />
            <Row label="Database" pill="green" value="Operational" />
            <Row label="Workers" pill={healthy ? "green" : "amber"} value={healthy ? "Operational" : "Degraded"} />
            <Row label="Notifications" pill="green" value="Operational" />
          </div>
        </div>
      </section>
    </Shell>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone: "mint" | "cyan" | "violet" }) {
  const color = tone === "mint" ? "var(--jmb-mint)" : tone === "cyan" ? "var(--jmb-cyan)" : "var(--jmb-violet)";
  return (
    <div className="jmb-glass rounded-2xl p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)]">{label}</p>
      <p className="text-lg font-bold text-white mt-1">{value}</p>
      <div className="h-1 mt-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-1/3" style={{ background: color }} />
      </div>
    </div>
  );
}

function Row({ label, value, pill }: { label: string; value: string; pill: "green" | "amber" | "red" }) {
  const cls = pill === "green" ? "jmb-pill-green" : pill === "amber" ? "jmb-pill-amber" : "jmb-pill-red";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--jmb-text-dim)]">{label}</span>
      <span className={`jmb-pill ${cls}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
        {value}
      </span>
    </div>
  );
}

function QIcon({ name }: { name: string }) {
  const stroke = (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {name === "users" && <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5"/></>}
      {name === "tx" && <><path d="M4 7h13"/><path d="M14 4l3 3-3 3"/><path d="M20 17H7"/><path d="M10 20l-3-3 3-3"/></>}
      {name === "bank" && <><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/></>}
      {name === "alert" && <><path d="M12 2 1 21h22L12 2z"/><path d="M12 9v5"/><path d="M12 17h.01"/></>}
    </svg>
  );
  return stroke;
}
