import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getCustomer,
  getCustomerDocuments,
  unwrap,
  unwrapList,
  extractError,
} from "@/lib/fusecore";
import { BackBtn, Wordmark } from "@/components/Brand";
import BottomNav from "@/components/BottomNav";
import DataError from "@/components/DataError";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/onboarding");

  let customer: any = null;
  let documents: any[] = [];
  let fetchError: string | null = null;

  if (session.customerId) {
    try {
      customer = unwrap<any>(await getCustomer(session.customerId));
    } catch (err) {
      fetchError = extractError(err);
    }
    try {
      const raw = await getCustomerDocuments(session.customerId);
      const { items } = unwrapList<any>(raw);
      documents = items;
    } catch {
      /* documents are optional */
    }
  }

  const tierLabels = ["Unverified", "Basic KYC", "Full KYC"];
  const tierTone = ["var(--jmb-red)", "var(--jmb-amber)", "var(--jmb-mint)"];
  const tierIdx = Math.max(0, Math.min(2, session.kycTier ?? 0));

  const items = [
    {
      label: "Security", desc: "Passcode, biometrics, devices",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
        </svg>
      ),
    },
    {
      label: "Notifications", desc: "Alerts and preferences",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/>
        </svg>
      ),
    },
    {
      label: "Help & Support", desc: "FAQs and live chat",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .7-1 1.7"/><path d="M12 17h.01"/>
        </svg>
      ),
    },
    {
      label: "About JeezBank", desc: "JMB · v1.0",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h1v4h1"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-28 jmb-page-in">
      <div className="mx-auto max-w-md px-5 pt-10">
        <header className="flex items-center justify-between mb-6">
          <BackBtn href="/home" />
          <Wordmark size="sm" />
          <div className="w-10" />
        </header>

        <DataError message={fetchError} />

        {/* Profile hero */}
        <section className="relative">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[#06121a] text-2xl font-bold"
                   style={{ background: "var(--jmb-grad-primary)" }}>
                {(session.name || "J")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{session.name || "JMB User"}</h1>
                <p className="text-sm text-[var(--jmb-text-dim)]">{customer?.email || session.phone}</p>
                <span className="jmb-chip mt-2" style={{ color: tierTone[tierIdx] }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tierTone[tierIdx] }} />
                  {tierLabels[tierIdx]}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Account details */}
        <section className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)] mb-2 px-1">Account</p>
          <div className="jmb-glass rounded-2xl divide-y divide-white/5 overflow-hidden">
            <Row label="Phone" value={String(customer?.phone || session.phone || "—")} />
            <Row label="Email" value={String(customer?.email || "—")} />
            <Row label="Customer ID" value={session.customerId ? `${session.customerId.slice(0, 12)}…` : "—"} mono />
            <Row label="Account ID" value={session.accountId ? `${session.accountId.slice(0, 12)}…` : "—"} mono />
            <Row label="Tier" value={tierLabels[tierIdx]} />
          </div>
        </section>

        {/* Documents */}
        <section className="mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)]">Documents</p>
            <span className="text-[11px] text-[var(--jmb-text-mute)]">{documents.length} on file</span>
          </div>
          <div className="jmb-glass rounded-2xl divide-y divide-white/5 overflow-hidden">
            {documents.length === 0 ? (
              <div className="p-5 text-center text-xs text-[var(--jmb-text-mute)]">No documents uploaded yet.</div>
            ) : (
              documents.slice(0, 6).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-xl jmb-glass-hi flex items-center justify-center text-[var(--jmb-text-dim)]">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{String(d.type || "Document")}</p>
                      <p className="text-[11px] text-[var(--jmb-text-mute)] truncate">{String(d.filename || d.url || "")}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--jmb-text-mute)]">{String(d.status || "")}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Settings */}
        <section className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)] mb-2 px-1">Settings</p>
          <div className="jmb-glass rounded-2xl divide-y divide-white/5 overflow-hidden">
            {items.map(({ label, desc, icon }) => (
              <button key={label} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center jmb-glass-hi text-white">
                    {icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-[11px] text-[var(--jmb-text-mute)]">{desc}</p>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[var(--jmb-text-mute)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            ))}
          </div>
        </section>

        <form action="/api/auth/logout" method="POST" className="mt-6">
          <button type="submit"
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm transition"
                  style={{
                    color: "var(--jmb-red)",
                    background: "rgba(255,92,122,0.06)",
                    border: "1px solid rgba(255,92,122,0.22)",
                  }}>
            Log out
          </button>
        </form>

        <p className="text-center text-[11px] text-[var(--jmb-text-mute)] mt-6">
          <Wordmark size="sm" /> · JMB · Secured by FuseCore
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center p-4">
      <span className="text-sm text-[var(--jmb-text-dim)]">{label}</span>
      <span className={`text-sm font-medium text-white truncate ml-3 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
