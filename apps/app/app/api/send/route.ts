import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendMoney } from "@/lib/fusecore";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.accountId) return NextResponse.json({ error: "No account linked" }, { status: 400 });

  const { accountNumber, bankCode, amountKobo, narration } = await req.json();
  if (!accountNumber || !bankCode || !amountKobo) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await sendMoney({
      fromAccountId: session.accountId,
      toAccountNumber: accountNumber,
      toBankCode: bankCode,
      amount: amountKobo,
      narration: narration || "Transfer",
      idempotencyKey: randomUUID(),
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    console.error("send error:", err);
    const msg = err instanceof Error ? err.message : "Transfer failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
