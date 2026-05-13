import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getTransaction,
  getTransactionReceipt,
  unwrap,
  extractError,
} from "@/lib/fusecore";
import { BackBtn, Wordmark } from "@/components/Brand";
import BottomNav from "@/components/BottomNav";
import DataError from "@/components/DataError";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/onboarding");

  const { id } = await params;
  let tx: any = null;
  let receipt: any = null;
  let fetchError: string | null = null;

  try {
    tx = unwrap<any>(await getTransaction(id));
    try {
      receipt = unwrap<any>(await getTransactionReceipt(id));
    } catch {
      /* receipt is optional */
    }
  } catch (err) {
    fetchError = extractError(err);
    console.error(`[app:transaction:${id}] fetch failed:`, fetchError);
  }

  const isCredit = String(tx?.type || "").toUpperCase() === "CREDIT";
  const status = String(tx?.status || "");
  const statusPill =
    status === "SUCCESS" || status === "SUCCESSFUL" || status === "COMPLETED"
      ? "var(--jmb-green)"
      : status === "PENDING" || status === "PROCESSING"
      ? "var(--jmb-amber)"
      : status === "FAILED" || status === "REVERSED"
      ? "var(--jmb-red)"
      : "var(--jmb-text-dim)";

  return (
    <div className="min-h-screen pb-28 jmb-page-in">
      <div className="mx-auto max-w-md px-5 pt-10">
        <header className="flex items-center justify-between mb-6">
          <BackBtn href="/transactions" />
          <Wordmark size="sm" />
          <div className="w-10" />
        </header>

        <DataError message={fetchError} />

        {!tx ? (
          <div className="jmb-glass rounded-3xl p-12 text-center text-[var(--jmb-text-dim)]">
            {fetchError ? "Couldn't load this transaction." : "Transaction not found."}
            <div className="mt-4">
              <Link href="/transactions" className="jmb-btn-ghost jmb-btn-sm">Back to activity</Link>
            </div>
          </div>
        ) : (
          <>
            {/* Hero: amount + status */}
            <section className="relative mb-5">
              <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
              <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6 text-center">
                <div
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
                  style={{
                    background: isCredit ? "rgba(44,214,160,0.12)" : "rgba(255,92,122,0.12)",
                    color: isCredit ? "var(--jmb-green)" : "var(--jmb-red)",
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    {isCredit ? <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></> : <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>}
                  </svg>
                </div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)] mt-4">
                  {isCredit ? "Money in" : "Money out"}
                </p>
                <h1 className="text-[36px] leading-none font-bold text-white mt-2">
                  {isCredit ? "+" : "-"}₦{((Number(tx.amount) || 0) / 100).toLocaleString()}
                </h1>
                <div className="mt-3 inline-flex">
                  <span
                    className="jmb-pill"
                    style={{
                      color: statusPill,
                      background: `color-mix(in srgb, ${statusPill} 10%, transparent)`,
                      borderColor: `color-mix(in srgb, ${statusPill} 25%, transparent)`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusPill }} />
                    {status || "—"}
                  </span>
                </div>
                {tx.narration && (
                  <p className="text-sm text-[var(--jmb-text-dim)] mt-3">{String(tx.narration)}</p>
                )}
              </div>
            </section>

            {/* Details */}
            <section className="jmb-glass rounded-2xl p-5 mb-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)] mb-3">Details</p>
              <div className="divide-y divide-white/5">
                <Detail label="Reference" value={String(tx.reference || tx.id || "—")} mono />
                <Detail label="Type" value={String(tx.type || "—")} />
                <Detail label="From account" value={String(tx.sourceAccountNumber || tx.fromAccountNumber || "—")} mono />
                <Detail label="To account" value={String(tx.destinationAccountNumber || tx.toAccountNumber || "—")} mono />
                {tx.toBankCode && <Detail label="Beneficiary bank" value={String(tx.toBankName || tx.toBankCode)} />}
                <Detail
                  label="Date"
                  value={tx.createdAt ? new Date(String(tx.createdAt)).toLocaleString() : "—"}
                />
              </div>
            </section>

            {receipt && (
              <section className="jmb-glass rounded-2xl p-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)]">Receipt</p>
                  <span className="jmb-chip">FuseCore</span>
                </div>
                <pre className="text-[11px] text-[var(--jmb-text-dim)] overflow-auto max-h-72 rounded-xl p-3 jmb-glass-hi font-mono leading-relaxed">
                  {JSON.stringify(receipt, null, 2)}
                </pre>
              </section>
            )}

            <Link href="/send" className="jmb-btn w-full">
              Send again
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
            </Link>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-xs text-[var(--jmb-text-mute)]">{label}</span>
      <span className={`text-sm text-white ${mono ? "font-mono text-xs" : "font-medium"}`}>{value}</span>
    </div>
  );
}
