import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAccount, getAccountTransactions } from "@/lib/fusecore";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Logo, Wordmark } from "@/components/Brand";

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

  const firstName = (session.name || "JMB User").split(" ")[0];
  const initial = (session.name || "J")[0].toUpperCase();

  const quickActions = [
    {
      label: "Send",
      href: "/send",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      ),
    },
    {
      label: "Add",
      href: "/fund",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      ),
    },
    {
      label: "Airtime",
      href: "/airtime",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M11 18h2" />
        </svg>
      ),
    },
    {
      label: "History",
      href: "/transactions",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-10 jmb-page-in">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <Logo size={38} />
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Welcome back</p>
              <p className="text-sm font-semibold text-white">Hey, {firstName} 👋</p>
            </div>
          </div>
          <Link href="/profile" className="relative">
            <div className="w-10 h-10 rounded-2xl jmb-glass-hi flex items-center justify-center text-white font-bold">
              {initial}
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: "var(--jmb-mint)" }} />
          </Link>
        </header>

        {/* Hero balance card */}
        <section className="relative">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-60 jmb-pulse"
               style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative rounded-[26px] overflow-hidden jmb-glass-hi jmb-glow p-6">
            {/* aurora blobs */}
            <span className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-50"
                  style={{ background: "radial-gradient(closest-side, #00d9f5, transparent)" }} />
            <span className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full blur-3xl opacity-50"
                  style={{ background: "radial-gradient(closest-side, #8a5cff, transparent)" }} />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="jmb-chip">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--jmb-mint)" }} />
                  JMB Wallet
                </span>
                <Wordmark size="sm" />
              </div>
              <button className="text-[var(--jmb-text-dim)] hover:text-white transition" aria-label="Hide balance">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <div className="relative mt-5">
              <p className="text-[12px] text-[var(--jmb-text-dim)] tracking-wide">Total balance</p>
              <h1 className="text-white text-[40px] leading-none font-bold mt-2 tracking-tight">
                {formattedBalance}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--jmb-text-dim)]">
                <span className="inline-flex items-center gap-1 text-[var(--jmb-mint)]">
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M12 4l8 12H4z"/></svg>
                  +0.00%
                </span>
                <span>vs last week</span>
              </div>
            </div>

            <div className="relative mt-5 flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Account no</p>
                <p className="text-sm font-semibold text-white mt-0.5 tracking-wider">
                  {account?.accountNumber || "•••• •••• ••"}
                </p>
              </div>
              <Link href="/fund" className="jmb-btn !py-2 !px-4 text-sm">
                Top up
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Quick actions</h3>
            <Link href="/transactions" className="text-xs text-[var(--jmb-cyan)] hover:underline">All services</Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href} className="group">
                <div className="jmb-glass rounded-2xl p-3 flex flex-col items-center gap-2 transition group-hover:bg-white/10 group-active:scale-[0.97]">
                  <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#06121a]"
                        style={{ background: "var(--jmb-grad-primary)" }}>
                    {a.icon}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--jmb-text-dim)] group-hover:text-white">{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Insights strip */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="jmb-glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Inflow</p>
            <p className="mt-1 text-lg font-bold text-white">₦0</p>
            <div className="mt-3 h-1 rounded-full overflow-hidden bg-white/5">
              <div className="h-full w-2/5" style={{ background: "linear-gradient(90deg, #00f5a0, #00d9f5)" }} />
            </div>
          </div>
          <div className="jmb-glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">Outflow</p>
            <p className="mt-1 text-lg font-bold text-white">₦0</p>
            <div className="mt-3 h-1 rounded-full overflow-hidden bg-white/5">
              <div className="h-full w-1/4" style={{ background: "linear-gradient(90deg, #ff5cb0, #8a5cff)" }} />
            </div>
          </div>
        </section>

        {/* Recent transactions */}
        <section className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Recent activity</h3>
            <Link href="/transactions" className="text-xs text-[var(--jmb-cyan)] hover:underline">See all</Link>
          </div>

          <div className="jmb-glass rounded-2xl divide-y divide-white/5 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center jmb-glass-hi mb-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--jmb-text-dim)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="5" width="16" height="14" rx="3"/>
                    <path d="M4 10h16"/>
                  </svg>
                </div>
                <p className="text-sm text-[var(--jmb-text-dim)]">No transactions yet</p>
                <p className="text-xs text-[var(--jmb-text-mute)] mt-1">Top up to start moving money.</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((tx: Record<string, unknown>, i: number) => {
                const isCredit = tx.type === "CREDIT";
                return (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isCredit ? "bg-[rgba(44,214,160,0.12)] text-[var(--jmb-green)]" : "bg-[rgba(255,92,122,0.12)] text-[var(--jmb-red)]"}`}>
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          {isCredit ? <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></> : <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>}
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{String(tx.narration || "Transaction")}</p>
                        <p className="text-[11px] text-[var(--jmb-text-mute)]">
                          {tx.createdAt ? new Date(String(tx.createdAt)).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${isCredit ? "text-[var(--jmb-green)]" : "text-white"}`}>
                      {isCredit ? "+" : "-"}₦{((Number(tx.amount) || 0) / 100).toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
