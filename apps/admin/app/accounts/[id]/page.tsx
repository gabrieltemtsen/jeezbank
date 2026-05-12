import { redirect } from "next/navigation";
import Link from "next/link";
import Shell from "@/components/Shell";
import DataError from "@/components/DataError";
import { getAdminSession } from "@/lib/auth";
import {
  extractError,
  getAccount,
  getAccountBalance,
  getAccountBeneficiaries,
  getAccountMandates,
  getAccountParties,
  getAccountSignatories,
} from "@/lib/fusecore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { id } = await params;

  let account: any = null;
  let balance: any = null;
  let parties: any[] = [];
  let signatories: any[] = [];
  let mandates: any[] = [];
  let beneficiaries: any[] = [];

  let error: string | null = null;

  try {
    const raw = await getAccount(String(id));
    account = raw?.data ?? raw;
  } catch (err) {
    error = extractError(err);
  }

  // Best-effort secondary data
  if (account) {
    const accountNumber = String(account.accountNumber || account.number || "");
    const numericId = Number(account.id ?? id);

    if (accountNumber) {
      try {
        const raw = await getAccountBalance(accountNumber);
        balance = raw?.data ?? raw;
      } catch {}
    }

    if (!Number.isNaN(numericId)) {
      try {
        const raw = await getAccountParties(numericId);
        const payload: any = raw?.data ?? raw;
        parties = payload?.items ?? payload?.data ?? payload?.parties ?? payload ?? [];
      } catch {}

      try {
        const raw = await getAccountSignatories(numericId);
        const payload: any = raw?.data ?? raw;
        signatories = payload?.items ?? payload?.data ?? payload?.signatories ?? payload ?? [];
      } catch {}

      try {
        const raw = await getAccountMandates(numericId);
        const payload: any = raw?.data ?? raw;
        mandates = payload?.items ?? payload?.data ?? payload?.mandates ?? payload ?? [];
      } catch {}

      try {
        const raw = await getAccountBeneficiaries(numericId);
        const payload: any = raw?.data ?? raw;
        beneficiaries = payload?.items ?? payload?.data ?? payload?.beneficiaries ?? payload ?? [];
      } catch {}
    }
  }

  if (!account) {
    return (
      <Shell role={session.role} name={session.name}>
        <div className="mb-5">
          <Link
            href="/accounts"
            className="inline-flex items-center gap-2 text-sm text-[var(--jmb-text-dim)] hover:text-white transition"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to accounts
          </Link>
        </div>
        {error ? <DataError message={error} /> : null}
        {!error ? (
          <div className="jmb-glass rounded-2xl p-12 text-center">
            <p className="text-[var(--jmb-text-dim)]">Account not found</p>
          </div>
        ) : null}
      </Shell>
    );
  }

  const accountNumber = String(account.accountNumber || account.number || "—");
  const status = String(account.status || account.state || "—");
  const type = String(account.type || account.accountType || "—");
  const customerId = String(account.customerId ?? account.customer?.id ?? "—");

  const bal = Number(account.balance ?? account.availableBalance ?? 0);
  const liveBal = Number(balance?.availableBalance ?? balance?.balance ?? NaN);

  return (
    <Shell role={session.role} name={session.name}>
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm text-[var(--jmb-text-dim)] hover:text-white transition"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to accounts
        </Link>
        <div className="flex items-center gap-2">
          <span className="jmb-pill jmb-pill-mute">{type}</span>
          <span className={`jmb-pill ${status === "ACTIVE" ? "jmb-pill-green" : status === "FROZEN" ? "jmb-pill-amber" : "jmb-pill-mute"}`}>{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="jmb-glass rounded-3xl p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Row label="Account Number" value={accountNumber} mono />
            <Row label="Account ID" value={String(account.id ?? id)} mono />
            <Row label="Customer ID" value={customerId} mono />
            <Row label="Currency" value={String(account.currency ?? "NGN")} />
            <Row label="Balance (snapshot)" value={`₦${(bal / 100).toLocaleString()}`} />
            <Row label="Balance (live)" value={Number.isFinite(liveBal) ? `₦${(liveBal / 100).toLocaleString()}` : "—"} />
            <Row label="Created" value={account.createdAt ? new Date(String(account.createdAt)).toLocaleString() : "—"} />
          </div>
        </section>

        <section className="jmb-glass rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Mandates</h3>
          {mandates.length === 0 ? (
            <div className="text-sm text-[var(--jmb-text-mute)]">No mandates</div>
          ) : (
            <ul className="space-y-2 text-sm text-[var(--jmb-text-dim)]">
              {mandates.slice(0, 8).map((m, i) => (
                <li key={i} className="rounded-xl border border-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{String(m.type || m.mandateType || "MANDATE")}</span>
                    <span className="text-[11px] text-[var(--jmb-text-mute)]">{String(m.status || "—")}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--jmb-text-dim)] truncate">{String(m.description || m.note || "")}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="jmb-glass rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Parties</h3>
          {parties.length === 0 ? (
            <div className="text-sm text-[var(--jmb-text-mute)]">No parties</div>
          ) : (
            <ul className="space-y-1 text-sm text-[var(--jmb-text-dim)]">
              {parties.slice(0, 10).map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="truncate">{String(p.name || `${p.firstName || ""} ${p.lastName || ""}` || "Party")}</span>
                  <span className="text-[11px] text-[var(--jmb-text-mute)]">{String(p.role || p.relationship || "—")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="jmb-glass rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Signatories</h3>
          {signatories.length === 0 ? (
            <div className="text-sm text-[var(--jmb-text-mute)]">No signatories</div>
          ) : (
            <ul className="space-y-1 text-sm text-[var(--jmb-text-dim)]">
              {signatories.slice(0, 10).map((s, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="truncate">{String(s.name || `${s.firstName || ""} ${s.lastName || ""}` || "Signatory")}</span>
                  <span className="text-[11px] text-[var(--jmb-text-mute)]">{String(s.level || s.type || "—")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="jmb-glass rounded-3xl p-6 lg:col-span-3">
          <h3 className="text-sm font-semibold text-white mb-3">Beneficiaries</h3>
          {beneficiaries.length === 0 ? (
            <div className="text-sm text-[var(--jmb-text-mute)]">No beneficiaries</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="jmb-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Bank</th>
                    <th>Account</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.slice(0, 20).map((b, i) => (
                    <tr key={i}>
                      <td className="text-white">{String(b.name || b.beneficiaryName || "—")}</td>
                      <td className="text-[var(--jmb-text-dim)]">{String(b.bankName || b.bankCode || "—")}</td>
                      <td className="text-[var(--jmb-text-dim)] font-mono">{String(b.accountNumber || "—")}</td>
                      <td><span className="jmb-pill jmb-pill-mute">{String(b.type || "—")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="jmb-glass rounded-3xl p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Raw</h3>
            <span className="jmb-chip">JSON</span>
          </div>
          <pre className="mt-3 text-[11px] text-[var(--jmb-text-dim)] overflow-auto max-h-96 rounded-xl p-3 jmb-glass-hi font-mono leading-relaxed">
            {JSON.stringify({ account, balance, parties, signatories, mandates, beneficiaries }, null, 2)}
          </pre>
        </section>
      </div>
    </Shell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl border border-white/5 bg-white/0">
      <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)] shrink-0">{label}</span>
      <span className={`text-sm font-medium text-white text-right truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
