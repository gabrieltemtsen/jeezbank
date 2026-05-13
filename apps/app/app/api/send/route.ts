import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getAccount,
  internalTransfer,
  outboundTransfer,
  extractError,
} from "@/lib/fusecore";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.accountId) return NextResponse.json({ error: "No account linked" }, { status: 400 });

  const body = await req.json();
  const { accountNumber, bankCode, amountKobo, narration } = body as {
    accountNumber?: string;
    bankCode?: string;
    amountKobo?: number;
    narration?: string;
  };

  if (!accountNumber || !bankCode || !amountKobo) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (amountKobo < 100) {
    return NextResponse.json({ error: "Minimum transfer is ₦1" }, { status: 422 });
  }

  try {
    // Resolve sender's accountNumber from accountId
    const acct = await getAccount(session.accountId);
    const me = acct?.data ?? acct;
    const fromAccountNumber: string = String(me?.accountNumber || "");
    if (!fromAccountNumber) {
      return NextResponse.json(
        { error: "Your JMB account number isn't ready yet. Try again shortly." },
        { status: 503 }
      );
    }

    const reference = randomUUID();

    // FuseCore exposes /transactions/transfer for in-bank. For outbound NIP we
    // attempt the external endpoint and gracefully fall back. We treat any
    // JMB-FuseCore deployment as "in-bank" — adjust this once outbound is live.
    const isJmbBank = bankCode === "JMB" || bankCode === "999099"; // tweak when JMB has a real code
    let result;

    if (isJmbBank) {
      result = await internalTransfer({
        fromAccountNumber,
        toAccountNumber: accountNumber,
        amount: amountKobo,
        narration: narration || "JMB transfer",
        initiatedBy: session.userId,
        reference,
      });
    } else {
      result = await outboundTransfer({
        fromAccountNumber,
        toAccountNumber: accountNumber,
        toBankCode: bankCode,
        amount: amountKobo,
        narration: narration || "JMB transfer",
        idempotencyKey: reference,
      });
    }

    return NextResponse.json({ success: true, data: result, reference });
  } catch (err) {
    const msg = extractError(err);
    console.error("[send] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
