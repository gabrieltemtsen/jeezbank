import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { rejectLoan } from "@/lib/fusecore";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const rejectedBy = body.rejectedBy || session.name || "admin";
  const reason = body.reason || "Rejected by admin";
  const notes = body.notes;

  try {
    const data = await rejectLoan(id, { rejectedBy, reason, notes });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
