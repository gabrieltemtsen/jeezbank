import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { repayLoan } from "@/lib/fusecore";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const amount = Number(body.amount);
  const paidBy = body.paidBy || session.name || "admin";
  const channel = body.channel;
  const narration = body.narration;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const data = await repayLoan(id, { amount, paidBy, channel, narration });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
