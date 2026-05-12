import { redirect } from "next/navigation";
import Link from "next/link";
import Shell from "@/components/Shell";
import { getAdminSession } from "@/lib/auth";
import { getTransaction, getTransactionReceipt } from "@/lib/fusecore";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { id } = await params;

  let tx: any = null;
  let receipt: any = null;

  try {
    const data = await getTransaction(id);
    tx = data.data ?? data;
  } catch {}

  try {
    const r = await getTransactionReceipt(id);
    receipt = r.data ?? r;
  } catch {}

  if (!tx) {
    return (
      <Shell role={session.role} name={session.name}>
        <div className="jmb-glass rounded-2xl p-12 text-center">
          <p className="text-[var(--jmb-text-dim)]">Transaction not found</p>
          <Link href="/transactions" className="jmb-btn jmb-btn-sm mt-4 inline-flex">
            Back to transactions
          </Link>
        </div>
      </Shell>
    );
  }

  const isCredit = String(tx.type || "").toUpperCase() === "CREDIT";
  const amount = Number(tx.amount || 0);
  const status = String(tx.status || "—");
  const statusPill =
    status === "SUCCESS" || status === "SUCCESSFUL" || status === "COMPLETED"
      ? "jmb-pill-green"
      : status === "PENDING" || status === "PROCESSING"
        ? "jmb-pill-amber"
        : status === "FAILED" || status === "REVERSED"
          ? "jmb-pill-red"
          : "jmb-pill-mute";

  return (
    <Shell role={session.role} name={session.name}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-sm text-[var(--jmb-text-dim)] hover:text-white transition"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to transactions
        </Link>

        <div className="flex items-center gap-2">
          <span className={`jmb-pill ${statusPill}`}>{status}</span>
          <span className={`jmb-pill ${isCredit ? "jmb-pill-green" : "jmb-pill-red"}`}>{isCredit ? "CREDIT" : "DEBIT"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="jmb-glass rounded-3xl p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Transaction</h2>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Row label="ID" value={String(tx.id ?? id)} mono />
            <Row label="Reference" value={String(tx.reference ?? "—")} mono />
            <Row label="Amount" value={`${isCredit ? "+" : "-"}₦${(amount / 100).toLocaleString()}`} />
            <Row label="Channel" value={String(tx.channel ?? "—")} />
            <Row label="Narration" value={String(tx.narration ?? "—")} />
            <Row label="Created" value={tx.createdAt ? new Date(String(tx.createdAt)).toLocaleString() : "—"} />
            <Row label="Source Account" value={String(tx.sourceAccountNumber ?? tx.fromAccountNumber ?? "—")} mono />
            <Row label="Destination Account" value={String(tx.destinationAccountNumber ?? tx.toAccountNumber ?? "—")} mono />
          </div>
        </section>

        <section className="jmb-glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Receipt</h3>
            <span className="jmb-chip">JSON</span>
          </div>
          <pre className="mt-3 text-[11px] text-[var(--jmb-text-dim)] overflow-auto max-h-80 rounded-xl p-3 jmb-glass-hi font-mono leading-relaxed">
            {JSON.stringify(receipt ?? { message: "No receipt available" }, null, 2)}
          </pre>
        </section>

        <section className="jmb-glass rounded-3xl p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Raw</h3>
            <span className="jmb-chip">JSON</span>
          </div>
          <pre className="mt-3 text-[11px] text-[var(--jmb-text-dim)] overflow-auto max-h-96 rounded-xl p-3 jmb-glass-hi font-mono leading-relaxed">
            {JSON.stringify(tx, null, 2)}
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
