import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getLoan } from "@/lib/fusecore";
import Shell from "@/components/Shell";
import Link from "next/link";

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const { id } = await params;
  let loan: Record<string, unknown> | null = null;
  try {
    const data = await getLoan(id);
    loan = data.data || data;
  } catch {}

  const status = String(loan?.status || "");
  const statusPill =
    status === "DISBURSED" ? "jmb-pill-green" :
    status === "APPROVED"  ? "jmb-pill-cyan"  :
    status === "PENDING"   ? "jmb-pill-amber" :
    status === "DEFAULTED" ? "jmb-pill-red"   : "jmb-pill-mute";

  return (
    <Shell role={session.role} name={session.name}>
      <div className="mb-5">
        <Link href="/loans" className="inline-flex items-center gap-2 text-sm text-[var(--jmb-text-dim)] hover:text-white transition">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Back to loans
        </Link>
      </div>

      {!loan ? (
        <div className="jmb-glass rounded-2xl p-12 text-center text-[var(--jmb-text-dim)]">Loan not found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="lg:col-span-2 relative">
            <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-40 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
            <div className="relative jmb-glass-hi jmb-glow rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">Loan details</h2>
                <span className={`jmb-pill ${statusPill}`}>{status || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Loan ID" value={String(loan.id || "")} mono />
                <Field label="Customer ID" value={String(loan.customerId || "")} mono />
                <Field label="Amount" value={`₦${((Number(loan.amount) || 0) / 100).toLocaleString()}`} accent />
                <Field label="Interest rate" value={`${loan.interestRate || 0}%`} />
                <Field label="Due date" value={loan.dueDate ? new Date(String(loan.dueDate)).toLocaleDateString() : "—"} />
                <Field label="Status" value={status || "—"} />
              </div>
            </div>
          </section>

          {session.role === "MANAGER" && (
            <section className="jmb-glass rounded-3xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                {loan.status === "PENDING" && <ActionBtn tone="green" label="Approve loan" icon="check" />}
                {loan.status === "APPROVED" && <ActionBtn tone="cyan"  label="Disburse loan" icon="send" />}
                {loan.status === "PENDING" && <ActionBtn tone="red"   label="Reject loan" icon="x" />}
              </div>
              <p className="text-[11px] text-[var(--jmb-text-mute)] mt-4">All actions are logged for audit.</p>
            </section>
          )}
        </div>
      )}
    </Shell>
  );
}

function Field({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--jmb-text-mute)]">{label}</p>
      <p className={`text-sm font-medium mt-1 ${accent ? "jmb-grad-text text-lg font-bold" : "text-white"} ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ActionBtn({ tone, label, icon }: { tone: "green" | "cyan" | "red"; label: string; icon: "check" | "send" | "x" }) {
  const color = tone === "green" ? "var(--jmb-green)" : tone === "cyan" ? "var(--jmb-cyan)" : "var(--jmb-red)";
  const iconSvg = (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icon === "check" && <path d="M5 12l5 5L20 7"/>}
      {icon === "send"  && <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>}
      {icon === "x"     && <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>}
    </svg>
  );
  return (
    <button
      className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition hover:bg-white/5"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 8%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      <span className="inline-flex items-center gap-3 text-sm font-medium">{iconSvg}{label}</span>
      <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
    </button>
  );
}
