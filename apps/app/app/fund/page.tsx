import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAccount } from "@/lib/fusecore";

export default async function FundPage() {
  const session = await getSession();
  if (!session) redirect("/onboarding");

  let account = null;
  if (session.accountId) {
    try { account = await getAccount(session.accountId); } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0052CC] px-6 pt-12 pb-6">
        <a href="/home" className="text-white mb-4 flex items-center gap-2">← Back</a>
        <h1 className="text-white text-2xl font-bold">Add Money</h1>
      </div>

      <div className="px-6 mt-6 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Bank Transfer</h2>
          <p className="text-sm text-gray-500 mb-4">Transfer to your JeezBank account number from any bank</p>

          <div className="space-y-3">
            {[
              { label: "Account Number", value: account?.accountNumber || "Generating..." },
              { label: "Bank Name", value: "JeezBank (via FuseCore)" },
              { label: "Account Name", value: session.name || "JeezBank User" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full border border-[#0052CC] text-[#0052CC] py-3 rounded-xl font-semibold text-sm">
            Copy Account Number
          </button>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-blue-700 text-sm font-medium">💡 How it works</p>
          <p className="text-blue-600 text-xs mt-1">
            Send money from any Nigerian bank to the account number above. Your balance will be updated within minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
