import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAccount, getAccountBalance, unwrap, extractError } from "@/lib/fusecore";
import { BackBtn, Wordmark } from "@/components/Brand";
import BottomNav from "@/components/BottomNav";
import CopyButton from "@/components/CopyButton";
import DataError from "@/components/DataError";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FundPage() {
  const session = await getSession();
  if (!session) redirect("/onboarding");

  let account: any = null;
  let balance: any = null;
  let fetchError: string | null = null;

  if (session.accountId) {
    try {
      account = unwrap<any>(await getAccount(session.accountId));
      const accountNumber = account?.accountNumber;
      if (accountNumber) {
        try {
          balance = unwrap<any>(await getAccountBalance(String(accountNumber)));
        } catch {
          /* balance is optional; fall back to account.balance */
        }
      }
    } catch (err) {
      fetchError = extractError(err);
      console.error("[app:fund] fetch failed:", fetchError);
    }
  }

  const acctNumber = account?.accountNumber || "Generating...";
  const rawBalance =
    balance?.availableBalance ?? balance?.balance ?? account?.balance ?? 0;
  const formattedBalance = (Number(rawBalance) / 100).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
    <div className="min-h-screen pb-28 jmb-page-in">
      <div className="mx-auto max-w-md px-5 pt-10">
        <header className="flex items-center justify-between mb-6">
          <BackBtn href="/home" />
          <Wordmark size="sm" />
          <div className="w-10" />
        </header>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Add money</h1>
          <p className="text-sm text-[var(--jmb-text-dim)] mt-1">Fund your JMB wallet from any Nigerian bank.</p>
        </div>

        <DataError message={fetchError} />

        <section className="relative">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6">
            <div className="flex items-center justify-between">
              <span className="jmb-chip">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--jmb-mint)" }} />
                Bank transfer
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">via FuseCore</span>
            </div>

            <p className="text-[var(--jmb-text-dim)] text-xs mt-5">Your dedicated JMB account</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[28px] font-bold text-white tracking-wider">{acctNumber}</p>
              <CopyButton value={String(acctNumber)} />
            </div>

            <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
              <Row label="Bank name" value="JeezBank (FuseCore)" />
              <Row label="Account name" value={session.name || "JeezBank User"} />
              <Row label="Current balance" value={formattedBalance} accent />
            </div>
          </div>
        </section>

        <div className="mt-5 jmb-glass rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: "rgba(0,217,245,0.12)", color: "var(--jmb-cyan)" }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">How it works</p>
              <p className="text-xs text-[var(--jmb-text-dim)] mt-1 leading-relaxed">
                Send money from any Nigerian bank to the account number above. Your JMB balance updates within minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[var(--jmb-text-mute)]">{label}</span>
      <span className={`text-sm font-medium ${accent ? "jmb-grad-text font-bold text-base" : "text-white"}`}>{value}</span>
    </div>
  );
}
